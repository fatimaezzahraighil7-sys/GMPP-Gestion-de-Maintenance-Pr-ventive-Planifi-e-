package com.gmpp.service;

import com.gmpp.dto.InterventionRequest;
import com.gmpp.dto.InterventionResponse;
import com.gmpp.dto.TerminerInterventionRequest;
import com.gmpp.entity.Intervention;
import com.gmpp.entity.Machine;
import com.gmpp.entity.PointMaintenance;
import com.gmpp.entity.Utilisateur;
import com.gmpp.enums.*;
import com.gmpp.exception.BusinessException;
import com.gmpp.mapper.InterventionMapper;
import com.gmpp.repository.InterventionRepository;
import com.gmpp.repository.MachineRepository;
import com.gmpp.repository.PointMaintenanceRepository;
import com.gmpp.repository.UtilisateurRepository;
import com.gmpp.service.impl.InterventionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterventionServiceTest {

    @Mock private InterventionRepository interventionRepository;
    @Mock private MachineRepository machineRepository;
    @Mock private PointMaintenanceRepository pointMaintenanceRepository;
    @Mock private UtilisateurRepository utilisateurRepository;
    @Mock private InterventionMapper interventionMapper;
    @Mock private PointMaintenanceService pointMaintenanceService;

    @InjectMocks private InterventionServiceImpl interventionService;

    private Machine machine;
    private Intervention intervention;
    private UUID machineId, interventionId;

    @BeforeEach
    void setUp() {
        machineId = UUID.randomUUID();
        interventionId = UUID.randomUUID();
        machine = Machine.builder().id(machineId).nom("Machine Test").build();
        intervention = Intervention.builder()
                .id(interventionId).datePlanifiee(LocalDateTime.now().plusDays(1))
                .statut(StatutIntervention.PLANIFIEE).machine(machine).build();
    }

    @Test
    void testPlanifier() {
        InterventionRequest request = InterventionRequest.builder()
                .datePlanifiee(LocalDateTime.now().plusDays(1)).machineId(machineId).build();

        when(machineRepository.findById(machineId)).thenReturn(Optional.of(machine));
        when(interventionRepository.save(any(Intervention.class))).thenReturn(intervention);
        when(interventionMapper.toResponse(any())).thenReturn(InterventionResponse.builder()
                .id(interventionId).statut(StatutIntervention.PLANIFIEE).build());

        InterventionResponse result = interventionService.planifier(request);

        assertThat(result.getStatut()).isEqualTo(StatutIntervention.PLANIFIEE);
        verify(interventionRepository).save(any(Intervention.class));
    }

    @Test
    void testDemarrer() {
        when(interventionRepository.findById(interventionId)).thenReturn(Optional.of(intervention));
        when(interventionRepository.save(any())).thenReturn(intervention);
        when(interventionMapper.toResponse(any())).thenReturn(
                InterventionResponse.builder().statut(StatutIntervention.EN_COURS).build());

        InterventionResponse result = interventionService.demarrer(interventionId);

        assertThat(result.getStatut()).isEqualTo(StatutIntervention.EN_COURS);
    }

    @Test
    void testDemarrer_InvalidStatut() {
        intervention.setStatut(StatutIntervention.TERMINEE);
        when(interventionRepository.findById(interventionId)).thenReturn(Optional.of(intervention));

        assertThatThrownBy(() -> interventionService.demarrer(interventionId))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void testTerminer() {
        intervention.setStatut(StatutIntervention.EN_COURS);
        TerminerInterventionRequest request = TerminerInterventionRequest.builder()
                .observations("OK").etatConstate(EtatConstate.NORMAL)
                .dureeMinutes(120).signatureTechnicien(true).build();

        when(interventionRepository.findById(interventionId)).thenReturn(Optional.of(intervention));
        when(interventionRepository.save(any())).thenReturn(intervention);
        when(interventionMapper.toResponse(any())).thenReturn(
                InterventionResponse.builder().statut(StatutIntervention.TERMINEE).build());

        InterventionResponse result = interventionService.terminer(interventionId, request);

        assertThat(result.getStatut()).isEqualTo(StatutIntervention.TERMINEE);
    }

    @Test
    void testDetecterRetards() {
        List<Intervention> retards = List.of(intervention);
        when(interventionRepository.findInterventionsEnRetard(any(LocalDateTime.class))).thenReturn(retards);
        when(interventionRepository.save(any())).thenReturn(intervention);

        interventionService.detecterInterventionsEnRetard();

        verify(interventionRepository).save(any(Intervention.class));
    }

    @Test
    void testGetCalendar() {
        when(interventionRepository.findForCalendar(any(), any())).thenReturn(Collections.emptyList());

        var result = interventionService.getCalendar(
                java.time.LocalDate.now(), java.time.LocalDate.now().plusDays(30));

        assertThat(result).isEmpty();
    }
}

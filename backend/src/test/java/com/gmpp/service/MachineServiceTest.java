package com.gmpp.service;

import com.gmpp.dto.MachineRequest;
import com.gmpp.dto.MachineResponse;
import com.gmpp.dto.MachineStatsResponse;
import com.gmpp.entity.Machine;
import com.gmpp.enums.StatutMachine;
import com.gmpp.enums.TypeMachine;
import com.gmpp.exception.BusinessException;
import com.gmpp.exception.ResourceNotFoundException;
import com.gmpp.mapper.InterventionMapper;
import com.gmpp.mapper.MachineMapper;
import com.gmpp.repository.InterventionRepository;
import com.gmpp.repository.MachineRepository;
import com.gmpp.service.impl.MachineServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MachineServiceTest {

    @Mock private MachineRepository machineRepository;
    @Mock private InterventionRepository interventionRepository;
    @Mock private MachineMapper machineMapper;
    @Mock private InterventionMapper interventionMapper;

    @InjectMocks private MachineServiceImpl machineService;

    private Machine machine;
    private MachineRequest machineRequest;
    private MachineResponse machineResponse;
    private UUID machineId;

    @BeforeEach
    void setUp() {
        machineId = UUID.randomUUID();
        machine = Machine.builder()
                .id(machineId).nom("Presse PH-200").typeMachine(TypeMachine.HYDRAULIQUE)
                .numeroSerie("HYD-001").statut(StatutMachine.EN_SERVICE)
                .compteurHoraire(1000.0).build();

        machineRequest = MachineRequest.builder()
                .nom("Presse PH-200").typeMachine(TypeMachine.HYDRAULIQUE)
                .numeroSerie("HYD-001").build();

        machineResponse = MachineResponse.builder()
                .id(machineId).nom("Presse PH-200").typeMachine(TypeMachine.HYDRAULIQUE)
                .numeroSerie("HYD-001").statut(StatutMachine.EN_SERVICE).build();
    }

    @Test
    void testCreateMachine() {
        when(machineRepository.findByNumeroSerie("HYD-001")).thenReturn(Optional.empty());
        when(machineMapper.toEntity(machineRequest)).thenReturn(machine);
        when(machineRepository.save(any(Machine.class))).thenReturn(machine);
        when(machineMapper.toResponse(machine)).thenReturn(machineResponse);

        MachineResponse result = machineService.create(machineRequest);

        assertThat(result).isNotNull();
        assertThat(result.getNom()).isEqualTo("Presse PH-200");
        verify(machineRepository).save(any(Machine.class));
    }

    @Test
    void testCreateMachine_DuplicateNumeroSerie() {
        when(machineRepository.findByNumeroSerie("HYD-001")).thenReturn(Optional.of(machine));

        assertThatThrownBy(() -> machineService.create(machineRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("HYD-001");
    }

    @Test
    void testUpdateStatut() {
        when(machineRepository.findById(machineId)).thenReturn(Optional.of(machine));
        when(machineRepository.save(any(Machine.class))).thenReturn(machine);
        when(machineMapper.toResponse(any(Machine.class))).thenReturn(machineResponse);

        MachineResponse result = machineService.updateStatut(machineId, StatutMachine.EN_MAINTENANCE);

        assertThat(result).isNotNull();
        verify(machineRepository).save(machine);
    }

    @Test
    void testDeleteMachine_NotFound() {
        when(machineRepository.findById(machineId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> machineService.delete(machineId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void testGetMachinesStats() {
        when(machineRepository.count()).thenReturn(6L);
        when(machineRepository.countByStatut(any())).thenReturn(2L);

        MachineStatsResponse stats = machineService.getMachinesStats();

        assertThat(stats.getTotalMachines()).isEqualTo(6);
        assertThat(stats.getCountByStatut()).hasSize(4);
    }

    @Test
    void testUpdateCompteurHoraire_CannotDecrease() {
        when(machineRepository.findById(machineId)).thenReturn(Optional.of(machine));

        assertThatThrownBy(() -> machineService.updateCompteurHoraire(machineId, 500.0))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("diminuer");
    }
}

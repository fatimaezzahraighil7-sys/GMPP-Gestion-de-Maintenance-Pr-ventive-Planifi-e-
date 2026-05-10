package com.gmpp.service;

import com.gmpp.entity.PointMaintenance;
import com.gmpp.entity.Machine;
import com.gmpp.enums.Frequence;
import com.gmpp.enums.TypeMachine;
import com.gmpp.enums.TypeOperation;
import com.gmpp.mapper.PointMaintenanceMapper;
import com.gmpp.repository.MachineRepository;
import com.gmpp.repository.PointMaintenanceRepository;
import com.gmpp.service.impl.PointMaintenanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PointMaintenanceServiceTest {

    @Mock private PointMaintenanceRepository pointMaintenanceRepository;
    @Mock private MachineRepository machineRepository;
    @Mock private PointMaintenanceMapper mapper;

    @InjectMocks private PointMaintenanceServiceImpl service;

    private PointMaintenance point;
    private UUID pointId;

    @BeforeEach
    void setUp() {
        pointId = UUID.randomUUID();
        point = PointMaintenance.builder()
                .id(pointId).typeOperation(TypeOperation.GRAISSAGE)
                .frequence(Frequence.HEBDOMADAIRE)
                .prochaineIntervention(LocalDate.now().plusDays(7))
                .machine(Machine.builder().id(UUID.randomUUID()).nom("Test").build())
                .build();
    }

    @Test
    void testCalculateProchaineIntervention_Quotidienne() {
        point.setFrequence(Frequence.QUOTIDIENNE);
        when(pointMaintenanceRepository.findById(pointId)).thenReturn(Optional.of(point));

        LocalDate result = service.calculateProchaineIntervention(pointId, LocalDate.of(2024, 1, 1));

        assertThat(result).isEqualTo(LocalDate.of(2024, 1, 2));
    }

    @Test
    void testCalculateProchaineIntervention_Hebdomadaire() {
        point.setFrequence(Frequence.HEBDOMADAIRE);
        when(pointMaintenanceRepository.findById(pointId)).thenReturn(Optional.of(point));

        LocalDate result = service.calculateProchaineIntervention(pointId, LocalDate.of(2024, 1, 1));

        assertThat(result).isEqualTo(LocalDate.of(2024, 1, 8));
    }

    @Test
    void testCalculateProchaineIntervention_Mensuelle() {
        point.setFrequence(Frequence.MENSUELLE);
        when(pointMaintenanceRepository.findById(pointId)).thenReturn(Optional.of(point));

        LocalDate result = service.calculateProchaineIntervention(pointId, LocalDate.of(2024, 1, 15));

        assertThat(result).isEqualTo(LocalDate.of(2024, 2, 15));
    }

    @Test
    void testCalculateProchaineIntervention_Trimestrielle() {
        point.setFrequence(Frequence.TRIMESTRIELLE);
        when(pointMaintenanceRepository.findById(pointId)).thenReturn(Optional.of(point));

        LocalDate result = service.calculateProchaineIntervention(pointId, LocalDate.of(2024, 1, 1));

        assertThat(result).isEqualTo(LocalDate.of(2024, 4, 1));
    }

    @Test
    void testCalculateProchaineIntervention_Annuelle() {
        point.setFrequence(Frequence.ANNUELLE);
        when(pointMaintenanceRepository.findById(pointId)).thenReturn(Optional.of(point));

        LocalDate result = service.calculateProchaineIntervention(pointId, LocalDate.of(2024, 6, 1));

        assertThat(result).isEqualTo(LocalDate.of(2025, 6, 1));
    }

    @Test
    void testGetPointsEnRetard() {
        when(pointMaintenanceRepository.findPointsEnRetard(any(LocalDate.class)))
                .thenReturn(Collections.emptyList());
        when(mapper.toResponseList(any())).thenReturn(Collections.emptyList());

        var result = service.getPointsEnRetard();

        assertThat(result).isEmpty();
        verify(pointMaintenanceRepository).findPointsEnRetard(any(LocalDate.class));
    }
}

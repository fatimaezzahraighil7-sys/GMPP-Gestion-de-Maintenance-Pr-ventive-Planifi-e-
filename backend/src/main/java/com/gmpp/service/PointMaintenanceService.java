package com.gmpp.service;

import com.gmpp.dto.PointMaintenanceRequest;
import com.gmpp.dto.PointMaintenanceResponse;
import com.gmpp.enums.Frequence;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PointMaintenanceService {
    PointMaintenanceResponse create(PointMaintenanceRequest request);
    PointMaintenanceResponse getById(UUID id);
    List<PointMaintenanceResponse> getByMachineId(UUID machineId);
    List<PointMaintenanceResponse> getByFrequence(Frequence frequence);
    PointMaintenanceResponse update(UUID id, PointMaintenanceRequest request);
    void delete(UUID id);
    LocalDate calculateProchaineIntervention(UUID pointId, LocalDate dateExecution);
    List<PointMaintenanceResponse> getPointsEnRetard();
    void updateProchaineInterventionApresExecution(UUID pointId, LocalDate dateExecution);
}

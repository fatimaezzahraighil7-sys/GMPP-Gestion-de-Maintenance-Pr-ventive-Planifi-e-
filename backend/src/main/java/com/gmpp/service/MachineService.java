package com.gmpp.service;

import com.gmpp.dto.MachineRequest;
import com.gmpp.dto.MachineResponse;
import com.gmpp.dto.MachineStatsResponse;
import com.gmpp.dto.InterventionResponse;
import com.gmpp.enums.StatutMachine;
import com.gmpp.enums.TypeMachine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface MachineService {
    MachineResponse create(MachineRequest request);
    MachineResponse getById(UUID id);
    Page<MachineResponse> getAll(StatutMachine statut, TypeMachine type, String search, Pageable pageable);
    MachineResponse update(UUID id, MachineRequest request);
    void delete(UUID id);
    MachineResponse updateStatut(UUID id, StatutMachine statut);
    MachineResponse updateCompteurHoraire(UUID id, Double heures);
    MachineStatsResponse getMachinesStats();
    List<InterventionResponse> getHistoriqueInterventions(UUID machineId);
}

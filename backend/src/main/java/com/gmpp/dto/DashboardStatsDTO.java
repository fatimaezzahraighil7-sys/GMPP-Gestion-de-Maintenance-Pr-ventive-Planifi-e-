package com.gmpp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private double tauxRealisation;
    private long nbInterventionsPlanifiees;
    private long nbInterventionsTerminees;
    private long nbInterventionsEnRetard;
    private long nbMachinesEnService;
    private long nbMachinesEnMaintenance;
    private double tempsMoyenIntervention;
    private List<TopMachineDTO> topMachines;
    private Map<String, Long> interventionsParMois;
    private double tauxDisponibilite;
    private double coutTotalMaintenance;
    private Map<String, Double> coutParMachine; // Feat 6: coût par machine
    private long nbPannesEvitees;
    private Map<String, Double> tempsMoyenParTypeOperation;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopMachineDTO {
        private UUID machineId;
        private String machineNom;
        private long nbInterventions;
    }
}

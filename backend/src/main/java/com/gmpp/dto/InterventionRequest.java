package com.gmpp.dto;

import com.gmpp.enums.EtatConstate;
import com.gmpp.enums.StatutIntervention;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterventionRequest {

    @NotNull(message = "La date planifiée est obligatoire")
    private LocalDateTime datePlanifiee;

    @NotNull(message = "L'identifiant de la machine est obligatoire")
    private UUID machineId;

    private UUID pointMaintenanceId;
    private UUID technicienId;
    private String observations;
    private Double coutReel;
}

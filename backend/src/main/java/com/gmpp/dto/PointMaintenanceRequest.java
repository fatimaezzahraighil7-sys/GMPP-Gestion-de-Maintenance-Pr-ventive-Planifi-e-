package com.gmpp.dto;

import com.gmpp.enums.Frequence;
import com.gmpp.enums.TypeOperation;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointMaintenanceRequest {

    @NotNull(message = "Le type d'opération est obligatoire")
    private TypeOperation typeOperation;

    private String description;
    private String localisation;
    private String typeConsommable;
    private Double quantiteNecessaire;
    private String unite;

    @NotNull(message = "La fréquence est obligatoire")
    private Frequence frequence;

    private Integer intervalleHeures;

    @NotNull(message = "L'identifiant de la machine est obligatoire")
    private UUID machineId;
}

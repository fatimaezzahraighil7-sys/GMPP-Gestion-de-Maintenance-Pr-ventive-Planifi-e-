package com.gmpp.dto;

import com.gmpp.enums.Frequence;
import com.gmpp.enums.TypeOperation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointMaintenanceResponse {
    private UUID id;
    private TypeOperation typeOperation;
    private String description;
    private String localisation;
    private String typeConsommable;
    private Double quantiteNecessaire;
    private String unite;
    private Frequence frequence;
    private LocalDate prochaineIntervention;
    private Integer intervalleHeures;
    private UUID machineId;
    private String machineNom;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

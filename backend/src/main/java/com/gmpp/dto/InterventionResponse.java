package com.gmpp.dto;

import com.gmpp.enums.EtatConstate;
import com.gmpp.enums.StatutIntervention;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterventionResponse {
    private UUID id;
    private LocalDateTime datePlanifiee;
    private LocalDateTime dateReelle;
    private Integer dureeMinutes;
    private StatutIntervention statut;
    private String observations;
    private String alertLabel; // Champ dédié pour les alertes planning (J-1, J-3, J-7)
    private EtatConstate etatConstate;
    private String photoUrl;
    private List<String> imageUrls;
    private Double coutReel;
    private Boolean signatureTechnicien;
    private Boolean validationResponsable;
    private String justification;
    private UUID machineId;
    private String machineNom;
    private UUID pointMaintenanceId;
    private String pointMaintenanceDescription;
    private UUID technicienId;
    private String technicienNom;
    private String technicienPrenom;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

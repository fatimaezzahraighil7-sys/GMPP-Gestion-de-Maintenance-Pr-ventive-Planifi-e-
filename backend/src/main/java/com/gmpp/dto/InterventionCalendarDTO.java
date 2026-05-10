package com.gmpp.dto;

import com.gmpp.enums.StatutIntervention;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterventionCalendarDTO {
    private UUID id;
    private String title;
    private String start;
    private String end;
    private String color;
    private StatutIntervention statut;
    private String machineNom;
    private String technicienNom;
}

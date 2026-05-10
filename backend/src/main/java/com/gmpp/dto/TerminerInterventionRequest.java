package com.gmpp.dto;

import com.gmpp.enums.EtatConstate;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TerminerInterventionRequest {

    private String observations;

    @NotNull(message = "L'état constaté est obligatoire")
    private EtatConstate etatConstate;

    private Integer dureeMinutes;
    private String photoUrl;
    private Boolean signatureTechnicien;
    private Double coutReel;
}

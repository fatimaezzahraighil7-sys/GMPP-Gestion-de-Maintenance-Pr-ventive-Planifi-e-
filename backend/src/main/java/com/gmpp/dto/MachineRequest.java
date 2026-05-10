package com.gmpp.dto;

import com.gmpp.enums.StatutMachine;
import com.gmpp.enums.TypeMachine;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MachineRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotNull(message = "Le type de machine est obligatoire")
    private TypeMachine typeMachine;

    private String marque;
    private String modele;

    @NotBlank(message = "Le numéro de série est obligatoire")
    private String numeroSerie;

    private Integer anneeFabrication;
    private LocalDate dateMiseEnService;
    private String localisation;
    private StatutMachine statut;
    private Double compteurHoraire;
}

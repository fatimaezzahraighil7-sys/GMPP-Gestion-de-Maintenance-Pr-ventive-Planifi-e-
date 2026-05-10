package com.gmpp.dto;

import com.gmpp.enums.StatutMachine;
import com.gmpp.enums.TypeMachine;
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
public class MachineResponse {
    private UUID id;
    private String nom;
    private TypeMachine typeMachine;
    private String marque;
    private String modele;
    private String numeroSerie;
    private Integer anneeFabrication;
    private LocalDate dateMiseEnService;
    private String localisation;
    private StatutMachine statut;
    private Double compteurHoraire;
    private int nbPointsMaintenance;
    private int nbInterventions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

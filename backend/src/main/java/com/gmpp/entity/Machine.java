package com.gmpp.entity;

import com.gmpp.enums.StatutMachine;
import com.gmpp.enums.TypeMachine;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "machines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_machine", nullable = false)
    private TypeMachine typeMachine;

    private String marque;

    private String modele;

    @Column(name = "numero_serie", unique = true, nullable = false)
    private String numeroSerie;

    @Column(name = "annee_fabrication")
    private Integer anneeFabrication;

    @Column(name = "date_mise_en_service")
    private LocalDate dateMiseEnService;

    private String localisation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutMachine statut = StatutMachine.EN_SERVICE;

    @Column(name = "compteur_horaire")
    @Builder.Default
    private Double compteurHoraire = 0.0;

    @OneToMany(mappedBy = "machine", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PointMaintenance> pointsMaintenances = new ArrayList<>();

    @OneToMany(mappedBy = "machine", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Intervention> interventions = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

package com.gmpp.entity;

import com.gmpp.enums.Frequence;
import com.gmpp.enums.TypeOperation;
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
@Table(name = "points_maintenance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointMaintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_operation", nullable = false)
    private TypeOperation typeOperation;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String localisation;

    @Column(name = "type_consommable")
    private String typeConsommable;

    @Column(name = "quantite_necessaire")
    private Double quantiteNecessaire;

    private String unite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frequence frequence;

    @Column(name = "prochaine_intervention")
    private LocalDate prochaineIntervention;

    @Column(name = "intervalle_heures")
    private Integer intervalleHeures;

    @Column(name = "dernier_compteur")
    @Builder.Default
    private Double dernierCompteur = 0.0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    private Machine machine;

    @OneToMany(mappedBy = "pointMaintenance", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Intervention> interventions = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

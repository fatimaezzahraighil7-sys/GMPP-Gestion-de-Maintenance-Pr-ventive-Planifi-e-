package com.gmpp.entity;

import com.gmpp.enums.EtatConstate;
import com.gmpp.enums.StatutIntervention;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "interventions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Intervention {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "date_planifiee", nullable = false)
    private LocalDateTime datePlanifiee;

    @Column(name = "date_reelle")
    private LocalDateTime dateReelle;

    @Column(name = "duree_minutes")
    private Integer dureeMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutIntervention statut = StatutIntervention.PLANIFIEE;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat_constate")
    private EtatConstate etatConstate;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "signature_technicien")
    @Builder.Default
    private Boolean signatureTechnicien = false;

    @Column(name = "validation_responsable")
    @Builder.Default
    private Boolean validationResponsable = false;

    @Column(name = "cout_reel")
    private Double coutReel;

    @Column(name = "compteur_horaire")
    private Double compteurHoraire;

    private String justification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    private Machine machine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "point_maintenance_id")
    private PointMaintenance pointMaintenance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technicien_id")
    private Utilisateur technicien;

    @OneToMany(mappedBy = "intervention", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<InterventionImage> images = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

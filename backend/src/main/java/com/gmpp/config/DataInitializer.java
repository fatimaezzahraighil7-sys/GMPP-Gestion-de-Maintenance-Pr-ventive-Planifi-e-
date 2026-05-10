package com.gmpp.config;

import com.gmpp.entity.Intervention;
import com.gmpp.entity.Machine;
import com.gmpp.entity.PointMaintenance;
import com.gmpp.entity.Utilisateur;
import com.gmpp.enums.*;
import com.gmpp.repository.InterventionRepository;
import com.gmpp.repository.MachineRepository;
import com.gmpp.repository.PointMaintenanceRepository;
import com.gmpp.repository.UtilisateurRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@Profile("dev")
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UtilisateurRepository utilisateurRepository;
    private final MachineRepository machineRepository;
    private final PointMaintenanceRepository pointMaintenanceRepository;
    private final InterventionRepository interventionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UtilisateurRepository utilisateurRepository,
                           MachineRepository machineRepository,
                           PointMaintenanceRepository pointMaintenanceRepository,
                           InterventionRepository interventionRepository,
                           PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.machineRepository = machineRepository;
        this.pointMaintenanceRepository = pointMaintenanceRepository;
        this.interventionRepository = interventionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init() {
        if (utilisateurRepository.count() > 0) {
            logger.info("Données déjà initialisées, skip.");
            return;
        }

        logger.info("Initialisation des données de développement...");

        // === UTILISATEURS ===
        Utilisateur admin = utilisateurRepository.save(Utilisateur.builder()
                .nom("Dupont").prenom("Jean").matricule("ADM001").email("admin@gmpp.com")
                .motDePasse(passwordEncoder.encode("admin123")).role(Role.ADMIN)
                .specialites(List.of()).certifications(List.of()).actif(true).build());

        Utilisateur responsable = utilisateurRepository.save(Utilisateur.builder()
                .nom("Martin").prenom("Sophie").matricule("RES001").email("responsable@gmpp.com")
                .motDePasse(passwordEncoder.encode("resp123")).role(Role.RESPONSABLE_MAINTENANCE)
                .specialites(List.of("Hydraulique", "Pneumatique")).certifications(List.of("ISO 9001"))
                .actif(true).build());

        Utilisateur chef1 = utilisateurRepository.save(Utilisateur.builder()
                .nom("Bernard").prenom("Pierre").matricule("CHF001").email("chef1@gmpp.com")
                .motDePasse(passwordEncoder.encode("chef123")).role(Role.CHEF_EQUIPE)
                .specialites(List.of("Électrique", "CNC")).certifications(List.of("Habilitation électrique"))
                .actif(true).build());

        Utilisateur chef2 = utilisateurRepository.save(Utilisateur.builder()
                .nom("Leroy").prenom("Marie").matricule("CHF002").email("chef2@gmpp.com")
                .motDePasse(passwordEncoder.encode("chef123")).role(Role.CHEF_EQUIPE)
                .specialites(List.of("Hydraulique")).certifications(List.of()).actif(true).build());

        Utilisateur tech1 = utilisateurRepository.save(Utilisateur.builder()
                .nom("Moreau").prenom("Luc").matricule("TEC001").email("tech1@gmpp.com")
                .motDePasse(passwordEncoder.encode("tech123")).role(Role.TECHNICIEN)
                .specialites(List.of("Hydraulique", "Graissage")).certifications(List.of("Mécanique niveau 2"))
                .actif(true).build());

        Utilisateur tech2 = utilisateurRepository.save(Utilisateur.builder()
                .nom("Petit").prenom("Claire").matricule("TEC002").email("tech2@gmpp.com")
                .motDePasse(passwordEncoder.encode("tech123")).role(Role.TECHNICIEN)
                .specialites(List.of("Électrique", "CNC")).certifications(List.of("Electricité HT"))
                .actif(true).build());

        Utilisateur tech3 = utilisateurRepository.save(Utilisateur.builder()
                .nom("Roux").prenom("Antoine").matricule("TEC003").email("tech3@gmpp.com")
                .motDePasse(passwordEncoder.encode("tech123")).role(Role.TECHNICIEN)
                .specialites(List.of("Pneumatique", "Filtres")).certifications(List.of())
                .actif(true).build());

        Utilisateur tech4 = utilisateurRepository.save(Utilisateur.builder()
                .nom("Fournier").prenom("Emma").matricule("TEC004").email("tech4@gmpp.com")
                .motDePasse(passwordEncoder.encode("tech123")).role(Role.TECHNICIEN)
                .specialites(List.of("Vidange", "Courroies")).certifications(List.of("Mécanique niveau 1"))
                .actif(true).build());

        // === MACHINES ===
        Machine m1 = machineRepository.save(Machine.builder()
                .nom("Presse hydraulique PH-200").typeMachine(TypeMachine.HYDRAULIQUE).marque("Bosch Rexroth")
                .modele("PH-200X").numeroSerie("HYD-2020-001").anneeFabrication(2020)
                .dateMiseEnService(LocalDate.of(2020, 6, 15)).localisation("Atelier A - Zone 1")
                .statut(StatutMachine.EN_SERVICE).compteurHoraire(4520.0).build());

        Machine m2 = machineRepository.save(Machine.builder()
                .nom("Compresseur pneumatique CP-500").typeMachine(TypeMachine.PNEUMATIQUE).marque("Atlas Copco")
                .modele("CP-500S").numeroSerie("PNE-2019-002").anneeFabrication(2019)
                .dateMiseEnService(LocalDate.of(2019, 3, 10)).localisation("Atelier B - Zone 2")
                .statut(StatutMachine.EN_SERVICE).compteurHoraire(6300.0).build());

        Machine m3 = machineRepository.save(Machine.builder()
                .nom("Tour CNC TC-300").typeMachine(TypeMachine.CNC).marque("Haas")
                .modele("ST-30").numeroSerie("CNC-2021-003").anneeFabrication(2021)
                .dateMiseEnService(LocalDate.of(2021, 1, 20)).localisation("Atelier C - Zone 1")
                .statut(StatutMachine.EN_SERVICE).compteurHoraire(3150.0).build());

        Machine m4 = machineRepository.save(Machine.builder()
                .nom("Moteur électrique ME-150").typeMachine(TypeMachine.ELECTRIQUE).marque("Siemens")
                .modele("ME-150K").numeroSerie("ELE-2018-004").anneeFabrication(2018)
                .dateMiseEnService(LocalDate.of(2018, 9, 5)).localisation("Atelier A - Zone 3")
                .statut(StatutMachine.EN_MAINTENANCE).compteurHoraire(8900.0).build());

        Machine m5 = machineRepository.save(Machine.builder()
                .nom("Fraiseuse CNC FC-250").typeMachine(TypeMachine.CNC).marque("DMG Mori")
                .modele("FC-250PRO").numeroSerie("CNC-2022-005").anneeFabrication(2022)
                .dateMiseEnService(LocalDate.of(2022, 4, 12)).localisation("Atelier C - Zone 2")
                .statut(StatutMachine.EN_SERVICE).compteurHoraire(1800.0).build());

        Machine m6 = machineRepository.save(Machine.builder()
                .nom("Vérin hydraulique VH-100").typeMachine(TypeMachine.HYDRAULIQUE).marque("Parker")
                .modele("VH-100D").numeroSerie("HYD-2017-006").anneeFabrication(2017)
                .dateMiseEnService(LocalDate.of(2017, 11, 30)).localisation("Atelier B - Zone 1")
                .statut(StatutMachine.HORS_SERVICE).compteurHoraire(12500.0).build());

        // === POINTS DE MAINTENANCE (3 par machine) ===
        List<Machine> machines = Arrays.asList(m1, m2, m3, m4, m5, m6);
        TypeOperation[] operations = TypeOperation.values();
        Frequence[] frequences = {Frequence.HEBDOMADAIRE, Frequence.MENSUELLE, Frequence.TRIMESTRIELLE};

        for (Machine machine : machines) {
            for (int i = 0; i < 3; i++) {
                PointMaintenance pm = pointMaintenanceRepository.save(PointMaintenance.builder()
                        .typeOperation(operations[i % operations.length])
                        .description("Maintenance " + operations[i % operations.length].name().toLowerCase().replace('_', ' ')
                                + " pour " + machine.getNom())
                        .localisation(machine.getLocalisation())
                        .typeConsommable(i == 0 ? "Huile hydraulique" : i == 1 ? "Filtre" : "Graisse")
                        .quantiteNecessaire(i == 0 ? 5.0 : i == 1 ? 1.0 : 0.5)
                        .unite(i == 0 ? "litres" : i == 1 ? "pièce" : "kg")
                        .frequence(frequences[i])
                        .prochaineIntervention(LocalDate.now().plusDays(i * 5 + 1))
                        .machine(machine)
                        .build());
            }
        }

        // === INTERVENTIONS (mix de statuts) ===
        List<PointMaintenance> allPoints = pointMaintenanceRepository.findAll();

        interventionRepository.save(Intervention.builder()
                .datePlanifiee(LocalDateTime.now().plusDays(2)).statut(StatutIntervention.PLANIFIEE)
                .machine(m1).pointMaintenance(allPoints.get(0)).technicien(tech1)
                .observations("Vérification programmée").build());

        interventionRepository.save(Intervention.builder()
                .datePlanifiee(LocalDateTime.now().plusDays(5)).statut(StatutIntervention.PLANIFIEE)
                .machine(m2).pointMaintenance(allPoints.get(3)).technicien(tech2)
                .observations("Maintenance mensuelle").build());

        interventionRepository.save(Intervention.builder()
                .datePlanifiee(LocalDateTime.now().minusDays(1)).statut(StatutIntervention.EN_RETARD)
                .machine(m3).pointMaintenance(allPoints.get(6)).technicien(tech3)
                .observations("En retard - à reprogrammer").build());

        interventionRepository.save(Intervention.builder()
                .datePlanifiee(LocalDateTime.now()).statut(StatutIntervention.EN_COURS)
                .dateReelle(LocalDateTime.now()).machine(m4).pointMaintenance(allPoints.get(9)).technicien(tech1)
                .observations("En cours d'exécution").build());

        interventionRepository.save(Intervention.builder()
                .datePlanifiee(LocalDateTime.now().minusDays(5)).dateReelle(LocalDateTime.now().minusDays(5))
                .dureeMinutes(120).statut(StatutIntervention.TERMINEE).etatConstate(EtatConstate.NORMAL)
                .machine(m1).pointMaintenance(allPoints.get(1)).technicien(tech2)
                .observations("Tout est en ordre").signatureTechnicien(true).validationResponsable(true).build());

        interventionRepository.save(Intervention.builder()
                .datePlanifiee(LocalDateTime.now().minusDays(10)).dateReelle(LocalDateTime.now().minusDays(10))
                .dureeMinutes(90).statut(StatutIntervention.TERMINEE).etatConstate(EtatConstate.USURE_DETECTEE)
                .machine(m2).pointMaintenance(allPoints.get(4)).technicien(tech3)
                .observations("Usure détectée sur courroie").signatureTechnicien(true).validationResponsable(true).build());

        interventionRepository.save(Intervention.builder()
                .datePlanifiee(LocalDateTime.now().minusDays(3)).statut(StatutIntervention.ANNULEE)
                .machine(m5).pointMaintenance(allPoints.get(12)).technicien(tech4)
                .justification("Machine en arrêt programmé").build());

        interventionRepository.save(Intervention.builder()
                .datePlanifiee(LocalDateTime.now().plusDays(7)).statut(StatutIntervention.PLANIFIEE)
                .machine(m3).pointMaintenance(allPoints.get(7)).technicien(tech4)
                .observations("Contrôle trimestriel").build());

        interventionRepository.save(Intervention.builder()
                .datePlanifiee(LocalDateTime.now().minusDays(15)).dateReelle(LocalDateTime.now().minusDays(15))
                .dureeMinutes(180).statut(StatutIntervention.TERMINEE).etatConstate(EtatConstate.REPARATION_NECESSAIRE)
                .machine(m4).pointMaintenance(allPoints.get(10)).technicien(tech1)
                .observations("Roulement à remplacer dans 2 semaines").signatureTechnicien(true)
                .validationResponsable(false).build());

        interventionRepository.save(Intervention.builder()
                .datePlanifiee(LocalDateTime.now().plusDays(1)).statut(StatutIntervention.PLANIFIEE)
                .machine(m5).pointMaintenance(allPoints.get(13)).technicien(tech2)
                .observations("Graissage hebdomadaire").build());

        logger.info("Données de développement initialisées avec succès !");
        logger.info("  - {} utilisateurs", utilisateurRepository.count());
        logger.info("  - {} machines", machineRepository.count());
        logger.info("  - {} points de maintenance", pointMaintenanceRepository.count());
        logger.info("  - {} interventions", interventionRepository.count());
    }
}

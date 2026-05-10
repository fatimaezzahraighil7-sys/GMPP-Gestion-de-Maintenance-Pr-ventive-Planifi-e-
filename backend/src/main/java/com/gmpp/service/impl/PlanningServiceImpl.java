package com.gmpp.service.impl;

import com.gmpp.dto.InterventionResponse;
import com.gmpp.entity.Intervention;
import com.gmpp.entity.PointMaintenance;
import com.gmpp.entity.Utilisateur;
import com.gmpp.enums.StatutIntervention;
import com.gmpp.exception.BusinessException;
import com.gmpp.exception.ResourceNotFoundException;
import com.gmpp.mapper.InterventionMapper;
import com.gmpp.repository.InterventionRepository;
import com.gmpp.repository.PointMaintenanceRepository;
import com.gmpp.repository.UtilisateurRepository;
import com.gmpp.service.PlanningService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PlanningServiceImpl implements PlanningService {

    private static final Logger logger = LoggerFactory.getLogger(PlanningServiceImpl.class);

    private final PointMaintenanceRepository pointMaintenanceRepository;
    private final InterventionRepository interventionRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final InterventionMapper interventionMapper;

    public PlanningServiceImpl(PointMaintenanceRepository pointMaintenanceRepository,
                                InterventionRepository interventionRepository,
                                UtilisateurRepository utilisateurRepository,
                                InterventionMapper interventionMapper) {
        this.pointMaintenanceRepository = pointMaintenanceRepository;
        this.interventionRepository = interventionRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.interventionMapper = interventionMapper;
    }

    @Override
    @Scheduled(cron = "0 0 7 * * *") // Feat 4: Génération automatique chaque matin à 7h
    public List<InterventionResponse> genererInterventionsPlanifiees() {
        LocalDate today = LocalDate.now();
        LocalDate dansUneSemaine = today.plusDays(7);

        // 1. Planification basée sur les dates (inclure les dates passées pour rattraper le retard)
        List<PointMaintenance> pointsFrequence = pointMaintenanceRepository.findAll().stream()
                .filter(p -> p.getProchaineIntervention() != null && !p.getProchaineIntervention().isAfter(dansUneSemaine))
                .collect(Collectors.toList());

        // 2. Planification basée sur les heures de fonctionnement
        List<PointMaintenance> pointsHeures = pointMaintenanceRepository.findAll().stream()
                .filter(p -> p.getFrequence() == com.gmpp.enums.Frequence.PAR_HEURES)
                .filter(p -> p.getMachine().getCompteurHoraire() != null && p.getIntervalleHeures() != null)
                .filter(p -> (p.getMachine().getCompteurHoraire() - (p.getDernierCompteur() != null ? p.getDernierCompteur() : 0.0)) >= p.getIntervalleHeures())
                .collect(Collectors.toList());

        List<PointMaintenance> allPoints = new ArrayList<>(pointsFrequence);
        for (PointMaintenance ph : pointsHeures) {
            if (!allPoints.contains(ph)) allPoints.add(ph);
        }

        List<Intervention> interventionsCreees = new ArrayList<>();

        for (PointMaintenance point : allPoints) {
            List<Intervention> existantes = interventionRepository.findByPointMaintenanceId(point.getId())
                    .stream()
                    .filter(i -> i.getStatut() == StatutIntervention.PLANIFIEE ||
                                 i.getStatut() == StatutIntervention.EN_COURS)
                    .collect(Collectors.toList());

            if (existantes.isEmpty()) {
                LocalDateTime datePlanifiee;
                if (point.getFrequence() == com.gmpp.enums.Frequence.PAR_HEURES) {
                    datePlanifiee = LocalDateTime.now().plusDays(1).withHour(8).withMinute(0);
                } else {
                    // Si la prochaine intervention est dans le passé, on la planifie pour aujourd'hui
                    LocalDate targetDate = point.getProchaineIntervention();
                    if (targetDate.isBefore(LocalDate.now())) {
                        targetDate = LocalDate.now();
                    }
                    datePlanifiee = targetDate.atTime(8, 0);
                }

                Intervention intervention = Intervention.builder()
                        .datePlanifiee(datePlanifiee)
                        .statut(StatutIntervention.PREVENTIVE)
                        .machine(point.getMachine())
                        .pointMaintenance(point)
                        .observations("Intervention générée automatiquement (Seuil atteint ou Fréquence)")
                        .build();

                interventionsCreees.add(interventionRepository.save(intervention));
                logger.info("Intervention planifiée créée pour le point {} de la machine {}",
                        point.getId(), point.getMachine().getNom());
            }
        }

        return interventionMapper.toResponseList(interventionsCreees);
    }

    @Override
    public InterventionResponse assignerTechnicien(UUID interventionId, UUID technicienId) {
        Intervention intervention = interventionRepository.findById(interventionId)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention", "id", interventionId));

        Utilisateur technicien = utilisateurRepository.findById(technicienId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", technicienId));

        if (technicien.getRole() != com.gmpp.enums.Role.TECHNICIEN) {
            throw new BusinessException("L'utilisateur " + technicien.getNom() + " n'est pas un technicien");
        }

        if (!technicien.getActif()) {
            throw new BusinessException("Le technicien " + technicien.getNom() + " est inactif");
        }

        intervention.setTechnicien(technicien);
        if (intervention.getStatut() == StatutIntervention.PREVENTIVE) {
            intervention.setStatut(StatutIntervention.PLANIFIEE);
        }
        return interventionMapper.toResponse(interventionRepository.save(intervention));
    }

    @Override
    public InterventionResponse assignerAutomatiquement(UUID interventionId) {
        Intervention intervention = interventionRepository.findById(interventionId)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention", "id", interventionId));
        
        if (intervention.getPointMaintenance() == null) {
            throw new BusinessException("Impossible d'assigner automatiquement sans point de maintenance associé");
        }

        String specialiteRequise = intervention.getPointMaintenance().getTypeOperation().name();
        
        List<Utilisateur> techniciensDispo = utilisateurRepository.findByRole(com.gmpp.enums.Role.TECHNICIEN).stream()
                .filter(Utilisateur::getActif)
                .filter(t -> t.getSpecialites().stream().anyMatch(s -> s.equalsIgnoreCase(specialiteRequise) || s.toUpperCase().contains(specialiteRequise)))
                .collect(Collectors.toList());

        if (techniciensDispo.isEmpty()) {
            // Fallback: any active tech if no specialty match found? 
            // Or better: log warning and try any active tech
            techniciensDispo = utilisateurRepository.findByRole(com.gmpp.enums.Role.TECHNICIEN).stream()
                    .filter(Utilisateur::getActif)
                    .collect(Collectors.toList());
        }

        if (techniciensDispo.isEmpty()) {
            throw new BusinessException("Aucun technicien actif disponible");
        }

        // Bug 7 fix: vérifier l'absence de conflit horaire avant d'assigner
        // Plage ±2h autour de la date planifiée pour détecter les chevauchements
        LocalDateTime planifiee = intervention.getDatePlanifiee();
        LocalDateTime fenetreDebut = planifiee.minusHours(2);
        LocalDateTime fenetreFin = planifiee.plusHours(2);

        Utilisateur bestTech = null;
        long minLoad = Long.MAX_VALUE;

        for (Utilisateur tech : techniciensDispo) {
            long load = interventionRepository.countByTechnicienIdAndStatutIn(
                    tech.getId(), List.of(StatutIntervention.PLANIFIEE, StatutIntervention.EN_COURS));
            
            // Vérifier l'absence de chevauchement horaire
            boolean hasConflict = interventionRepository.findByTechnicienAndDateBetween(
                    tech.getId(), fenetreDebut, fenetreFin)
                    .stream()
                    .anyMatch(i -> i.getStatut() == StatutIntervention.PLANIFIEE
                            || i.getStatut() == StatutIntervention.EN_COURS);
            
            if (!hasConflict && load < minLoad) {
                minLoad = load;
                bestTech = tech;
            }
        }

        // Fallback: si tous ont des conflits, prendre celui avec la charge minimale
        if (bestTech == null) {
            for (Utilisateur tech : techniciensDispo) {
                long load = interventionRepository.countByTechnicienIdAndStatutIn(
                        tech.getId(), List.of(StatutIntervention.PLANIFIEE, StatutIntervention.EN_COURS));
                if (load < minLoad) {
                    minLoad = load;
                    bestTech = tech;
                }
            }
        }

        intervention.setTechnicien(bestTech);
        if (intervention.getStatut() == StatutIntervention.PREVENTIVE) {
            intervention.setStatut(StatutIntervention.PLANIFIEE);
        }
        return interventionMapper.toResponse(interventionRepository.save(intervention));
    }

    @Override
    public InterventionResponse reprogrammer(UUID interventionId, LocalDateTime nouvelleDatePlanifiee, String justification) {
        Intervention intervention = interventionRepository.findById(interventionId)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention", "id", interventionId));

        if (intervention.getStatut() == StatutIntervention.TERMINEE ||
            intervention.getStatut() == StatutIntervention.ANNULEE) {
            throw new BusinessException("Impossible de reprogrammer une intervention " + intervention.getStatut());
        }

        intervention.setDatePlanifiee(nouvelleDatePlanifiee);
        intervention.setJustification(justification);
        if (intervention.getStatut() == StatutIntervention.EN_RETARD) {
            intervention.setStatut(StatutIntervention.PLANIFIEE);
        }

        return interventionMapper.toResponse(interventionRepository.save(intervention));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterventionResponse> getAlertes() {
        LocalDate today = LocalDate.now();
        LocalDateTime j7 = today.plusDays(7).atTime(23, 59, 59);

        return interventionRepository.findForCalendar(today.atStartOfDay(), j7)
                .stream()
                .filter(i -> i.getStatut() == StatutIntervention.PLANIFIEE ||
                             i.getStatut() == StatutIntervention.EN_RETARD)
                .map(i -> {
                    InterventionResponse resp = interventionMapper.toResponse(i);
                    // Utilise alertLabel dédié au lieu de polluer observations
                    long days = java.time.temporal.ChronoUnit.DAYS.between(today, i.getDatePlanifiee().toLocalDate());
                    if (days <= 1) resp.setAlertLabel("[J-1]");
                    else if (days <= 3) resp.setAlertLabel("[J-3]");
                    else resp.setAlertLabel("[J-7]");
                    return resp;
                })
                .collect(Collectors.toList());
    }
}

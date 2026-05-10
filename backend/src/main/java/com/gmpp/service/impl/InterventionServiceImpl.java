package com.gmpp.service.impl;

import com.gmpp.dto.*;
import com.gmpp.entity.Intervention;
import com.gmpp.entity.InterventionImage;
import com.gmpp.entity.Machine;
import com.gmpp.entity.PointMaintenance;
import com.gmpp.entity.Utilisateur;
import com.gmpp.enums.StatutIntervention;
import com.gmpp.exception.BusinessException;
import com.gmpp.exception.ResourceNotFoundException;
import com.gmpp.mapper.InterventionMapper;
import com.gmpp.repository.InterventionImageRepository;
import com.gmpp.repository.InterventionRepository;
import com.gmpp.repository.MachineRepository;
import com.gmpp.repository.PointMaintenanceRepository;
import com.gmpp.repository.UtilisateurRepository;
import com.gmpp.service.EmailNotificationService;
import com.gmpp.service.InterventionService;
import com.gmpp.service.PointMaintenanceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class InterventionServiceImpl implements InterventionService {

    private static final Logger logger = LoggerFactory.getLogger(InterventionServiceImpl.class);

    private final InterventionRepository interventionRepository;
    private final InterventionImageRepository interventionImageRepository;
    private final MachineRepository machineRepository;
    private final PointMaintenanceRepository pointMaintenanceRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final InterventionMapper interventionMapper;
    private final PointMaintenanceService pointMaintenanceService;
    private final EmailNotificationService emailNotificationService;

    public InterventionServiceImpl(InterventionRepository interventionRepository,
                                    InterventionImageRepository interventionImageRepository,
                                    MachineRepository machineRepository,
                                    PointMaintenanceRepository pointMaintenanceRepository,
                                    UtilisateurRepository utilisateurRepository,
                                    InterventionMapper interventionMapper,
                                    PointMaintenanceService pointMaintenanceService,
                                    EmailNotificationService emailNotificationService) {
        this.interventionRepository = interventionRepository;
        this.interventionImageRepository = interventionImageRepository;
        this.machineRepository = machineRepository;
        this.pointMaintenanceRepository = pointMaintenanceRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.interventionMapper = interventionMapper;
        this.pointMaintenanceService = pointMaintenanceService;
        this.emailNotificationService = emailNotificationService;
    }

    private void chargerAssociationsPourNotification(Intervention intervention) {
        if (intervention.getTechnicien() != null) {
            intervention.getTechnicien().getEmail();
            intervention.getTechnicien().getNom();
            intervention.getTechnicien().getPrenom();
        }
        if (intervention.getMachine() != null) {
            intervention.getMachine().getNom();
        }
    }

    @Override
    public InterventionResponse planifier(InterventionRequest request) {
        Machine machine = machineRepository.findById(request.getMachineId())
                .orElseThrow(() -> new ResourceNotFoundException("Machine", "id", request.getMachineId()));

        Intervention intervention = Intervention.builder()
                .datePlanifiee(request.getDatePlanifiee())
                .statut(request.getTechnicienId() != null ? StatutIntervention.PLANIFIEE : StatutIntervention.PREVENTIVE)
                .observations(request.getObservations())
                .coutReel(request.getCoutReel())
                .machine(machine)
                .build();

        if (request.getPointMaintenanceId() != null) {
            PointMaintenance point = pointMaintenanceRepository.findById(request.getPointMaintenanceId())
                    .orElseThrow(() -> new ResourceNotFoundException("PointMaintenance", "id", request.getPointMaintenanceId()));
            intervention.setPointMaintenance(point);
        }

        if (request.getTechnicienId() != null) {
            Utilisateur technicien = utilisateurRepository.findById(request.getTechnicienId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", request.getTechnicienId()));
            intervention.setTechnicien(technicien);
        }

        Intervention saved = interventionRepository.save(intervention);
        chargerAssociationsPourNotification(saved);
        emailNotificationService.notifierNouvelleIntervention(saved);
        
        return interventionMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InterventionResponse getById(UUID id) {
        return interventionMapper.toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InterventionResponse> getAll(UUID machineId, StatutIntervention statut, UUID technicienId,
                                              LocalDate debut, LocalDate fin, Pageable pageable) {
        LocalDateTime debutDt = debut != null ? debut.atStartOfDay() : null;
        LocalDateTime finDt = fin != null ? fin.atTime(23, 59, 59) : null;
        
        org.springframework.data.jpa.domain.Specification<Intervention> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (machineId != null) {
                predicates.add(cb.equal(root.get("machine").get("id"), machineId));
            }
            if (statut != null) {
                predicates.add(cb.equal(root.get("statut"), statut));
            }
            if (technicienId != null) {
                predicates.add(cb.equal(root.get("technicien").get("id"), technicienId));
            }
            if (debutDt != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("datePlanifiee"), debutDt));
            }
            if (finDt != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("datePlanifiee"), finDt));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        
        return interventionRepository.findAll(spec, pageable).map(interventionMapper::toResponse);
    }

    @Override
    public InterventionResponse update(UUID id, InterventionRequest request) {
        Intervention intervention = findById(id);
        Machine machine = machineRepository.findById(request.getMachineId())
                .orElseThrow(() -> new ResourceNotFoundException("Machine", "id", request.getMachineId()));

        intervention.setDatePlanifiee(request.getDatePlanifiee());
        intervention.setMachine(machine);
        intervention.setObservations(request.getObservations());
        intervention.setCoutReel(request.getCoutReel());

        if (request.getPointMaintenanceId() != null) {
            PointMaintenance point = pointMaintenanceRepository.findById(request.getPointMaintenanceId())
                    .orElseThrow(() -> new ResourceNotFoundException("PointMaintenance", "id", request.getPointMaintenanceId()));
            intervention.setPointMaintenance(point);
        }

        boolean technicienChanged = false;
        if (request.getTechnicienId() != null) {
            Utilisateur technicien = utilisateurRepository.findById(request.getTechnicienId())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", request.getTechnicienId()));
            if (intervention.getTechnicien() == null || !intervention.getTechnicien().getId().equals(technicien.getId())) {
                technicienChanged = true;
            }
            intervention.setTechnicien(technicien);
            if (intervention.getStatut() == StatutIntervention.PREVENTIVE) {
                intervention.setStatut(StatutIntervention.PLANIFIEE);
            }
        } else {
            intervention.setTechnicien(null);
            if (intervention.getStatut() == StatutIntervention.PLANIFIEE) {
                intervention.setStatut(StatutIntervention.PREVENTIVE);
            }
        }

        Intervention saved = interventionRepository.save(intervention);
        
        if (technicienChanged && saved.getTechnicien() != null) {
            chargerAssociationsPourNotification(saved);
            emailNotificationService.notifierAssignation(saved, saved.getTechnicien());
        }

        return interventionMapper.toResponse(saved);
    }

    @Override
    public void delete(UUID id) {
        Intervention intervention = findById(id);
        interventionRepository.delete(intervention);
    }

    @Override
    public InterventionResponse demarrer(UUID id) {
        Intervention intervention = findById(id);
        if (intervention.getStatut() != StatutIntervention.PLANIFIEE &&
            intervention.getStatut() != StatutIntervention.EN_RETARD &&
            intervention.getStatut() != StatutIntervention.PREVENTIVE) {
            throw new BusinessException("Seule une intervention PLANIFIEE, PREVENTIVE ou EN_RETARD peut être démarrée. Statut actuel : " + intervention.getStatut());
        }
        intervention.setStatut(StatutIntervention.EN_COURS);
        intervention.setDateReelle(LocalDateTime.now());
        Intervention saved = interventionRepository.save(intervention);
        
        chargerAssociationsPourNotification(saved);
        emailNotificationService.notifierChangementStatut(saved, StatutIntervention.PLANIFIEE);
        
        return interventionMapper.toResponse(saved);
    }

    @Override
    public InterventionResponse terminer(UUID id, TerminerInterventionRequest request) {
        Intervention intervention = findById(id);
        if (intervention.getStatut() != StatutIntervention.EN_COURS) {
            throw new BusinessException("Seule une intervention EN_COURS peut être terminée. Statut actuel : " + intervention.getStatut());
        }

        intervention.setStatut(StatutIntervention.TERMINEE);
        if (intervention.getDateReelle() == null) {
            intervention.setDateReelle(LocalDateTime.now());
        }
        intervention.setObservations(request.getObservations());
        intervention.setEtatConstate(request.getEtatConstate());
        intervention.setDureeMinutes(request.getDureeMinutes());
        intervention.setPhotoUrl(request.getPhotoUrl());
        intervention.setSignatureTechnicien(request.getSignatureTechnicien() != null && request.getSignatureTechnicien());
        if (request.getCoutReel() != null) {
            intervention.setCoutReel(request.getCoutReel());
        }

        Intervention saved = interventionRepository.save(intervention);

        if (intervention.getPointMaintenance() != null) {
            pointMaintenanceService.updateProchaineInterventionApresExecution(
                    intervention.getPointMaintenance().getId(), LocalDate.now());
        }
        
        chargerAssociationsPourNotification(saved);
        emailNotificationService.notifierChangementStatut(saved, StatutIntervention.EN_COURS);

        return interventionMapper.toResponse(saved);
    }

    @Override
    public InterventionResponse annuler(UUID id, String justification) {
        Intervention intervention = findById(id);
        if (intervention.getStatut() == StatutIntervention.TERMINEE) {
            throw new BusinessException("Une intervention TERMINEE ne peut pas être annulée");
        }
        StatutIntervention currentStatut = intervention.getStatut();
        intervention.setStatut(StatutIntervention.ANNULEE);
        intervention.setJustification(justification);
        Intervention saved = interventionRepository.save(intervention);
        
        chargerAssociationsPourNotification(saved);
        emailNotificationService.notifierChangementStatut(saved, currentStatut);
        
        return interventionMapper.toResponse(saved);
    }

    @Override
    @Scheduled(cron = "0 0 6 * * *")
    public void detecterInterventionsEnRetard() {
        logger.info("Détection des interventions en retard...");
        List<Intervention> retards = interventionRepository.findInterventionsEnRetard(LocalDateTime.now());
        for (Intervention intervention : retards) {
            intervention.setStatut(StatutIntervention.EN_RETARD);
            interventionRepository.save(intervention);
        }
        logger.info("{} intervention(s) passée(s) en retard", retards.size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterventionCalendarDTO> getCalendar(LocalDate debut, LocalDate fin) {
        LocalDateTime debutDt = debut.atStartOfDay();
        LocalDateTime finDt = fin.atTime(23, 59, 59);
        return interventionRepository.findForCalendar(debutDt, finDt)
                .stream()
                .map(interventionMapper::toCalendarDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterventionCalendarDTO> getTechnicienPlanning(UUID techId, LocalDate debut, LocalDate fin) {
        LocalDateTime debutDt = debut.atStartOfDay();
        LocalDateTime finDt = fin.atTime(23, 59, 59);
        return interventionRepository.findByTechnicienAndDateBetween(techId, debutDt, finDt)
                .stream()
                .map(interventionMapper::toCalendarDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getStatistiques(LocalDate debut, LocalDate fin) {
        LocalDateTime debutDt = debut.atStartOfDay();
        LocalDateTime finDt = fin.atTime(23, 59, 59);

        List<Intervention> listPeriod = interventionRepository.findByDatePlanifieeBetween(debutDt, finDt);
        
        long planifiees = listPeriod.stream().filter(i -> i.getStatut() == StatutIntervention.PLANIFIEE || i.getStatut() == StatutIntervention.PREVENTIVE).count();
        long terminees = listPeriod.stream().filter(i -> i.getStatut() == StatutIntervention.TERMINEE).count();
        long enRetard = listPeriod.stream().filter(i -> i.getStatut() == StatutIntervention.EN_RETARD).count();
        long enCours = listPeriod.stream().filter(i -> i.getStatut() == StatutIntervention.EN_COURS).count();
        
        double totalCout = listPeriod.stream()
                .filter(i -> i.getCoutReel() != null)
                .mapToDouble(Intervention::getCoutReel)
                .sum();

        long pannesEvitees = listPeriod.stream()
                .filter(i -> i.getStatut() == StatutIntervention.TERMINEE)
                .filter(i -> i.getPointMaintenance() != null)
                .filter(i -> i.getEtatConstate() == com.gmpp.enums.EtatConstate.NORMAL || 
                             i.getEtatConstate() == com.gmpp.enums.EtatConstate.USURE_DETECTEE)
                .count();

        long machinesTotales = machineRepository.count();
        long machinesEnService = machineRepository.countByStatut(com.gmpp.enums.StatutMachine.EN_SERVICE);
        long machinesEnMaintenance = machineRepository.countByStatut(com.gmpp.enums.StatutMachine.EN_MAINTENANCE);

        // Bug 1 fix: calcul du taux de disponibilité par machine, puis moyenne
        double totalMinutesPeriode = java.time.temporal.ChronoUnit.MINUTES.between(debutDt, finDt);
        double availability = 100.0;
        if (machinesTotales > 0 && totalMinutesPeriode > 0) {
            Map<UUID, Integer> downtimeByMachine = listPeriod.stream()
                    .filter(i -> i.getStatut() == StatutIntervention.TERMINEE && i.getDureeMinutes() != null)
                    .collect(Collectors.groupingBy(
                            i -> i.getMachine().getId(),
                            Collectors.summingInt(Intervention::getDureeMinutes)
                    ));
            double avgAvailability = downtimeByMachine.isEmpty() ? 100.0 :
                    downtimeByMachine.values().stream()
                            .mapToDouble(downtime -> Math.max(0.0, (1.0 - (downtime / totalMinutesPeriode)) * 100.0))
                            .average()
                            .orElse(100.0);
            availability = Math.min(100.0, Math.max(0.0, avgAvailability));
        }

        long totalInterventions = planifiees + terminees + enRetard + enCours;
        double tauxRealisation = totalInterventions > 0 ? (double) terminees / totalInterventions * 100 : 0;

        List<Intervention> termineesForAvg = interventionRepository.findByStatut(StatutIntervention.TERMINEE)
                .stream()
                .filter(i -> i.getDureeMinutes() != null)
                .collect(Collectors.toList());
        double tempsMoyen = termineesForAvg.stream()
                .mapToInt(Intervention::getDureeMinutes)
                .average()
                .orElse(0);

        Map<String, Double> tempsParType = termineesForAvg.stream()
                .filter(i -> i.getPointMaintenance() != null)
                .collect(Collectors.groupingBy(
                        i -> i.getPointMaintenance().getTypeOperation().name(),
                        Collectors.averagingInt(Intervention::getDureeMinutes)
                ));

        Map<UUID, Long> machineInterventionCount = interventionRepository.findByDatePlanifieeBetween(debutDt, finDt)
                .stream()
                .collect(Collectors.groupingBy(i -> i.getMachine().getId(), Collectors.counting()));

        // Bug 6 fix: pré-charger toutes les machines en une seule requête (évite N+1)
        List<UUID> machineIds = new ArrayList<>(machineInterventionCount.keySet());
        Map<UUID, Machine> machinesMap = machineRepository.findAllById(machineIds)
                .stream().collect(Collectors.toMap(Machine::getId, m -> m));

        List<DashboardStatsDTO.TopMachineDTO> topMachines = machineInterventionCount.entrySet().stream()
                .sorted(Map.Entry.<UUID, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Machine machine = machinesMap.get(entry.getKey());
                    return DashboardStatsDTO.TopMachineDTO.builder()
                            .machineId(entry.getKey())
                            .machineNom(machine != null ? machine.getNom() : "Inconnue")
                            .nbInterventions(entry.getValue())
                            .build();
                })
                .collect(Collectors.toList());

        // Feat 6: coût de maintenance par machine
        Map<String, Double> coutParMachine = listPeriod.stream()
                .filter(i -> i.getCoutReel() != null)
                .collect(Collectors.groupingBy(
                        i -> i.getMachine().getNom(),
                        Collectors.summingDouble(Intervention::getCoutReel)
                ));

        Map<String, Long> interventionsParMois = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            LocalDateTime monthStart = ym.atDay(1).atStartOfDay();
            LocalDateTime monthEnd = ym.atEndOfMonth().atTime(23, 59, 59);
            long count = interventionRepository.findByDatePlanifieeBetween(monthStart, monthEnd).size();
            interventionsParMois.put(ym.toString(), count);
        }

        return DashboardStatsDTO.builder()
                .tauxRealisation(Math.round(tauxRealisation * 100.0) / 100.0)
                .nbInterventionsPlanifiees(planifiees)
                .nbInterventionsTerminees(terminees)
                .nbInterventionsEnRetard(enRetard)
                .nbMachinesEnService(machinesEnService)
                .nbMachinesEnMaintenance(machinesEnMaintenance)
                .tempsMoyenIntervention(Math.round(tempsMoyen * 100.0) / 100.0)
                .topMachines(topMachines)
                .interventionsParMois(interventionsParMois)
                .tauxDisponibilite(Math.round(availability * 100.0) / 100.0)
                .coutTotalMaintenance(totalCout)
                .coutParMachine(coutParMachine)
                .nbPannesEvitees(pannesEvitees)
                .tempsMoyenParTypeOperation(tempsParType)
                .build();
    }

    @Override
    public List<InterventionResponse> getInterventionsEnRetard() {
        return interventionMapper.toResponseList(
                interventionRepository.findInterventionsEnRetard(LocalDateTime.now()));
    }

    @Override
    public void updatePhoto(UUID id, String photoUrl) {
        Intervention intervention = findById(id);
        intervention.setPhotoUrl(photoUrl);
        interventionRepository.save(intervention);
    }

    @Override
    public InterventionResponse validerIntervention(UUID id) {
        Intervention intervention = findById(id);
        if (intervention.getStatut() != StatutIntervention.TERMINEE) {
            throw new BusinessException("Seule une intervention terminée peut être validée.");
        }
        intervention.setValidationResponsable(true);
        return interventionMapper.toResponse(interventionRepository.save(intervention));
    }

    @Override
    public InterventionResponse updateStatut(UUID id, StatutIntervention statut) {
        Intervention intervention = findById(id);
        StatutIntervention current = intervention.getStatut();

        // Validate lifecycle transitions
        boolean valid = switch (statut) {
            case EN_COURS -> current == StatutIntervention.PLANIFIEE || current == StatutIntervention.EN_RETARD || current == StatutIntervention.PREVENTIVE;
            case TERMINEE -> current == StatutIntervention.EN_COURS;
            case ANNULEE -> current != StatutIntervention.TERMINEE;
            case PLANIFIEE -> current == StatutIntervention.EN_RETARD || current == StatutIntervention.PREVENTIVE;
            default -> false;
        };

        if (!valid) {
            throw new BusinessException(
                    String.format("Transition de statut invalide : %s → %s", current, statut));
        }

        intervention.setStatut(statut);
        if (statut == StatutIntervention.EN_COURS && intervention.getDateReelle() == null) {
            intervention.setDateReelle(LocalDateTime.now());
        }

        Intervention saved = interventionRepository.save(intervention);
        chargerAssociationsPourNotification(saved);
        emailNotificationService.notifierChangementStatut(saved, current);

        return interventionMapper.toResponse(saved);
    }

    @Override
    public InterventionResponse addImages(UUID id, List<String> imageUrls) {
        Intervention intervention = findById(id);
        for (String url : imageUrls) {
            InterventionImage image = InterventionImage.builder()
                    .imageUrl(url)
                    .intervention(intervention)
                    .build();
            interventionImageRepository.save(image);
            intervention.getImages().add(image);
        }
        return interventionMapper.toResponse(interventionRepository.save(intervention));
    }

    @Override
    public void removeImage(UUID interventionId, UUID imageId) {
        Intervention intervention = findById(interventionId);
        intervention.getImages().removeIf(img -> img.getId().equals(imageId));
        interventionRepository.save(intervention);
    }

    private Intervention findById(UUID id) {
        return interventionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention", "id", id));
    }
}

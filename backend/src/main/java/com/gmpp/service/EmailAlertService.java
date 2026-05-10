package com.gmpp.service;

import com.gmpp.dto.InterventionResponse;
import com.gmpp.entity.Intervention;
import com.gmpp.enums.StatutIntervention;
import com.gmpp.repository.InterventionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service d'envoi d'emails pour les alertes de maintenance planifiée.
 * Actif uniquement si spring.mail.username est configuré.
 * Feat 3 — Fonctionnalité manquante audit.
 */
@Service
@ConditionalOnProperty(name = "spring.mail.username", matchIfMissing = false)
public class EmailAlertService {

    private static final Logger logger = LoggerFactory.getLogger(EmailAlertService.class);

    private final JavaMailSender mailSender;
    private final InterventionRepository interventionRepository;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${gmpp.alert.email.enabled:false}")
    private boolean alertEmailEnabled;

    public EmailAlertService(JavaMailSender mailSender, InterventionRepository interventionRepository) {
        this.mailSender = mailSender;
        this.interventionRepository = interventionRepository;
    }

    /**
     * Envoi quotidien des alertes J-7, J-3, J-1 à 6h30 chaque matin.
     */
    @Scheduled(cron = "0 30 6 * * *")
    @Transactional(readOnly = true)
    public void envoyerAlertesDeMaintenance() {
        if (!alertEmailEnabled) {
            logger.debug("Alertes email désactivées (gmpp.alert.email.enabled=false)");
            return;
        }

        LocalDate today = LocalDate.now();
        LocalDateTime j7End = today.plusDays(7).atTime(23, 59, 59);

        List<Intervention> interventionsAlertes = interventionRepository
                .findForCalendar(today.atStartOfDay(), j7End)
                .stream()
                .filter(i -> i.getStatut() == StatutIntervention.PLANIFIEE
                        || i.getStatut() == StatutIntervention.EN_RETARD)
                .filter(i -> i.getTechnicien() != null && i.getTechnicien().getEmail() != null)
                .collect(Collectors.toList());

        int envoyees = 0;
        for (Intervention intervention : interventionsAlertes) {
            long days = ChronoUnit.DAYS.between(today, intervention.getDatePlanifiee().toLocalDate());
            String priorite = days <= 1 ? "🔴 [J-1] URGENTE" : days <= 3 ? "🟠 [J-3] Importante" : "🔵 [J-7] Rappel";

            try {
                envoyerEmailTechnicien(intervention, priorite, days);
                envoyees++;
            } catch (Exception e) {
                logger.warn("Impossible d'envoyer l'alerte pour intervention {} : {}", intervention.getId(), e.getMessage());
            }
        }

        logger.info("Alertes de maintenance envoyées : {} sur {} interventions", envoyees, interventionsAlertes.size());
    }

    private void envoyerEmailTechnicien(Intervention intervention, String priorite, long days) {
        String techEmail = intervention.getTechnicien().getEmail();
        String techNom = intervention.getTechnicien().getPrenom() + " " + intervention.getTechnicien().getNom();
        String machineNom = intervention.getMachine().getNom();
        String dateStr = intervention.getDatePlanifiee().toLocalDate().toString();
        String typeOp = intervention.getPointMaintenance() != null
                ? intervention.getPointMaintenance().getTypeOperation().name()
                : "Non spécifié";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(techEmail);
        message.setSubject(String.format("[GMPP] %s — Intervention dans %d jour(s)", priorite, days));
        message.setText(String.format(
                "Bonjour %s,%n%n" +
                "Rappel de maintenance préventive planifiée :%n%n" +
                "  Machine     : %s%n" +
                "  Opération   : %s%n" +
                "  Date prévue : %s%n" +
                "  Urgence     : %s%n%n" +
                "Veuillez vous connecter au système GMPP pour consulter les détails et démarrer l'intervention.%n%n" +
                "Cordialement,%nSystème GMPP — Maintenance Préventive",
                techNom, machineNom, typeOp, dateStr, priorite
        ));

        mailSender.send(message);
        logger.debug("Alerte email envoyée à {} pour l'intervention {} (machine: {})", techEmail, intervention.getId(), machineNom);
    }
}

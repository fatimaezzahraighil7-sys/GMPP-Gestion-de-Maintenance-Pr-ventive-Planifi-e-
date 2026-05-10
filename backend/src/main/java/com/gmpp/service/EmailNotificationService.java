package com.gmpp.service;

import com.gmpp.entity.Intervention;
import com.gmpp.entity.Utilisateur;
import com.gmpp.enums.StatutIntervention;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service de notifications email événementielles.
 * Déclenché lors de la création, changement de statut, ou assignation d'une intervention.
 * Envoi asynchrone pour ne pas bloquer les flux principaux.
 */
@Service
@ConditionalOnProperty(name = "spring.mail.username", matchIfMissing = false)
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${gmpp.notification.email.enabled:false}")
    private boolean notificationEnabled;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Notification lors de la création d'une nouvelle intervention.
     */
    @Async("emailTaskExecutor")
    public void notifierNouvelleIntervention(Intervention intervention) {
        if (!notificationEnabled) return;
        if (intervention.getTechnicien() == null || intervention.getTechnicien().getEmail() == null) return;

        try {
            String techEmail = intervention.getTechnicien().getEmail();
            String techNom = intervention.getTechnicien().getPrenom() + " " + intervention.getTechnicien().getNom();
            String machineNom = intervention.getMachine().getNom();
            String dateStr = intervention.getDatePlanifiee().toLocalDate().toString();

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(techEmail);
            message.setSubject("[GMPP] 🆕 Nouvelle intervention planifiée — " + machineNom);
            message.setText(String.format(
                    "Bonjour %s,%n%n" +
                    "Une nouvelle intervention de maintenance a été planifiée pour vous :%n%n" +
                    "  Machine     : %s%n" +
                    "  Date prévue : %s%n" +
                    "  Observations: %s%n%n" +
                    "Veuillez vous connecter au système GMPP pour consulter les détails.%n%n" +
                    "Cordialement,%nSystème GMPP — Maintenance Préventive",
                    techNom, machineNom, dateStr,
                    intervention.getObservations() != null ? intervention.getObservations() : "Aucune"
            ));

            mailSender.send(message);
            logger.info("📧 Notification nouvelle intervention envoyée à {} pour machine {}", techEmail, machineNom);
        } catch (Exception e) {
            logger.error("❌ Erreur envoi notification nouvelle intervention: {}", e.getMessage());
        }
    }

    /**
     * Notification lors d'un changement de statut.
     */
    @Async("emailTaskExecutor")
    public void notifierChangementStatut(Intervention intervention, StatutIntervention ancienStatut) {
        if (!notificationEnabled) return;
        if (intervention.getTechnicien() == null || intervention.getTechnicien().getEmail() == null) return;

        try {
            String techEmail = intervention.getTechnicien().getEmail();
            String techNom = intervention.getTechnicien().getPrenom() + " " + intervention.getTechnicien().getNom();
            String machineNom = intervention.getMachine().getNom();

            String emoji = switch (intervention.getStatut()) {
                case EN_COURS -> "▶️";
                case TERMINEE -> "✅";
                case ANNULEE -> "❌";
                case EN_RETARD -> "⚠️";
                default -> "📋";
            };

            String statutLabel = switch (intervention.getStatut()) {
                case PREVENTIVE -> "Préventive";
                case PLANIFIEE -> "Planifiée";
                case EN_COURS -> "En cours";
                case TERMINEE -> "Terminée";
                case ANNULEE -> "Annulée";
                case EN_RETARD -> "En retard";
            };

            String ancienLabel = switch (ancienStatut) {
                case PREVENTIVE -> "Préventive";
                case PLANIFIEE -> "Planifiée";
                case EN_COURS -> "En cours";
                case TERMINEE -> "Terminée";
                case ANNULEE -> "Annulée";
                case EN_RETARD -> "En retard";
            };

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(techEmail);
            message.setSubject(String.format("[GMPP] %s Changement de statut — %s", emoji, machineNom));
            message.setText(String.format(
                    "Bonjour %s,%n%n" +
                    "Le statut de votre intervention a été modifié :%n%n" +
                    "  Machine        : %s%n" +
                    "  Ancien statut  : %s%n" +
                    "  Nouveau statut : %s%n%n" +
                    "Veuillez vous connecter au système GMPP pour plus de détails.%n%n" +
                    "Cordialement,%nSystème GMPP — Maintenance Préventive",
                    techNom, machineNom, ancienLabel, statutLabel
            ));

            mailSender.send(message);
            logger.info("📧 Notification changement statut ({} → {}) envoyée à {}", ancienLabel, statutLabel, techEmail);
        } catch (Exception e) {
            logger.error("❌ Erreur envoi notification changement statut: {}", e.getMessage());
        }
    }

    /**
     * Notification lors de l'assignation d'un technicien à une intervention.
     */
    @Async("emailTaskExecutor")
    public void notifierAssignation(Intervention intervention, Utilisateur technicien) {
        if (!notificationEnabled) return;
        if (technicien == null || technicien.getEmail() == null) return;

        try {
            String techEmail = technicien.getEmail();
            String techNom = technicien.getPrenom() + " " + technicien.getNom();
            String machineNom = intervention.getMachine().getNom();
            String dateStr = intervention.getDatePlanifiee().toLocalDate().toString();

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(techEmail);
            message.setSubject("[GMPP] 👤 Intervention assignée — " + machineNom);
            message.setText(String.format(
                    "Bonjour %s,%n%n" +
                    "Vous avez été assigné(e) à une intervention de maintenance :%n%n" +
                    "  Machine     : %s%n" +
                    "  Date prévue : %s%n" +
                    "  Statut      : %s%n%n" +
                    "Veuillez vous connecter au système GMPP pour consulter les détails et préparer votre intervention.%n%n" +
                    "Cordialement,%nSystème GMPP — Maintenance Préventive",
                    techNom, machineNom, dateStr, intervention.getStatut()
            ));

            mailSender.send(message);
            logger.info("📧 Notification assignation envoyée à {} pour machine {}", techEmail, machineNom);
        } catch (Exception e) {
            logger.error("❌ Erreur envoi notification assignation: {}", e.getMessage());
        }
    }
}

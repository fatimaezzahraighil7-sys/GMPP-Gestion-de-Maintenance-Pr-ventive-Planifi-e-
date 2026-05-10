package com.gmpp.service;

import com.gmpp.dto.*;
import com.gmpp.enums.StatutIntervention;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface InterventionService {
    InterventionResponse planifier(InterventionRequest request);
    InterventionResponse getById(UUID id);
    Page<InterventionResponse> getAll(UUID machineId, StatutIntervention statut, UUID technicienId,
                                       LocalDate debut, LocalDate fin, Pageable pageable);
    InterventionResponse update(UUID id, InterventionRequest request);
    void delete(UUID id);
    InterventionResponse demarrer(UUID id);
    InterventionResponse terminer(UUID id, TerminerInterventionRequest request);
    InterventionResponse annuler(UUID id, String justification);
    void detecterInterventionsEnRetard();
    List<InterventionCalendarDTO> getCalendar(LocalDate debut, LocalDate fin);
    List<InterventionCalendarDTO> getTechnicienPlanning(UUID techId, LocalDate debut, LocalDate fin);
    DashboardStatsDTO getStatistiques(LocalDate debut, LocalDate fin);
    List<InterventionResponse> getInterventionsEnRetard();
    
    void updatePhoto(UUID id, String photoUrl);
    InterventionResponse validerIntervention(UUID id);
    InterventionResponse updateStatut(UUID id, StatutIntervention statut);
    InterventionResponse addImages(UUID id, List<String> imageUrls);
    void removeImage(UUID interventionId, UUID imageId);
}

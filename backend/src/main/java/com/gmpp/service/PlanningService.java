package com.gmpp.service;

import com.gmpp.dto.InterventionCalendarDTO;
import com.gmpp.dto.InterventionResponse;

import java.util.List;
import java.util.UUID;

public interface PlanningService {
    List<InterventionResponse> genererInterventionsPlanifiees();
    InterventionResponse assignerTechnicien(UUID interventionId, UUID technicienId);
    InterventionResponse reprogrammer(UUID interventionId, java.time.LocalDateTime nouvelleDatePlanifiee, String justification);
    InterventionResponse assignerAutomatiquement(UUID interventionId);
    List<InterventionResponse> getAlertes();
}

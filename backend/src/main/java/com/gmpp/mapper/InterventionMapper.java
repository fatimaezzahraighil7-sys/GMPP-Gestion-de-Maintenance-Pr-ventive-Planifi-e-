package com.gmpp.mapper;

import com.gmpp.dto.InterventionCalendarDTO;
import com.gmpp.dto.InterventionResponse;
import com.gmpp.entity.Intervention;
import com.gmpp.entity.InterventionImage;
import com.gmpp.enums.StatutIntervention;
import org.mapstruct.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface InterventionMapper {

    @Mapping(target = "machineId", source = "machine.id")
    @Mapping(target = "machineNom", source = "machine.nom")
    @Mapping(target = "pointMaintenanceId", source = "pointMaintenance.id")
    @Mapping(target = "pointMaintenanceDescription", source = "pointMaintenance.description")
    @Mapping(target = "technicienId", source = "technicien.id")
    @Mapping(target = "technicienNom", source = "technicien.nom")
    @Mapping(target = "technicienPrenom", source = "technicien.prenom")
    @Mapping(target = "imageUrls", expression = "java(mapImageUrls(intervention))")
    @Mapping(target = "alertLabel", ignore = true)
    InterventionResponse toResponse(Intervention intervention);

    List<InterventionResponse> toResponseList(List<Intervention> interventions);

    default List<String> mapImageUrls(Intervention intervention) {
        if (intervention.getImages() == null || intervention.getImages().isEmpty()) {
            return Collections.emptyList();
        }
        return intervention.getImages().stream()
                .map(InterventionImage::getImageUrl)
                .collect(Collectors.toList());
    }

    default InterventionCalendarDTO toCalendarDTO(Intervention intervention) {
        return InterventionCalendarDTO.builder()
                .id(intervention.getId())
                .title(intervention.getMachine().getNom() + " - " +
                       (intervention.getPointMaintenance() != null ?
                        intervention.getPointMaintenance().getTypeOperation().name() : "Intervention"))
                .start(intervention.getDatePlanifiee().toString())
                .end(intervention.getDatePlanifiee().plusHours(2).toString())
                .color(getColorForStatut(intervention.getStatut()))
                .statut(intervention.getStatut())
                .machineNom(intervention.getMachine().getNom())
                .technicienNom(intervention.getTechnicien() != null ?
                        intervention.getTechnicien().getNom() + " " + intervention.getTechnicien().getPrenom() : "Non assigné")
                .build();
    }

    default String getColorForStatut(StatutIntervention statut) {
        return switch (statut) {
            case PREVENTIVE -> "#9C27B0";
            case PLANIFIEE -> "#3B82F6";
            case EN_COURS -> "#F59E0B";
            case TERMINEE -> "#10B981";
            case ANNULEE -> "#6B7280";
            case EN_RETARD -> "#EF4444";
        };
    }
}

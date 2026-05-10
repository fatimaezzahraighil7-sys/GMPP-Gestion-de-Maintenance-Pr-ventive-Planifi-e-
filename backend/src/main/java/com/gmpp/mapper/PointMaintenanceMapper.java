package com.gmpp.mapper;

import com.gmpp.dto.PointMaintenanceRequest;
import com.gmpp.dto.PointMaintenanceResponse;
import com.gmpp.entity.PointMaintenance;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PointMaintenanceMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "machine", ignore = true)
    @Mapping(target = "interventions", ignore = true)
    @Mapping(target = "prochaineIntervention", ignore = true)
    @Mapping(target = "dernierCompteur", ignore = true)
    PointMaintenance toEntity(PointMaintenanceRequest request);

    @Mapping(target = "machineId", source = "machine.id")
    @Mapping(target = "machineNom", source = "machine.nom")
    PointMaintenanceResponse toResponse(PointMaintenance pointMaintenance);

    List<PointMaintenanceResponse> toResponseList(List<PointMaintenance> points);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "machine", ignore = true)
    @Mapping(target = "interventions", ignore = true)
    @Mapping(target = "prochaineIntervention", ignore = true)
    @Mapping(target = "dernierCompteur", ignore = true)
    void updateEntity(PointMaintenanceRequest request, @MappingTarget PointMaintenance entity);
}

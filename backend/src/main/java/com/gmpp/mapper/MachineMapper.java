package com.gmpp.mapper;

import com.gmpp.dto.MachineRequest;
import com.gmpp.dto.MachineResponse;
import com.gmpp.entity.Machine;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MachineMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "pointsMaintenances", ignore = true)
    @Mapping(target = "interventions", ignore = true)
    Machine toEntity(MachineRequest request);

    @Mapping(target = "nbPointsMaintenance", expression = "java(machine.getPointsMaintenances() != null ? machine.getPointsMaintenances().size() : 0)")
    @Mapping(target = "nbInterventions", expression = "java(machine.getInterventions() != null ? machine.getInterventions().size() : 0)")
    MachineResponse toResponse(Machine machine);

    List<MachineResponse> toResponseList(List<Machine> machines);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "pointsMaintenances", ignore = true)
    @Mapping(target = "interventions", ignore = true)
    void updateEntity(MachineRequest request, @MappingTarget Machine machine);
}

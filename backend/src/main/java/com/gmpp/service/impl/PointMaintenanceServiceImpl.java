package com.gmpp.service.impl;

import com.gmpp.dto.PointMaintenanceRequest;
import com.gmpp.dto.PointMaintenanceResponse;
import com.gmpp.entity.Machine;
import com.gmpp.entity.PointMaintenance;
import com.gmpp.enums.Frequence;
import com.gmpp.exception.ResourceNotFoundException;
import com.gmpp.mapper.PointMaintenanceMapper;
import com.gmpp.repository.MachineRepository;
import com.gmpp.repository.PointMaintenanceRepository;
import com.gmpp.service.PointMaintenanceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PointMaintenanceServiceImpl implements PointMaintenanceService {

    private final PointMaintenanceRepository pointMaintenanceRepository;
    private final MachineRepository machineRepository;
    private final PointMaintenanceMapper mapper;

    public PointMaintenanceServiceImpl(PointMaintenanceRepository pointMaintenanceRepository,
                                       MachineRepository machineRepository,
                                       PointMaintenanceMapper mapper) {
        this.pointMaintenanceRepository = pointMaintenanceRepository;
        this.machineRepository = machineRepository;
        this.mapper = mapper;
    }

    @Override
    public PointMaintenanceResponse create(PointMaintenanceRequest request) {
        Machine machine = machineRepository.findById(request.getMachineId())
                .orElseThrow(() -> new ResourceNotFoundException("Machine", "id", request.getMachineId()));

        PointMaintenance point = mapper.toEntity(request);
        point.setMachine(machine);
        point.setProchaineIntervention(calculateProchaineIntervention(point.getFrequence(), LocalDate.now()));

        PointMaintenance saved = pointMaintenanceRepository.save(point);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PointMaintenanceResponse getById(UUID id) {
        PointMaintenance point = findById(id);
        return mapper.toResponse(point);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PointMaintenanceResponse> getByMachineId(UUID machineId) {
        return mapper.toResponseList(pointMaintenanceRepository.findByMachineId(machineId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PointMaintenanceResponse> getByFrequence(Frequence frequence) {
        return mapper.toResponseList(pointMaintenanceRepository.findByFrequence(frequence));
    }

    @Override
    public PointMaintenanceResponse update(UUID id, PointMaintenanceRequest request) {
        PointMaintenance point = findById(id);
        Machine machine = machineRepository.findById(request.getMachineId())
                .orElseThrow(() -> new ResourceNotFoundException("Machine", "id", request.getMachineId()));

        mapper.updateEntity(request, point);
        point.setMachine(machine);
        point.setProchaineIntervention(calculateProchaineIntervention(point.getFrequence(), LocalDate.now()));

        PointMaintenance updated = pointMaintenanceRepository.save(point);
        return mapper.toResponse(updated);
    }

    @Override
    public void delete(UUID id) {
        PointMaintenance point = findById(id);
        pointMaintenanceRepository.delete(point);
    }

    @Override
    public LocalDate calculateProchaineIntervention(UUID pointId, LocalDate dateExecution) {
        PointMaintenance point = findById(pointId);
        return calculateProchaineIntervention(point.getFrequence(), dateExecution);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PointMaintenanceResponse> getPointsEnRetard() {
        return mapper.toResponseList(pointMaintenanceRepository.findPointsEnRetard(LocalDate.now()));
    }

    @Override
    public void updateProchaineInterventionApresExecution(UUID pointId, LocalDate dateExecution) {
        PointMaintenance point = findById(pointId);
        if (point.getFrequence() == Frequence.PAR_HEURES) {
            point.setDernierCompteur(point.getMachine().getCompteurHoraire());
            point.setProchaineIntervention(null);
        } else {
            LocalDate prochaine = calculateProchaineIntervention(point.getFrequence(), dateExecution);
            point.setProchaineIntervention(prochaine);
        }
        pointMaintenanceRepository.save(point);
    }

    private LocalDate calculateProchaineIntervention(Frequence frequence, LocalDate baseDate) {
        return switch (frequence) {
            case QUOTIDIENNE -> baseDate.plusDays(1);
            case HEBDOMADAIRE -> baseDate.plusWeeks(1);
            case MENSUELLE -> baseDate.plusMonths(1);
            case TRIMESTRIELLE -> baseDate.plusMonths(3);
            case SEMESTRIELLE -> baseDate.plusMonths(6);
            case ANNUELLE -> baseDate.plusYears(1);
            case PAR_HEURES -> null;
        };
    }

    private PointMaintenance findById(UUID id) {
        return pointMaintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PointMaintenance", "id", id));
    }
}

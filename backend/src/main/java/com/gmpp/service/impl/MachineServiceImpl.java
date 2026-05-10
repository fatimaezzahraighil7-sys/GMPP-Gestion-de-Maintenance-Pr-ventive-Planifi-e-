package com.gmpp.service.impl;

import com.gmpp.dto.InterventionResponse;
import com.gmpp.dto.MachineRequest;
import com.gmpp.dto.MachineResponse;
import com.gmpp.dto.MachineStatsResponse;
import com.gmpp.entity.Machine;
import com.gmpp.enums.StatutMachine;
import com.gmpp.enums.TypeMachine;
import com.gmpp.exception.BusinessException;
import com.gmpp.exception.ResourceNotFoundException;
import com.gmpp.mapper.InterventionMapper;
import com.gmpp.mapper.MachineMapper;
import com.gmpp.repository.InterventionRepository;
import com.gmpp.repository.MachineRepository;
import com.gmpp.service.MachineService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class MachineServiceImpl implements MachineService {

    private final MachineRepository machineRepository;
    private final InterventionRepository interventionRepository;
    private final MachineMapper machineMapper;
    private final InterventionMapper interventionMapper;

    public MachineServiceImpl(MachineRepository machineRepository,
                              InterventionRepository interventionRepository,
                              MachineMapper machineMapper,
                              InterventionMapper interventionMapper) {
        this.machineRepository = machineRepository;
        this.interventionRepository = interventionRepository;
        this.machineMapper = machineMapper;
        this.interventionMapper = interventionMapper;
    }

    @Override
    public MachineResponse create(MachineRequest request) {
        if (machineRepository.findByNumeroSerie(request.getNumeroSerie()).isPresent()) {
            throw new BusinessException("Une machine avec le numéro de série '" + request.getNumeroSerie() + "' existe déjà");
        }
        Machine machine = machineMapper.toEntity(request);
        if (machine.getStatut() == null) {
            machine.setStatut(StatutMachine.EN_SERVICE);
        }
        if (machine.getCompteurHoraire() == null) {
            machine.setCompteurHoraire(0.0);
        }
        Machine saved = machineRepository.save(machine);
        return machineMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MachineResponse getById(UUID id) {
        Machine machine = findMachineById(id);
        return machineMapper.toResponse(machine);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MachineResponse> getAll(StatutMachine statut, TypeMachine type, String search, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Machine> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (statut != null) {
                predicates.add(cb.equal(root.get("statut"), statut));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("typeMachine"), type));
            }
            if (search != null && !search.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("nom")), "%" + search.trim().toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        return machineRepository.findAll(spec, pageable).map(machineMapper::toResponse);
    }

    @Override
    public MachineResponse update(UUID id, MachineRequest request) {
        Machine machine = findMachineById(id);
        machineRepository.findByNumeroSerie(request.getNumeroSerie())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new BusinessException("Le numéro de série '" + request.getNumeroSerie() + "' est déjà utilisé");
                    }
                });
        machineMapper.updateEntity(request, machine);
        Machine updated = machineRepository.save(machine);
        return machineMapper.toResponse(updated);
    }

    @Override
    public void delete(UUID id) {
        Machine machine = findMachineById(id);
        machineRepository.delete(machine);
    }

    @Override
    public MachineResponse updateStatut(UUID id, StatutMachine statut) {
        Machine machine = findMachineById(id);
        machine.setStatut(statut);
        Machine updated = machineRepository.save(machine);
        return machineMapper.toResponse(updated);
    }

    @Override
    public MachineResponse updateCompteurHoraire(UUID id, Double heures) {
        Machine machine = findMachineById(id);
        if (heures < machine.getCompteurHoraire()) {
            throw new BusinessException("Le compteur horaire ne peut pas diminuer");
        }
        machine.setCompteurHoraire(heures);
        Machine updated = machineRepository.save(machine);
        return machineMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public MachineStatsResponse getMachinesStats() {
        Map<StatutMachine, Long> countByStatut = new EnumMap<>(StatutMachine.class);
        for (StatutMachine statut : StatutMachine.values()) {
            countByStatut.put(statut, machineRepository.countByStatut(statut));
        }
        return MachineStatsResponse.builder()
                .totalMachines(machineRepository.count())
                .countByStatut(countByStatut)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterventionResponse> getHistoriqueInterventions(UUID machineId) {
        findMachineById(machineId);
        return interventionMapper.toResponseList(interventionRepository.findByMachineId(machineId));
    }

    private Machine findMachineById(UUID id) {
        return machineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Machine", "id", id));
    }
}

package com.gmpp.repository;

import com.gmpp.entity.Machine;
import com.gmpp.enums.StatutMachine;
import com.gmpp.enums.TypeMachine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface MachineRepository extends JpaRepository<Machine, UUID>, JpaSpecificationExecutor<Machine> {

    List<Machine> findByStatut(StatutMachine statut);

    List<Machine> findByTypeMachine(TypeMachine typeMachine);

    List<Machine> findByLocalisation(String localisation);

    Optional<Machine> findByNumeroSerie(String numeroSerie);

    long countByStatut(StatutMachine statut);

    @Query("SELECT m FROM Machine m WHERE LOWER(m.nom) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Machine> searchByNomContaining(@Param("search") String search, Pageable pageable);

    @Query("SELECT m FROM Machine m WHERE " +
           "(:statut IS NULL OR m.statut = :statut) AND " +
           "(:typeMachine IS NULL OR m.typeMachine = :typeMachine) AND " +
           "(:search IS NULL OR LOWER(m.nom) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Machine> findWithFilters(
            @Param("statut") StatutMachine statut,
            @Param("typeMachine") TypeMachine typeMachine,
            @Param("search") String search,
            Pageable pageable);
}

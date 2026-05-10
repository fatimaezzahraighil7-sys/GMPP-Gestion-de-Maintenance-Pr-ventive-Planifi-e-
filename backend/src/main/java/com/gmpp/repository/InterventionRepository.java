package com.gmpp.repository;

import com.gmpp.entity.Intervention;
import com.gmpp.enums.StatutIntervention;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface InterventionRepository extends JpaRepository<Intervention, UUID>, JpaSpecificationExecutor<Intervention> {

    List<Intervention> findByMachineId(UUID machineId);

    List<Intervention> findByTechnicienId(UUID technicienId);

    List<Intervention> findByStatut(StatutIntervention statut);

    List<Intervention> findByDatePlanifieeBetween(LocalDateTime debut, LocalDateTime fin);

    List<Intervention> findByPointMaintenanceId(UUID pointMaintenanceId);

    @Query("SELECT i FROM Intervention i WHERE i.statut IN ('PLANIFIEE', 'EN_RETARD') AND i.datePlanifiee < :now")
    List<Intervention> findInterventionsEnRetard(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(i) FROM Intervention i WHERE i.statut = :statut AND i.datePlanifiee BETWEEN :debut AND :fin")
    long countByStatutAndDateBetween(
            @Param("statut") StatutIntervention statut,
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin);

    @Query("SELECT i FROM Intervention i WHERE " +
           "(:machineId IS NULL OR i.machine.id = :machineId) AND " +
           "(:statut IS NULL OR i.statut = :statut) AND " +
           "(:technicienId IS NULL OR i.technicien.id = :technicienId) AND " +
           "(:debut IS NULL OR i.datePlanifiee >= :debut) AND " +
           "(:fin IS NULL OR i.datePlanifiee <= :fin)")
    Page<Intervention> findWithFilters(
            @Param("machineId") UUID machineId,
            @Param("statut") StatutIntervention statut,
            @Param("technicienId") UUID technicienId,
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin,
            Pageable pageable);

    @Query("SELECT i FROM Intervention i WHERE i.datePlanifiee BETWEEN :debut AND :fin")
    List<Intervention> findForCalendar(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("SELECT i FROM Intervention i WHERE i.technicien.id = :technicienId AND i.datePlanifiee BETWEEN :debut AND :fin")
    List<Intervention> findByTechnicienAndDateBetween(
            @Param("technicienId") UUID technicienId,
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin);

    long countByTechnicienIdAndStatut(UUID technicienId, StatutIntervention statut);

    long countByTechnicienIdAndStatutIn(UUID technicienId, java.util.Collection<StatutIntervention> statuts);
}

package com.voltreserve.backend.repository;

import com.voltreserve.backend.entity.Charger;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChargerRepository extends JpaRepository<Charger, Long> {
    List<Charger> findByStationId(Long stationId);
    List<Charger> findByStationIdAndStatus(Long stationId, String status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Charger c WHERE c.id = :id")
    Optional<Charger> findByIdWithLock(@Param("id") Long id);
}

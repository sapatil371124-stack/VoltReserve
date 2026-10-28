package com.voltreserve.backend.repository;

import com.voltreserve.backend.entity.ChargingSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChargingSlotRepository extends JpaRepository<ChargingSlot, Long> {

    List<ChargingSlot> findByChargerIdOrderByStartTimeAsc(Long chargerId);

    List<ChargingSlot> findByChargerIdAndStartTimeBetweenOrderByStartTimeAsc(
            Long chargerId, LocalDateTime start, LocalDateTime end
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ChargingSlot s WHERE s.id = :id")
    Optional<ChargingSlot> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT s FROM ChargingSlot s WHERE s.status = 'HELD' AND s.holdExpiresAt < :now")
    List<ChargingSlot> findExpiredHolds(@Param("now") LocalDateTime now);

    @Query("SELECT s FROM ChargingSlot s WHERE s.charger.id = :chargerId " +
           "AND s.id != :excludeSlotId " +
           "AND s.status IN ('HELD', 'BOOKED', 'OCCUPIED') " +
           "AND (s.startTime < :endTime AND s.endTime > :startTime)")
    List<ChargingSlot> findOverlappingActiveSlots(
            @Param("chargerId") Long chargerId,
            @Param("excludeSlotId") Long excludeSlotId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    boolean existsByChargerIdAndStartTime(Long chargerId, LocalDateTime startTime);
}

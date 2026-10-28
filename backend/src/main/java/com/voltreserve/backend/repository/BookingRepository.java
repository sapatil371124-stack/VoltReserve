package com.voltreserve.backend.repository;

import com.voltreserve.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Booking> findByBookingReference(String bookingReference);

    Optional<Booking> findBySlotId(Long slotId);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByStatusIn(Collection<String> statuses);

    @Query("SELECT b FROM Booking b WHERE b.charger.id = :chargerId " +
           "AND b.status IN ('HELD', 'CONFIRMED', 'OCCUPIED') " +
           "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    List<Booking> findOverlappingActiveBookings(
            @Param("chargerId") Long chargerId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'CONFIRMED' OR b.status = 'COMPLETED'")
    long countConfirmedOrCompleted();

    @Query("SELECT b FROM Booking b WHERE b.status = 'HELD' AND b.holdExpiresAt < :now")
    List<Booking> findExpiredHolds(@Param("now") LocalDateTime now);
}

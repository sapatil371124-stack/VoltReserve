package com.voltreserve.backend.repository;

import com.voltreserve.backend.entity.ChargingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Long> {
    Optional<ChargingSession> findByBookingId(Long bookingId);
    List<ChargingSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ChargingSession> findAllByOrderByCreatedAtDesc();
}

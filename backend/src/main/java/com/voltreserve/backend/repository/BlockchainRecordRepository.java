package com.voltreserve.backend.repository;

import com.voltreserve.backend.entity.BlockchainRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockchainRecordRepository extends JpaRepository<BlockchainRecord, Long> {
    Optional<BlockchainRecord> findByBookingId(Long bookingId);
    Optional<BlockchainRecord> findTopByOrderByBlockIndexDesc();
    List<BlockchainRecord> findAllByOrderByBlockIndexAsc();
    Optional<BlockchainRecord> findByBlockIndex(Long blockIndex);
}

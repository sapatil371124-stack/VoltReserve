package com.voltreserve.backend.blockchain;

import com.voltreserve.backend.dto.BlockchainVerificationDto;
import com.voltreserve.backend.entity.BlockchainRecord;
import com.voltreserve.backend.entity.Booking;
import com.voltreserve.backend.exception.ResourceNotFoundException;
import com.voltreserve.backend.repository.BlockchainRecordRepository;
import com.voltreserve.backend.repository.BookingRepository;
import com.voltreserve.backend.util.HashUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BlockchainServiceImpl implements BlockchainService {

    private static final Logger logger = LoggerFactory.getLogger(BlockchainServiceImpl.class);
    private static final String GENESIS_PREVIOUS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

    @Autowired
    private BlockchainRecordRepository blockchainRecordRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public String buildCanonicalData(Booking b) {
        String slotIdentifier = (b.getSlot() != null) ? String.valueOf(b.getSlot().getId()) : "FLEX";
        return "bookingId:" + b.getId() +
                "|reference:" + b.getBookingReference() +
                "|userId:" + b.getUser().getId() +
                "|stationId:" + b.getCharger().getStation().getId() +
                "|chargerId:" + b.getCharger().getId() +
                "|slotId:" + slotIdentifier +
                "|startTime:" + b.getStartTime() +
                "|endTime:" + b.getEndTime() +
                "|amount:" + b.getTotalAmount().setScale(2) +
                "|status:" + b.getStatus();
    }

    @Override
    @Transactional
    public BlockchainRecord recordBooking(Booking booking) {
        Optional<BlockchainRecord> existing = blockchainRecordRepository.findByBookingId(booking.getId());
        if (existing.isPresent()) {
            return existing.get();
        }

        Optional<BlockchainRecord> lastBlockOpt = blockchainRecordRepository.findTopByOrderByBlockIndexDesc();
        long nextIndex = lastBlockOpt.map(r -> r.getBlockIndex() + 1).orElse(1L);
        String previousHash = lastBlockOpt.map(BlockchainRecord::getTransactionHash).orElse(GENESIS_PREVIOUS_HASH);

        String canonicalData = buildCanonicalData(booking);
        String payloadToHash = nextIndex + ":" + canonicalData + ":" + previousHash;
        String transactionHash = HashUtils.calculateSha256(payloadToHash);

        BlockchainRecord record = new BlockchainRecord();
        record.setBlockIndex(nextIndex);
        record.setBooking(booking);
        record.setCanonicalData(canonicalData);
        record.setPreviousHash(previousHash);
        record.setTransactionHash(transactionHash);
        record.setHashAlgorithm("SHA-256");
        record.setStatus("VERIFIED");

        logger.info("Recorded block #{} for booking {} with hash {}", nextIndex, booking.getBookingReference(), transactionHash);
        return blockchainRecordRepository.save(record);
    }

    @Override
    @Transactional(readOnly = true)
    public BlockchainVerificationDto verifyBooking(Long bookingId) {
        BlockchainRecord record = blockchainRecordRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("No blockchain record exists for booking ID: " + bookingId));

        Booking currentBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        String currentCanonicalData = buildCanonicalData(currentBooking);
        String currentPayloadToHash = record.getBlockIndex() + ":" + currentCanonicalData + ":" + record.getPreviousHash();
        String currentCalculatedHash = HashUtils.calculateSha256(currentPayloadToHash);

        boolean isMatch = currentCalculatedHash.equalsIgnoreCase(record.getTransactionHash());

        BlockchainVerificationDto dto = new BlockchainVerificationDto();
        dto.setBlockIndex(record.getBlockIndex());
        dto.setBookingId(bookingId);
        dto.setBookingReference(currentBooking.getBookingReference());
        dto.setRecordedTransactionHash(record.getTransactionHash());
        dto.setCalculatedHash(currentCalculatedHash);
        dto.setPreviousHash(record.getPreviousHash());
        dto.setCanonicalData(currentCanonicalData);
        dto.setHashAlgorithm(record.getHashAlgorithm());
        dto.setBlockTimestamp(record.getCreatedAt() != null ? record.getCreatedAt() : LocalDateTime.now());

        if (isMatch) {
            dto.setStatus("VERIFIED");
            dto.setTamperDetected(false);
            dto.setVerificationMessage("Integrity confirmed: Current database state matches cryptographic block header.");
        } else {
            dto.setStatus("TAMPER_DETECTED");
            dto.setTamperDetected(true);
            dto.setVerificationMessage("CRITICAL ALERT: Data alteration detected! Recalculated hash differs from recorded blockchain proof.");
        }

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlockchainRecord> getCompleteChain() {
        return blockchainRecordRepository.findAllByOrderByBlockIndexAsc();
    }

    @Override
    @Transactional(readOnly = true)
    public BlockchainRecord getRecordForBooking(Long bookingId) {
        return blockchainRecordRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("No blockchain record found for booking ID: " + bookingId));
    }

    @Override
    @Transactional
    public void simulateTamper(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        // Intentionally alter booking amount by 100 to trigger cryptographic mismatch
        booking.setTotalAmount(booking.getTotalAmount().add(new BigDecimal("100.00")));
        bookingRepository.save(booking);
        logger.warn("Simulated tampering for booking reference: {}", booking.getBookingReference());
    }
}

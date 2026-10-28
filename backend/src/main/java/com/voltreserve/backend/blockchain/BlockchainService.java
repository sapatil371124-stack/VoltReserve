package com.voltreserve.backend.blockchain;

import com.voltreserve.backend.dto.BlockchainVerificationDto;
import com.voltreserve.backend.entity.BlockchainRecord;
import com.voltreserve.backend.entity.Booking;

import java.util.List;

public interface BlockchainService {
    BlockchainRecord recordBooking(Booking booking);
    BlockchainVerificationDto verifyBooking(Long bookingId);
    List<BlockchainRecord> getCompleteChain();
    BlockchainRecord getRecordForBooking(Long bookingId);
    void simulateTamper(Long bookingId);
}

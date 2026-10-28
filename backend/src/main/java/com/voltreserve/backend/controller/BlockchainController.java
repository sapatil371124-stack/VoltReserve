package com.voltreserve.backend.controller;

import com.voltreserve.backend.blockchain.BlockchainService;
import com.voltreserve.backend.dto.BlockchainVerificationDto;
import com.voltreserve.backend.entity.BlockchainRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blockchain")
public class BlockchainController {

    @Autowired
    private BlockchainService blockchainService;

    @GetMapping("/chain")
    public ResponseEntity<List<BlockchainRecord>> getCompleteChain() {
        return ResponseEntity.ok(blockchainService.getCompleteChain());
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BlockchainRecord> getRecordForBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(blockchainService.getRecordForBooking(bookingId));
    }

    @PostMapping("/{bookingId}/verify")
    public ResponseEntity<BlockchainVerificationDto> verifyBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(blockchainService.verifyBooking(bookingId));
    }
}

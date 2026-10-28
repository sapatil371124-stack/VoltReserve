package com.voltreserve.backend.dto;

import java.time.LocalDateTime;

public class BlockchainVerificationDto {
    private Long blockIndex;
    private Long bookingId;
    private String bookingReference;
    private String recordedTransactionHash;
    private String calculatedHash;
    private String previousHash;
    private String canonicalData;
    private String hashAlgorithm;
    private String status; // VERIFIED, TAMPER_DETECTED
    private boolean isTamperDetected;
    private String verificationMessage;
    private LocalDateTime blockTimestamp;

    public BlockchainVerificationDto() {}

    public Long getBlockIndex() { return blockIndex; }
    public void setBlockIndex(Long blockIndex) { this.blockIndex = blockIndex; }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }
    public String getRecordedTransactionHash() { return recordedTransactionHash; }
    public void setRecordedTransactionHash(String recordedTransactionHash) { this.recordedTransactionHash = recordedTransactionHash; }
    public String getCalculatedHash() { return calculatedHash; }
    public void setCalculatedHash(String calculatedHash) { this.calculatedHash = calculatedHash; }
    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }
    public String getCanonicalData() { return canonicalData; }
    public void setCanonicalData(String canonicalData) { this.canonicalData = canonicalData; }
    public String getHashAlgorithm() { return hashAlgorithm; }
    public void setHashAlgorithm(String hashAlgorithm) { this.hashAlgorithm = hashAlgorithm; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isTamperDetected() { return isTamperDetected; }
    public void setTamperDetected(boolean tamperDetected) { isTamperDetected = tamperDetected; }
    public String getVerificationMessage() { return verificationMessage; }
    public void setVerificationMessage(String verificationMessage) { this.verificationMessage = verificationMessage; }
    public LocalDateTime getBlockTimestamp() { return blockTimestamp; }
    public void setBlockTimestamp(LocalDateTime blockTimestamp) { this.blockTimestamp = blockTimestamp; }
}

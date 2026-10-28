package com.voltreserve.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blockchain_records")
public class BlockchainRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "block_index", nullable = false, unique = true)
    private Long blockIndex;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Column(name = "transaction_hash", nullable = false, length = 64)
    private String transactionHash;

    @Column(name = "previous_hash", nullable = false, length = 64)
    private String previousHash;

    @Column(name = "canonical_data", nullable = false, columnDefinition = "TEXT")
    private String canonicalData;

    @Column(name = "hash_algorithm", nullable = false, length = 20)
    private String hashAlgorithm = "SHA-256";

    @Column(nullable = false, length = 20)
    private String status = "VERIFIED";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public BlockchainRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBlockIndex() { return blockIndex; }
    public void setBlockIndex(Long blockIndex) { this.blockIndex = blockIndex; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public String getTransactionHash() { return transactionHash; }
    public void setTransactionHash(String transactionHash) { this.transactionHash = transactionHash; }

    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }

    public String getCanonicalData() { return canonicalData; }
    public void setCanonicalData(String canonicalData) { this.canonicalData = canonicalData; }

    public String getHashAlgorithm() { return hashAlgorithm; }
    public void setHashAlgorithm(String hashAlgorithm) { this.hashAlgorithm = hashAlgorithm; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

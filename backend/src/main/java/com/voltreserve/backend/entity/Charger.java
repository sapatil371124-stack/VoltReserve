package com.voltreserve.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chargers", uniqueConstraints = {
    @UniqueConstraint(name = "uq_station_charger_code", columnNames = {"station_id", "identifier_code"})
})
public class Charger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    @JsonIgnore
    private ChargingStation station;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "connector_type_id", nullable = false)
    private ConnectorType connectorType;

    @Column(name = "identifier_code", nullable = false, length = 50)
    private String identifierCode;

    @Column(name = "power_output_kw", nullable = false, precision = 6, scale = 2)
    private BigDecimal powerOutputKw;

    @Column(name = "current_type", nullable = false, length = 10)
    private String currentType;

    @Column(name = "price_per_kwh", nullable = false, precision = 8, scale = 2)
    private BigDecimal pricePerKwh;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "charger", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ChargingSlot> slots = new ArrayList<>();

    public Charger() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ChargingStation getStation() { return station; }
    public void setStation(ChargingStation station) { this.station = station; }

    public ConnectorType getConnectorType() { return connectorType; }
    public void setConnectorType(ConnectorType connectorType) { this.connectorType = connectorType; }

    public String getIdentifierCode() { return identifierCode; }
    public void setIdentifierCode(String identifierCode) { this.identifierCode = identifierCode; }

    public BigDecimal getPowerOutputKw() { return powerOutputKw; }
    public void setPowerOutputKw(BigDecimal powerOutputKw) { this.powerOutputKw = powerOutputKw; }

    public String getCurrentType() { return currentType; }
    public void setCurrentType(String currentType) { this.currentType = currentType; }

    public BigDecimal getPricePerKwh() { return pricePerKwh; }
    public void setPricePerKwh(BigDecimal pricePerKwh) { this.pricePerKwh = pricePerKwh; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<ChargingSlot> getSlots() { return slots; }
    public void setSlots(List<ChargingSlot> slots) { this.slots = slots; }
}

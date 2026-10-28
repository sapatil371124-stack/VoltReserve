package com.voltreserve.backend.repository;

import com.voltreserve.backend.entity.ChargingStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChargingStationRepository extends JpaRepository<ChargingStation, Long> {

    List<ChargingStation> findByIsActiveTrue();

    @Query("SELECT DISTINCT s FROM ChargingStation s " +
           "JOIN s.location loc " +
           "JOIN loc.city c " +
           "LEFT JOIN s.chargers ch " +
           "WHERE (:cityId IS NULL OR c.id = :cityId) " +
           "AND (:cityName IS NULL OR LOWER(c.name) = LOWER(:cityName)) " +
           "AND (:locationId IS NULL OR loc.id = :locationId) " +
           "AND (:connectorTypeId IS NULL OR ch.connectorType.id = :connectorTypeId) " +
           "AND (:keyword IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(loc.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND s.isActive = true")
    List<ChargingStation> searchStations(
            @Param("cityId") Long cityId,
            @Param("cityName") String cityName,
            @Param("locationId") Long locationId,
            @Param("connectorTypeId") Long connectorTypeId,
            @Param("keyword") String keyword
    );
}

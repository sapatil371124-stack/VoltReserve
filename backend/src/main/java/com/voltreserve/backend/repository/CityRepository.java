package com.voltreserve.backend.repository;

import com.voltreserve.backend.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {
    List<City> findAllByOrderByNameAsc();
}

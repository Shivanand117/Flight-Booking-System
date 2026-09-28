package com.jsp.repository;

import com.jsp.entity.Flight;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FlightRepository extends JpaRepository<Flight, Integer> {

    List<Flight> findBySourceIgnoreCaseAndDestinationIgnoreCaseAndDepartureDateTimeGreaterThanEqualAndDepartureDateTimeLessThanOrderByDepartureDateTimeAsc(
            String source,
            String destination,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    );


    @Query("SELECT DISTINCT f.source FROM Flight f " +
           "WHERE LOWER(f.source) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY f.source")
    List<String> searchSources(@Param("query") String query);

    @Query("SELECT DISTINCT f.destination FROM Flight f " +
           "WHERE LOWER(f.source) = LOWER(:source) " +
           "AND LOWER(f.destination) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY f.destination")
    List<String> searchDestinations(
            @Param("source") String source,
            @Param("query") String query
    );
}
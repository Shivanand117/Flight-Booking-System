package com.jsp.service;

import com.jsp.dto.FlightRequestDto;
import com.jsp.dto.FlightResponseDto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface FlightService {

    FlightResponseDto createFlight(FlightRequestDto flightRequestDto);

    FlightResponseDto getFlightById(Integer id);

    List<FlightResponseDto> getAllFlights();

    FlightResponseDto updateFlight(Integer id, FlightRequestDto flightRequestDto);

    void deleteFlight(Integer id);

    List<FlightResponseDto> searchFlights(
            String source,
            String destination,
            LocalDate date
    );

    List<String> searchSources(String query);

    List<String> searchDestinations(String source, String query);

    List<String> getBookedSeats(Integer flightId);

    Map<String, BigDecimal> getCalendarFares(
            String source,
            String destination,
            LocalDate startDate,
            LocalDate endDate
    );
}
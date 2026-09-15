package com.jsp.service;

import java.util.List;

import com.jsp.dto.FlightRequestDto;
import com.jsp.dto.FlightResponseDto;

public interface FlightService {
    FlightResponseDto  createFlight(FlightRequestDto flightRequestDto);
    FlightResponseDto getFlightById(Integer id);
    List<FlightResponseDto> getAllFlights();
    FlightResponseDto updateFlight(Integer id, FlightRequestDto flightRequestDto);
    void deleteFlight(Integer id);
}

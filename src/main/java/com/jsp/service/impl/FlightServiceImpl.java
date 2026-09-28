package com.jsp.service.impl;

import com.jsp.dto.FlightRequestDto;
import com.jsp.dto.FlightResponseDto;
import com.jsp.entity.Flight;
import com.jsp.enums.BookingStatus;
import com.jsp.exception.ResourceNotFoundException;
import com.jsp.repository.BookingRepository;
import com.jsp.repository.FlightRepository;
import com.jsp.repository.PassengerRepository;
import com.jsp.service.FlightService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.stereotype.Service;

@Service
public class FlightServiceImpl implements FlightService {
	private FlightRepository flightRepository;
	private BookingRepository bookingRepository;
	private PassengerRepository passengerRepository;

	public FlightServiceImpl(FlightRepository flightRepository, BookingRepository bookingRepository,
			PassengerRepository passengerRepository) {

		this.flightRepository = flightRepository;
		this.bookingRepository = bookingRepository;
		this.passengerRepository = passengerRepository;
	}

	@Override
	public FlightResponseDto createFlight(FlightRequestDto flightRequestDto) {
		// DTo->Entity
		Flight flight = new Flight();
		flight.setAirline(flightRequestDto.getAirline());
		flight.setSource(flightRequestDto.getSource());
		flight.setDestination(flightRequestDto.getDestination());
		flight.setDepartureDateTime(flightRequestDto.getDepartureDateTime());
		flight.setArrivalDateTime(flightRequestDto.getArrivalDateTime());
		flight.setTotalSeats(flightRequestDto.getTotalSeats());
		flight.setPrice(flightRequestDto.getPrice());

		// save entity

		Flight savedFlight = flightRepository.save(flight);

		// Entity->Response Dto

		FlightResponseDto flightResponseDto = new FlightResponseDto();
		flightResponseDto.setId(savedFlight.getId());
		flightResponseDto.setAirline(savedFlight.getAirline());
		flightResponseDto.setSource(savedFlight.getSource());
		flightResponseDto.setDestination(savedFlight.getDestination());
		flightResponseDto.setDepartureDateTime(savedFlight.getDepartureDateTime());
		flightResponseDto.setArrivalDateTime(savedFlight.getArrivalDateTime());
		flightResponseDto.setTotalSeats(savedFlight.getTotalSeats());
		flightResponseDto.setPrice(savedFlight.getPrice());

		return flightResponseDto;
	}

	@Override
	public FlightResponseDto getFlightById(Integer id) {

		Flight flight = flightRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Flight with id " + id + " not found"));

		FlightResponseDto flightResponseDto = new FlightResponseDto();
		flightResponseDto.setId(flight.getId());
		flightResponseDto.setAirline(flight.getAirline());
		flightResponseDto.setSource(flight.getSource());
		flightResponseDto.setDestination(flight.getDestination());
		flightResponseDto.setDepartureDateTime(flight.getDepartureDateTime());
		flightResponseDto.setArrivalDateTime(flight.getArrivalDateTime());
		flightResponseDto.setTotalSeats(flight.getTotalSeats());
		flightResponseDto.setPrice(flight.getPrice());

		return flightResponseDto;

	}

	@Override
	public List<FlightResponseDto> getAllFlights() {
		// TODO Auto-generated method stub
		List<Flight> flights = flightRepository.findAll();

		List<FlightResponseDto> responseDtos = new ArrayList<>();

		for (Flight flight : flights) {

			FlightResponseDto flightResponseDto = new FlightResponseDto();

			flightResponseDto.setId(flight.getId());
			flightResponseDto.setAirline(flight.getAirline());
			flightResponseDto.setSource(flight.getSource());
			flightResponseDto.setDestination(flight.getDestination());
			flightResponseDto.setDepartureDateTime(flight.getDepartureDateTime());
			flightResponseDto.setArrivalDateTime(flight.getArrivalDateTime());
			flightResponseDto.setTotalSeats(flight.getTotalSeats());
			flightResponseDto.setPrice(flight.getPrice());

			responseDtos.add(flightResponseDto);
		}
		return responseDtos;
	}

	@Override
	public FlightResponseDto updateFlight(Integer id, FlightRequestDto flightRequestDto) {
		// TODO Auto-generated method stub
		Flight flight = flightRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Flight with id " + id + " not found"));

		long bookingCount = bookingRepository.countByFlight_IdAndStatusNot(id, BookingStatus.CANCELLED);

		if (bookingCount > 0) {
			throw new IllegalArgumentException("Flight cannot be updated because active bookings exist");
		}

		// Update existing Flight
		flight.setAirline(flightRequestDto.getAirline());
		flight.setSource(flightRequestDto.getSource());
		flight.setDestination(flightRequestDto.getDestination());
		flight.setDepartureDateTime(flightRequestDto.getDepartureDateTime());
		flight.setArrivalDateTime(flightRequestDto.getArrivalDateTime());
		flight.setTotalSeats(flightRequestDto.getTotalSeats());
		flight.setPrice(flightRequestDto.getPrice());

		// Save updated Flight
		Flight updatedFlight = flightRepository.save(flight);

		// Entity → Response DTO
		FlightResponseDto flightResponseDto = new FlightResponseDto();

		flightResponseDto.setId(updatedFlight.getId());
		flightResponseDto.setAirline(updatedFlight.getAirline());
		flightResponseDto.setSource(updatedFlight.getSource());
		flightResponseDto.setDestination(updatedFlight.getDestination());
		flightResponseDto.setDepartureDateTime(updatedFlight.getDepartureDateTime());
		flightResponseDto.setArrivalDateTime(updatedFlight.getArrivalDateTime());
		flightResponseDto.setTotalSeats(updatedFlight.getTotalSeats());
		flightResponseDto.setPrice(updatedFlight.getPrice());
		return flightResponseDto;
	}

	@Override
	public void deleteFlight(Integer id) {
		// TODO Auto-generated method stub

		Flight flight = flightRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Flight with id " + id + " not found"));

		long bookingCount = bookingRepository.countByFlight_IdAndStatusNot(id, BookingStatus.CANCELLED);

		if (bookingCount > 0) {
			throw new IllegalArgumentException(
					"Flight cannot be deleted because active bookings exist for this flight");
		}

		flightRepository.deleteById(id);

	}

	@Override
	public List<FlightResponseDto> searchFlights(String source, String destination, LocalDate date) {

		LocalDateTime startDateTime = date.atStartOfDay();
		LocalDateTime endDateTime = date.plusDays(1).atStartOfDay();

		List<Flight> flights = flightRepository
				.findBySourceIgnoreCaseAndDestinationIgnoreCaseAndDepartureDateTimeGreaterThanEqualAndDepartureDateTimeLessThanOrderByDepartureDateTimeAsc(
						source.trim(), destination.trim(), startDateTime, endDateTime);

		List<FlightResponseDto> responseDtos = new ArrayList<>();

		for (Flight flight : flights) {

			FlightResponseDto flightResponseDto = new FlightResponseDto();

			flightResponseDto.setId(flight.getId());
			flightResponseDto.setAirline(flight.getAirline());
			flightResponseDto.setSource(flight.getSource());
			flightResponseDto.setDestination(flight.getDestination());
			flightResponseDto.setDepartureDateTime(flight.getDepartureDateTime());
			flightResponseDto.setArrivalDateTime(flight.getArrivalDateTime());
			flightResponseDto.setTotalSeats(flight.getTotalSeats());
			flightResponseDto.setPrice(flight.getPrice());

			responseDtos.add(flightResponseDto);
		}

		return responseDtos;
	}

	@Override
	public List<String> searchSources(String query) {

		return flightRepository.searchSources(query.trim());
	}

	@Override
	public List<String> searchDestinations(String source, String query) {

		return flightRepository.searchDestinations(source.trim(), query.trim());
	}

	@Override
	public List<String> getBookedSeats(Integer flightId) {

	    flightRepository.findById(flightId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException(
	                            "Flight with id " + flightId + " not found"));

	    return passengerRepository.findBookedSeatNumbers(
	            flightId,
	            BookingStatus.CANCELLED
	    );
	}

	@Override
	public Map<String, BigDecimal> getCalendarFares(
	        String source,
	        String destination,
	        LocalDate startDate,
	        LocalDate endDate) {

	    if (startDate.isAfter(endDate)) {
	        throw new IllegalArgumentException(
	                "Start date cannot be after end date");
	    }

	    LocalDateTime start = startDate.atStartOfDay();
	    LocalDateTime end = endDate.plusDays(1).atStartOfDay();

	    List<Flight> flights =
	            flightRepository
	                .findBySourceIgnoreCaseAndDestinationIgnoreCaseAndDepartureDateTimeGreaterThanEqualAndDepartureDateTimeLessThanOrderByDepartureDateTimeAsc(
	                    source.trim(),
	                    destination.trim(),
	                    start,
	                    end
	                );

	    Map<String, BigDecimal> fares = new TreeMap<>();

	    for (Flight flight : flights) {
	        String date = flight.getDepartureDateTime()
	                .toLocalDate()
	                .toString();

	        fares.merge(
	                date,
	                flight.getPrice(),
	                (current, candidate) -> current.min(candidate)
	        );
	    }

	    return fares;
	}

}

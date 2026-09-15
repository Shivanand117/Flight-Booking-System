package com.jsp.service.impl;

import java.util.ArrayList;
import java.util.List;

import com.jsp.dto.BookingRequestDto;
import com.jsp.dto.BookingResponseDto;
import com.jsp.dto.FlightResponseDto;
import com.jsp.dto.PassengerRequestDto;
import com.jsp.dto.PassengerResponseDto;
import com.jsp.entity.Booking;
import com.jsp.entity.Flight;
import com.jsp.entity.Passenger;
import com.jsp.enums.BookingStatus;
import com.jsp.repository.BookingRepository;
import com.jsp.repository.FlightRepository;
import com.jsp.service.BookingService;

public class BookingServiceImpl implements BookingService {
	private final BookingRepository bookingRepository;
	private final FlightRepository flightRepository;

	public BookingServiceImpl(BookingRepository bookingRepository, FlightRepository flightRepository) {
		this.bookingRepository = bookingRepository;
		this.flightRepository = flightRepository;
	}

	@Override
	public BookingResponseDto createBooking(BookingRequestDto bookingRequestDto) {
		// TODO Auto-generated method stub
		Flight flight = flightRepository.findById(bookingRequestDto.getFlightId()).get();

		Booking booking = new Booking();
		booking.setFlight(flight);
		booking.setStatus(BookingStatus.PENDING);

		List<Passenger> passengers = new ArrayList<>();

		for (PassengerRequestDto passengerRequestDto : bookingRequestDto.getPassengers()) {

			Passenger passenger = new Passenger();
			passenger.setName(passengerRequestDto.getName());
			passenger.setAge(passengerRequestDto.getAge());

			passenger.setGender(passengerRequestDto.getGender());

			passenger.setContactNumber(passengerRequestDto.getContactNumber());

			passenger.setSeatNumber(passengerRequestDto.getSeatNumber());
			
			passenger.setBooking(booking);
			
			passengers.add(passenger);
		}
		
		booking.setPassengers(passengers);
		Booking savedBooking = bookingRepository.save(booking);
		
		BookingResponseDto responseDto = new BookingResponseDto();
		responseDto.setId(savedBooking.getId());
		responseDto.setBookingDate(savedBooking.getBookingDate());
		responseDto.setStatus(savedBooking.getStatus());
		   // Convert Flight → FlightResponseDto
		FlightResponseDto flightResponseDto = new FlightResponseDto();
		flightResponseDto.setId(savedBooking.getFlight().getId());

		flightResponseDto.setAirline(savedBooking.getFlight().getAirline());

		flightResponseDto.setSource(savedBooking.getFlight().getSource());

		flightResponseDto.setDestination(savedBooking.getFlight().getDestination());

		flightResponseDto.setArrivalDateTime(
		        savedBooking.getFlight().getArrivalDateTime()
		);

		flightResponseDto.setDepartureDateTime(
		        savedBooking.getFlight().getDepartureDateTime()
		);

		flightResponseDto.setTotalSeats(
		        savedBooking.getFlight().getTotalSeats()
		);

		flightResponseDto.setPrice(
		        savedBooking.getFlight().getPrice()
		);
		
		responseDto.setFlight(flightResponseDto);
		
		   // Convert passengers
		List<PassengerResponseDto> passengerResponseDtos = new ArrayList<>();
		
	    for (Passenger passenger :
            savedBooking.getPassengers()) {

        PassengerResponseDto passengerResponseDto =
                new PassengerResponseDto();

        passengerResponseDto.setId(
                passenger.getId()
        );

        passengerResponseDto.setName(
                passenger.getName()
        );

        passengerResponseDto.setAge(
                passenger.getAge()
        );

        passengerResponseDto.setGender(
                passenger.getGender()
        );

        passengerResponseDto.setContactNumber(
                passenger.getContactNumber()
        );

        passengerResponseDto.setSeatNumber(
                passenger.getSeatNumber()
        );

        passengerResponseDtos.add(passengerResponseDto);
    }

    responseDto.setPassengers(passengerResponseDtos);

		return responseDto;
	}

	@Override
	public BookingResponseDto getBookingById(Integer id) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<BookingResponseDto> getAllBookings() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public BookingResponseDto updateBooking(Integer id, BookingRequestDto bookingRequestDto) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void deleteBooking(Integer id) {
		// TODO Auto-generated method stub

	}

}

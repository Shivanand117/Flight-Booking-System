package com.jsp.service.impl;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.jsp.dto.BookingRequestDto;
import com.jsp.dto.BookingResponseDto;
import com.jsp.dto.FlightResponseDto;
import com.jsp.dto.PassengerRequestDto;
import com.jsp.dto.PassengerResponseDto;
import com.jsp.entity.Booking;
import com.jsp.entity.Flight;
import com.jsp.entity.Passenger;
import com.jsp.enums.BookingStatus;
import com.jsp.enums.PaymentStatus;
import com.jsp.exception.ResourceNotFoundException;
import com.jsp.exception.SeatAlreadyBookedException;
import com.jsp.repository.BookingRepository;
import com.jsp.repository.FlightRepository;
import com.jsp.repository.PassengerRepository;
import com.jsp.service.BookingService;

import jakarta.transaction.Transactional;

@Service
public class BookingServiceImpl implements BookingService {
	private final BookingRepository bookingRepository;
	private final FlightRepository flightRepository;
	private final PassengerRepository passengerRepository;

	public BookingServiceImpl(BookingRepository bookingRepository, FlightRepository flightRepository,
			PassengerRepository passengerRepository) {

		this.bookingRepository = bookingRepository;
		this.flightRepository = flightRepository;
		this.passengerRepository = passengerRepository;
	}

	@Override
	public BookingResponseDto createBooking(BookingRequestDto bookingRequestDto) {
		// TODO Auto-generated method stub
		Flight flight = flightRepository.findById(bookingRequestDto.getFlightId())
		        .orElseThrow(() -> new ResourceNotFoundException(
		                "Flight with id " + bookingRequestDto.getFlightId() + " not found"));
       
		if (bookingRequestDto.getPassengers() == null
		        || bookingRequestDto.getPassengers().isEmpty()) {

		    throw new IllegalArgumentException(
		            "Booking must contain at least one passenger");
		}
		
		if (bookingRequestDto.getPassengers().size() > flight.getTotalSeats()) {
		    throw new IllegalArgumentException(
		            "Number of passengers exceeds available seats");
		}
		
		long alreadyBookedSeats =
		        passengerRepository.countByBooking_Flight_Id(
		                bookingRequestDto.getFlightId());

		long availableSeats =
		        flight.getTotalSeats() - alreadyBookedSeats;

		if (bookingRequestDto.getPassengers().size() > availableSeats) {
		    throw new IllegalArgumentException(
		            "Not enough seats available for this flight");
		}
		
		Booking booking = new Booking();
		booking.setFlight(flight);
		booking.setStatus(BookingStatus.PENDING);

		List<Passenger> passengers = new ArrayList<>();
		Set<String> bookedSeats = new HashSet<>();

		for (PassengerRequestDto passengerRequestDto : bookingRequestDto.getPassengers()) {
			
			if (passengerRequestDto.getName() == null
			        || passengerRequestDto.getName().isBlank()) {
			    throw new IllegalArgumentException(
			            "Passenger name cannot be empty");
			}
			
			if (passengerRequestDto.getAge() == null
			        || passengerRequestDto.getAge() <= 0) {
			    throw new IllegalArgumentException(
			            "Passenger age must be greater than 0");
			}
			
			if (passengerRequestDto.getGender() == null) {
			    throw new IllegalArgumentException(
			            "Passenger gender cannot be null");
			}
			
			if (passengerRequestDto.getContactNumber() == null
			        || passengerRequestDto.getContactNumber().isBlank()) {
			    throw new IllegalArgumentException(
			            "Passenger contact number cannot be empty");
			}
			
			if (!passengerRequestDto.getContactNumber().matches("\\d{10}")) {
			    throw new IllegalArgumentException(
			            "Passenger contact number must contain exactly 10 digits");
			}
			
			if (passengerRequestDto.getSeatNumber() == null
			        || passengerRequestDto.getSeatNumber().isBlank()) {
			    throw new IllegalArgumentException(
			            "Passenger seat number cannot be empty");
			}
			
			if (!bookedSeats.add(passengerRequestDto.getSeatNumber())) {
			    throw new SeatAlreadyBookedException(
			            "Seat " + passengerRequestDto.getSeatNumber()
			            + " is already assigned in this booking");
			}

			boolean seatAlreadyBooked = passengerRepository.existsByBooking_Flight_IdAndSeatNumber(
					bookingRequestDto.getFlightId(), passengerRequestDto.getSeatNumber());

			if (seatAlreadyBooked) {
				throw new SeatAlreadyBookedException(
						"Seat " + passengerRequestDto.getSeatNumber() + " is already booked for this flight");
			}

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

		flightResponseDto.setArrivalDateTime(savedBooking.getFlight().getArrivalDateTime());

		flightResponseDto.setDepartureDateTime(savedBooking.getFlight().getDepartureDateTime());

		flightResponseDto.setTotalSeats(savedBooking.getFlight().getTotalSeats());

		flightResponseDto.setPrice(savedBooking.getFlight().getPrice());

		responseDto.setFlight(flightResponseDto);

		// Convert passengers
		List<PassengerResponseDto> passengerResponseDtos = new ArrayList<>();

		for (Passenger passenger : savedBooking.getPassengers()) {

			PassengerResponseDto passengerResponseDto = new PassengerResponseDto();

			passengerResponseDto.setId(passenger.getId());

			passengerResponseDto.setName(passenger.getName());

			passengerResponseDto.setAge(passenger.getAge());

			passengerResponseDto.setGender(passenger.getGender());

			passengerResponseDto.setContactNumber(passenger.getContactNumber());

			passengerResponseDto.setSeatNumber(passenger.getSeatNumber());

			passengerResponseDtos.add(passengerResponseDto);
		}

		responseDto.setPassengers(passengerResponseDtos);

		return responseDto;
	}

	@Override
	public BookingResponseDto getBookingById(Integer id) {
		// TODO Auto-generated method stub

		Booking booking = bookingRepository.findById(id)
		        .orElseThrow(() -> new ResourceNotFoundException(
		                "Booking with id " + id + " not found"));

		BookingResponseDto responseDto = new BookingResponseDto();

		// Booking details
		responseDto.setId(booking.getId());

		responseDto.setBookingDate(booking.getBookingDate());

		responseDto.setStatus(booking.getStatus());

		// Flight details

		FlightResponseDto flightResponseDto = new FlightResponseDto();

		flightResponseDto.setId(booking.getFlight().getId());

		flightResponseDto.setAirline(booking.getFlight().getAirline());

		flightResponseDto.setSource(booking.getFlight().getSource());

		flightResponseDto.setDestination(booking.getFlight().getDestination());

		flightResponseDto.setArrivalDateTime(booking.getFlight().getArrivalDateTime());

		flightResponseDto.setDepartureDateTime(booking.getFlight().getDepartureDateTime());

		flightResponseDto.setTotalSeats(booking.getFlight().getTotalSeats());

		flightResponseDto.setPrice(booking.getFlight().getPrice());

		responseDto.setFlight(flightResponseDto);

		// Passenger details

		List<PassengerResponseDto> passengerResponseDtos = new ArrayList<>();

		for (Passenger passenger : booking.getPassengers()) {

			PassengerResponseDto passengerResponseDto = new PassengerResponseDto();

			passengerResponseDto.setId(passenger.getId());

			passengerResponseDto.setName(passenger.getName());

			passengerResponseDto.setAge(passenger.getAge());

			passengerResponseDto.setGender(passenger.getGender());

			passengerResponseDto.setContactNumber(passenger.getContactNumber());

			passengerResponseDto.setSeatNumber(passenger.getSeatNumber());

			passengerResponseDtos.add(passengerResponseDto);
		}

		responseDto.setPassengers(passengerResponseDtos);
		return responseDto;

	}

	@Override
	public List<BookingResponseDto> getAllBookings() {
		// TODO Auto-generated method stub
		List<Booking> bookings = bookingRepository.findAll();
		List<BookingResponseDto> responseDtos = new ArrayList<>();

		for (Booking booking : bookings) {

			BookingResponseDto responseDto = new BookingResponseDto();

			responseDto.setId(booking.getId());

			responseDto.setBookingDate(booking.getBookingDate());

			responseDto.setStatus(booking.getStatus());

			FlightResponseDto flightResponseDto = new FlightResponseDto();

			flightResponseDto.setId(booking.getFlight().getId());

			flightResponseDto.setAirline(booking.getFlight().getAirline());

			flightResponseDto.setSource(booking.getFlight().getSource());

			flightResponseDto.setDestination(booking.getFlight().getDestination());

			flightResponseDto.setArrivalDateTime(booking.getFlight().getArrivalDateTime());

			flightResponseDto.setDepartureDateTime(booking.getFlight().getDepartureDateTime());

			flightResponseDto.setTotalSeats(booking.getFlight().getTotalSeats());

			flightResponseDto.setPrice(booking.getFlight().getPrice());
			responseDto.setFlight(flightResponseDto);

			List<PassengerResponseDto> passengerResponseDtos = new ArrayList<>();

			for (Passenger passenger : booking.getPassengers()) {

				PassengerResponseDto passengerResponseDto = new PassengerResponseDto();

				passengerResponseDto.setId(passenger.getId());

				passengerResponseDto.setName(passenger.getName());

				passengerResponseDto.setAge(passenger.getAge());

				passengerResponseDto.setGender(passenger.getGender());

				passengerResponseDto.setContactNumber(passenger.getContactNumber());

				passengerResponseDto.setSeatNumber(passenger.getSeatNumber());

				passengerResponseDtos.add(passengerResponseDto);
			}

			responseDto.setPassengers(passengerResponseDtos);
			responseDtos.add(responseDto);
		}
		return responseDtos;
	}

	@Transactional
	@Override
	public BookingResponseDto updateBooking(Integer id, BookingRequestDto bookingRequestDto) {
		// TODO Auto-generated method stub

		
		Booking booking = bookingRepository.findById(id)
		        .orElseThrow(() -> new ResourceNotFoundException(
		                "Booking with id " + id + " not found"));
		
		if (booking.getStatus() == BookingStatus.CANCELLED) {
		    throw new IllegalArgumentException(
		            "Cancelled booking cannot be updated");
		}
		

		Flight flight = flightRepository.findById(bookingRequestDto.getFlightId())
		        .orElseThrow(() -> new ResourceNotFoundException(
		                "Flight with id " + bookingRequestDto.getFlightId() + " not found"));
		
		
		if (bookingRequestDto.getPassengers() == null
		        || bookingRequestDto.getPassengers().isEmpty()) {
		    throw new IllegalArgumentException(
		            "Booking must contain at least one passenger");
		}
		
		long alreadyBookedByOthers =
		        passengerRepository.countByBooking_Flight_IdAndBooking_IdNot(
		                bookingRequestDto.getFlightId(), id);

		long availableSeats =
		        flight.getTotalSeats() - alreadyBookedByOthers;

		if (bookingRequestDto.getPassengers().size() > availableSeats) {
		    throw new IllegalArgumentException(
		            "Not enough seats available for this flight");
		}
		
		booking.setFlight(flight);

	
		Set<String> bookedSeats = new HashSet<>();

		for (PassengerRequestDto passengerRequestDto : bookingRequestDto.getPassengers()) {
				
			
			
			if (passengerRequestDto.getName() == null
			        || passengerRequestDto.getName().isBlank()) {
			    throw new IllegalArgumentException(
			            "Passenger name cannot be empty");
			}
			
			if (passengerRequestDto.getAge() == null
			        || passengerRequestDto.getAge() <= 0) {
			    throw new IllegalArgumentException(
			            "Passenger age must be greater than 0");
			}
			
			 if (passengerRequestDto.getGender() == null) {
		            throw new IllegalArgumentException(
		                    "Passenger gender cannot be null");
			 }
			 
			 // 8. Contact validation
		        if (passengerRequestDto.getContactNumber() == null
		                || passengerRequestDto.getContactNumber().isBlank()) {
		            throw new IllegalArgumentException(
		                    "Passenger contact number cannot be empty");
		        }
		        
		        // 9. Contact format validation
		        if (!passengerRequestDto.getContactNumber().matches("\\d{10}")) {
		            throw new IllegalArgumentException(
		                    "Passenger contact number must contain exactly 10 digits");
		        }
		        
		     // 10. Seat validation
		        if (passengerRequestDto.getSeatNumber() == null
		                || passengerRequestDto.getSeatNumber().isBlank()) {
		            throw new IllegalArgumentException(
		                    "Passenger seat number cannot be empty");
		        }

		    // 1. Check duplicate inside THIS request
			if (!bookedSeats.add(passengerRequestDto.getSeatNumber())) {
			    throw new SeatAlreadyBookedException(
			            "Seat " + passengerRequestDto.getSeatNumber()
			            + " is already assigned in this booking");
			}
			  // 2. Check duplicate against OTHER bookings
			boolean seatAlreadyBooked =
			        passengerRepository
			                .existsByBooking_Flight_IdAndSeatNumberAndBooking_IdNot(
			                        bookingRequestDto.getFlightId(),
			                        passengerRequestDto.getSeatNumber(),
			                        id);

			if (seatAlreadyBooked) {
			    throw new SeatAlreadyBookedException(
			            "Seat " + passengerRequestDto.getSeatNumber()
			            + " is already booked for this flight");
			}
			
		    // 3. Find existing passenger

			Passenger passenger = passengerRepository
			        .findByIdAndBooking_Id(passengerRequestDto.getId(), id)
			        .orElseThrow(() -> new ResourceNotFoundException(
			                "Passenger with id " + passengerRequestDto.getId()
			                + " not found in booking " + id));

		     // 4. Update existing passenger
			passenger.setName(passengerRequestDto.getName());

			passenger.setAge(passengerRequestDto.getAge());

			passenger.setGender(passengerRequestDto.getGender());

			passenger.setContactNumber(passengerRequestDto.getContactNumber());

			passenger.setSeatNumber(passengerRequestDto.getSeatNumber());

			  // 5. Save passenger
			passengerRepository.save(passenger);

		
		}

	

		Booking updatedBooking = bookingRepository.save(booking);

		return convertToResponseDto(updatedBooking);
	}

	@Override
	public void deleteBooking(Integer id) {
		// TODO Auto-generated method stub
		Booking booking = bookingRepository.findById(id)
		        .orElseThrow(() -> new ResourceNotFoundException(
		                "Booking with id " + id + " not found"));
		
		 if (booking.getPayment() != null
		            && booking.getPayment().getPaymentStatus() == PaymentStatus.SUCCESS) {
		        throw new IllegalArgumentException(
		                "Confirmed booking cannot be deleted");
		    }
		 
		bookingRepository.deleteById(id);
	}

	// Helper Method to convert ResponseDto
	private BookingResponseDto convertToResponseDto(Booking booking) {

		BookingResponseDto responseDto = new BookingResponseDto();

		// Booking details
		responseDto.setId(booking.getId());

		responseDto.setBookingDate(booking.getBookingDate());

		responseDto.setStatus(booking.getStatus());

		// Flight details
		FlightResponseDto flightResponseDto = new FlightResponseDto();

		flightResponseDto.setId(booking.getFlight().getId());

		flightResponseDto.setAirline(booking.getFlight().getAirline());

		flightResponseDto.setSource(booking.getFlight().getSource());

		flightResponseDto.setDestination(booking.getFlight().getDestination());

		flightResponseDto.setArrivalDateTime(booking.getFlight().getArrivalDateTime());

		flightResponseDto.setDepartureDateTime(booking.getFlight().getDepartureDateTime());

		flightResponseDto.setTotalSeats(booking.getFlight().getTotalSeats());

		flightResponseDto.setPrice(booking.getFlight().getPrice());

		responseDto.setFlight(flightResponseDto);

		// Passenger details

		List<PassengerResponseDto> passengerResponseDtos = new ArrayList<>();

		for (Passenger passenger : booking.getPassengers()) {

			PassengerResponseDto passengerResponseDto = new PassengerResponseDto();

			passengerResponseDto.setId(passenger.getId());

			passengerResponseDto.setName(passenger.getName());

			passengerResponseDto.setAge(passenger.getAge());

			passengerResponseDto.setGender(passenger.getGender());

			passengerResponseDto.setContactNumber(passenger.getContactNumber());

			passengerResponseDto.setSeatNumber(passenger.getSeatNumber());

			passengerResponseDtos.add(passengerResponseDto);
		}
		responseDto.setPassengers(passengerResponseDtos);
		return responseDto;
	}

	@Override
	public BookingResponseDto cancelBooking(Integer id) {
		// TODO Auto-generated method stub
		 Booking booking = bookingRepository.findById(id)
		            .orElseThrow(() -> new ResourceNotFoundException(
		                    "Booking with id " + id + " not found"));

		    if (booking.getStatus() == BookingStatus.CANCELLED) {
		        throw new IllegalArgumentException(
		                "Booking is already cancelled");
		    }

		    booking.setStatus(BookingStatus.CANCELLED);
		    if (booking.getPayment() != null
		            && booking.getPayment().getPaymentStatus() == PaymentStatus.SUCCESS) {

		        booking.getPayment().setPaymentStatus(PaymentStatus.REFUNDED);
		    }
		    

		    Booking cancelledBooking = bookingRepository.save(booking);

		    return convertToResponseDto(cancelledBooking);
		
	}
}

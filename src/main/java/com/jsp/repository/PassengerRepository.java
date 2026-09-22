package com.jsp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jsp.entity.Passenger;

public interface PassengerRepository extends JpaRepository<Passenger, Integer> {

	boolean existsByBooking_Flight_IdAndSeatNumber(Integer flightId, String seatNumber);
	
    // Used while updating an existing booking
	boolean existsByBooking_Flight_IdAndSeatNumberAndBooking_IdNot(Integer flightId, String seatNumber,
			Integer bookingId);
	
	Optional<Passenger> findByIdAndBooking_Id(
	        Integer passengerId,
	        Integer bookingId);
	
	long countByBooking_Flight_Id(Integer flightId);
	
	long countByBooking_Flight_IdAndBooking_IdNot(
	        Integer flightId,
	        Integer bookingId);
}

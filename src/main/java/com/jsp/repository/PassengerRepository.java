package com.jsp.repository;

import com.jsp.entity.Passenger;
import com.jsp.enums.BookingStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

	long countByBooking_Flight_IdAndBooking_StatusNot(
	        Integer flightId,
	        BookingStatus status);

	boolean existsByBooking_Flight_IdAndSeatNumberAndBooking_StatusNot(
	        Integer flightId,
	        String seatNumber,
	        BookingStatus status);

	long countByBooking_Flight_IdAndBooking_IdNotAndBooking_StatusNot(
	        Integer flightId,
	        Integer bookingId,
	        BookingStatus status);

	boolean existsByBooking_Flight_IdAndSeatNumberAndBooking_IdNotAndBooking_StatusNot(
	        Integer flightId,
	        String seatNumber,
	        Integer bookingId,
	        BookingStatus status);

	@Query("""
		       SELECT p.seatNumber
		       FROM Passenger p
		       WHERE p.booking.flight.id = :flightId
		       AND p.booking.status <> :status
		       """)
		List<String> findBookedSeatNumbers(
		        @Param("flightId") Integer flightId,
		        @Param("status") BookingStatus status
		);
}

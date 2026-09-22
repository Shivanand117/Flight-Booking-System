package com.jsp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jsp.entity.Booking;
import com.jsp.enums.BookingStatus;

public interface BookingRepository  extends JpaRepository<Booking, Integer> {
	long countByFlight_IdAndStatusNot(
	        Integer flightId,
	        BookingStatus status);
}

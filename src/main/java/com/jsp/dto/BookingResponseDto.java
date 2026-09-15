package com.jsp.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.jsp.enums.BookingStatus;

public class BookingResponseDto {
	private Integer id;

    private LocalDateTime bookingDate;

    private BookingStatus status;

    private FlightResponseDto flight;

    private List<PassengerResponseDto> passengers;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public LocalDateTime getBookingDate() {
		return bookingDate;
	}

	public void setBookingDate(LocalDateTime bookingDate) {
		this.bookingDate = bookingDate;
	}

	public BookingStatus getStatus() {
		return status;
	}

	public void setStatus(BookingStatus status) {
		this.status = status;
	}

	public FlightResponseDto getFlight() {
		return flight;
	}

	public void setFlight(FlightResponseDto flight) {
		this.flight = flight;
	}

	public List<PassengerResponseDto> getPassengers() {
		return passengers;
	}

	public void setPassengers(List<PassengerResponseDto> passengers) {
		this.passengers = passengers;
	}

}

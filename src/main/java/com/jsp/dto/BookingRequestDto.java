package com.jsp.dto;

import java.util.List;

public class BookingRequestDto {
	private Integer flightId;

    private List<PassengerRequestDto> passengers;

	public Integer getFlightId() {
		return flightId;
	}

	public void setFlightId(Integer flightId) {
		this.flightId = flightId;
	}

	public List<PassengerRequestDto> getPassengers() {
		return passengers;
	}

	public void setPassengers(List<PassengerRequestDto> passengers) {
		this.passengers = passengers;
	}

}

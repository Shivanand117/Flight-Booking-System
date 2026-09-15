package com.jsp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FlightResponseDto {
	 private Integer id;

	    private String airline;

	    private String source;

	    private String destination;

	    private LocalDateTime departureDateTime;

	    private LocalDateTime arrivalDateTime;

	    private Integer totalSeats;

	    private BigDecimal price;

		public Integer getId() {
			return id;
		}

		public void setId(Integer id) {
			this.id = id;
		}

		public String getAirline() {
			return airline;
		}

		public void setAirline(String airline) {
			this.airline = airline;
		}

		public String getSource() {
			return source;
		}

		public void setSource(String source) {
			this.source = source;
		}

		public String getDestination() {
			return destination;
		}

		public void setDestination(String destination) {
			this.destination = destination;
		}

		public LocalDateTime getDepartureDateTime() {
			return departureDateTime;
		}

		public void setDepartureDateTime(LocalDateTime departureDateTime) {
			this.departureDateTime = departureDateTime;
		}

		public LocalDateTime getArrivalDateTime() {
			return arrivalDateTime;
		}

		public void setArrivalDateTime(LocalDateTime arrivalDateTime) {
			this.arrivalDateTime = arrivalDateTime;
		}

		public Integer getTotalSeats() {
			return totalSeats;
		}

		public void setTotalSeats(Integer totalSeats) {
			this.totalSeats = totalSeats;
		}

		public BigDecimal getPrice() {
			return price;
		}

		public void setPrice(BigDecimal price) {
			this.price = price;
		}
}

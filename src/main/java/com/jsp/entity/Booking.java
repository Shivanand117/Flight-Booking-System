package com.jsp.entity;

import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.annotations.CreationTimestamp;

import com.jsp.enums.BookingStatus;

import jakarta.persistence.*;

@Entity
public class Booking {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@CreationTimestamp
	private LocalDateTime bookingDate;
	
	@Enumerated(EnumType.STRING)
	private BookingStatus status;
	
	@JoinColumn(name = "flight_id")
	@ManyToOne
	private Flight flight;
	
	@OneToMany(cascade = CascadeType.ALL , mappedBy = "booking")
	private List<Passenger> passengers;
	
	@OneToOne(cascade = CascadeType.ALL,mappedBy = "booking")
	private Payment payment;
	
	
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
	public Flight getFlight() {
		return flight;
	}
	public void setFlight(Flight flight) {
		this.flight = flight;
	}
	public List<Passenger> getPassengers() {
	    return passengers;
	}

	public void setPassengers(List<Passenger> passengers) {
	    this.passengers = passengers;
	}
	public Payment getPayment() {
		return payment;
	}
	public void setPayment(Payment payment) {
		this.payment = payment;
	}

	
}

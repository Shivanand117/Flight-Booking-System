package com.jsp.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import com.jsp.enums.PaymentMode;
import com.jsp.enums.PaymentStatus;

import jakarta.persistence.*;


@Entity
public class Payment {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@CreationTimestamp
	private LocalDateTime paymentDate;
	@Column(precision = 10, scale = 2)
	private BigDecimal amount;
	
	@Enumerated(EnumType.STRING)
	private PaymentMode paymentMode;
	@Enumerated(EnumType.STRING)
	private PaymentStatus paymentStatus;
	
	@OneToOne
	@JoinColumn(
	    name = "booking_id",
	    unique = true
	)
	private Booking booking;
	
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public LocalDateTime getPaymentDate() {
		return paymentDate;
	}
	public void setPaymentDate(LocalDateTime paymentDate) {
		this.paymentDate = paymentDate;
	}
	public BigDecimal getAmount() {
		return amount;
	}
	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}
	public PaymentMode getPaymentMode() {
	    return paymentMode;
	}
	public void setPaymentMode(PaymentMode paymentMode) {
	    this.paymentMode = paymentMode;
	}
	public PaymentStatus getPaymentStatus() {
		return paymentStatus;
	}
	public void setPaymentStatus(PaymentStatus paymentStatus) {
		this.paymentStatus = paymentStatus;
	}
	public Booking getBooking() {
		return booking;
	}
	public void setBooking(Booking booking) {
		this.booking = booking;
	}
	

	
}

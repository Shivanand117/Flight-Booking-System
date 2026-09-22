package com.jsp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jsp.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Integer>{

	boolean existsByBooking_Id(Integer bookingId);
}

package com.jsp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jsp.entity.Booking;

public interface BookingRepository  extends JpaRepository<Booking, Integer> {

}

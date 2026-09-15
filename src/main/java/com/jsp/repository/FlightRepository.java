package com.jsp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jsp.entity.Flight;

public interface FlightRepository  extends JpaRepository<Flight, Integer> {

}

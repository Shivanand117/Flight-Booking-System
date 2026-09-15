package com.jsp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jsp.entity.Passenger;

public interface PassengerRepository  extends JpaRepository<Passenger, Integer>{

}

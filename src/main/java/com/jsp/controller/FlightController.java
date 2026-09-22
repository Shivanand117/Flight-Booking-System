package com.jsp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.jsp.dto.FlightRequestDto;
import com.jsp.dto.FlightResponseDto;
import com.jsp.service.FlightService;

@RestController
public class FlightController {

	 private final FlightService flightService;

	 public FlightController(FlightService flightService) {
		this.flightService = flightService;
	 }
	 
     @PostMapping("/flights")
	 public  FlightResponseDto  createFlight(@RequestBody FlightRequestDto flightRequestDto) {
		 
    	 return flightService.createFlight(flightRequestDto);
		 
	 }
     
     @GetMapping("/flights/{id}")
	 public FlightResponseDto getFlightById(@PathVariable Integer id) {
		 
    	 return flightService.getFlightById(id);
		 
	 }
     
     @GetMapping("/flights")
     public  List<FlightResponseDto> getAllFlights(){
    	 
    	return  flightService.getAllFlights();
     }
	 
     @PutMapping("/flights/{id}")
     public   FlightResponseDto updateFlight(@PathVariable Integer id, @RequestBody FlightRequestDto flightRequestDto) {
    	 
    	 return flightService.updateFlight(id, flightRequestDto);
     }
     
     @DeleteMapping("/flights/{id}")
     public  void deleteFlight( @PathVariable Integer id) {
    	 
    	 flightService.deleteFlight(id);
    	 
     }
}

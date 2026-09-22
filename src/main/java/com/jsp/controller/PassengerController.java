package com.jsp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.jsp.dto.PassengerRequestDto;
import com.jsp.dto.PassengerResponseDto;
import com.jsp.service.PassengerService;

@RestController
public class PassengerController {

	private final PassengerService passengerService;

	public PassengerController(PassengerService passengerService) {
		super();
		this.passengerService = passengerService;
	}

	@GetMapping("/passengers/{id}")
	public PassengerResponseDto getPassengerById(@PathVariable Integer id) {

		return passengerService.getPassengerById(id);
	}

	@GetMapping("/passengers")
	public List<PassengerResponseDto> getAllPassengers() {

		return passengerService.getAllPassengers();
	}
   
	@PutMapping("/passengers/{id}")
	public PassengerResponseDto updatePassenger(@PathVariable Integer id,@RequestBody PassengerRequestDto passengerRequestDto) {
         
		return passengerService.updatePassenger(id, passengerRequestDto);
	}
	@DeleteMapping("/passengers/{id}")
	public  void deletePassenger(@PathVariable  Integer id) {
		
		passengerService.deletePassenger(id);
	}
}

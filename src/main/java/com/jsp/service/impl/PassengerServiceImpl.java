package com.jsp.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import com.jsp.dto.PassengerRequestDto;
import com.jsp.dto.PassengerResponseDto;
import com.jsp.entity.Passenger;
import com.jsp.exception.ResourceNotFoundException;
import com.jsp.repository.PassengerRepository;
import com.jsp.service.PassengerService;

@Service
public class PassengerServiceImpl implements PassengerService{
	private final PassengerRepository passengerRepository;

	public PassengerServiceImpl(PassengerRepository passengerRepository) {
		this.passengerRepository = passengerRepository;
	}

	@Override
	public PassengerResponseDto getPassengerById(Integer id) {
	
		Passenger passenger = passengerRepository.findById(id)
		        .orElseThrow(() -> new ResourceNotFoundException(
		                "Passenger with id " + id + " not found"));
		
		PassengerResponseDto responseDto =
		        new PassengerResponseDto();
		
		responseDto.setId(passenger.getId());

		responseDto.setName(passenger.getName());

		responseDto.setAge(passenger.getAge());

		responseDto.setGender(passenger.getGender());

		responseDto.setContactNumber(
		        passenger.getContactNumber()
		);

		responseDto.setSeatNumber(
		        passenger.getSeatNumber()
		);
		return responseDto;
	}

	@Override
	public List<PassengerResponseDto> getAllPassengers() {
	
		List<Passenger> passengers =
		        passengerRepository.findAll();
		
		List<PassengerResponseDto> responseDtos =
		        new ArrayList<>();
		
		for (Passenger passenger : passengers) {
			PassengerResponseDto responseDto =
			        new PassengerResponseDto();
			responseDto.setId(
			        passenger.getId()
			);

			responseDto.setName(
			        passenger.getName()
			);

			responseDto.setAge(
			        passenger.getAge()
			);

			responseDto.setGender(
			        passenger.getGender()
			);

			responseDto.setContactNumber(
			        passenger.getContactNumber()
			);

			responseDto.setSeatNumber(
			        passenger.getSeatNumber()
			);
			responseDtos.add(responseDto);
		}
		return responseDtos;
	}

	@Override
	public PassengerResponseDto updatePassenger(Integer id, PassengerRequestDto passengerRequestDto) {
		
		Passenger passenger = passengerRepository.findById(id)
		        .orElseThrow(() -> new ResourceNotFoundException(
		                "Passenger with id " + id + " not found"));
		
		    passenger.setName(
		            passengerRequestDto.getName()
		    );

		    passenger.setAge(
		            passengerRequestDto.getAge()
		    );

		    passenger.setGender(
		            passengerRequestDto.getGender()
		    );
		    
		    passenger.setContactNumber(
		            passengerRequestDto.getContactNumber()
		    );

		    passenger.setSeatNumber(
		            passengerRequestDto.getSeatNumber()
		    );
		    
		    Passenger updatedPassenger =
		            passengerRepository.save(passenger);
		    
		    PassengerResponseDto responseDto =
		            new PassengerResponseDto();
		    
		    responseDto.setId(
		            updatedPassenger.getId()
		    );

		    responseDto.setName(
		            updatedPassenger.getName()
		    );

		    responseDto.setAge(
		            updatedPassenger.getAge()
		    );

		    responseDto.setGender(
		            updatedPassenger.getGender()
		    );

		    responseDto.setContactNumber(
		            updatedPassenger.getContactNumber()
		    );
		    
		    responseDto.setSeatNumber(
		            updatedPassenger.getSeatNumber()
		    );
		return responseDto;
	}

	@Override
	public void deletePassenger(Integer id) {

		
		Passenger passenger = passengerRepository.findById(id)
	            .orElseThrow(() -> new ResourceNotFoundException(
	                    "Passenger with id " + id + " not found"));
		 passengerRepository.deleteById(id);

	}
	

}

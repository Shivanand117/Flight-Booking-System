package com.jsp.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.jsp.dto.FlightRequestDto;
import com.jsp.dto.FlightResponseDto;
import com.jsp.entity.Flight;
import com.jsp.repository.FlightRepository;
import com.jsp.service.FlightService;

@Service
public class FlightServiceImpl implements FlightService {
	private FlightRepository flightRepository;
	
	public FlightServiceImpl(FlightRepository flightRepository) {
	    this.flightRepository = flightRepository;
	}
	
	
	@Override
	public FlightResponseDto createFlight(FlightRequestDto flightRequestDto) {
		//DTo->Entity
           Flight flight=new Flight();
           flight.setAirline(flightRequestDto.getAirline());
           flight.setSource(flightRequestDto.getSource());
           flight.setDestination(flightRequestDto.getDestination());
           flight.setDepartureDateTime(flightRequestDto.getDepartureDateTime());
           flight.setArrivalDateTime(flightRequestDto.getArrivalDateTime());
           flight.setTotalSeats(flightRequestDto.getTotalSeats());
           flight.setPrice(flightRequestDto.getPrice());
      
           //save entity 
           
          Flight savedFlight=flightRepository.save(flight);
          
          //Entity->Response Dto
          
          FlightResponseDto  flightResponseDto =new FlightResponseDto();
          flightResponseDto.setId(savedFlight.getId());
          flightResponseDto.setAirline(savedFlight.getAirline());
          flightResponseDto.setSource(savedFlight.getSource());
          flightResponseDto.setDestination(savedFlight.getDestination());
          flightResponseDto.setDepartureDateTime(
                  savedFlight.getDepartureDateTime()
          );
          flightResponseDto.setArrivalDateTime(
                  savedFlight.getArrivalDateTime()
          );
          flightResponseDto.setTotalSeats(
                  savedFlight.getTotalSeats()
          );
          flightResponseDto.setPrice(
                  savedFlight.getPrice()
          );

          
           	
          return flightResponseDto;
	}
	
	@Override
	public FlightResponseDto getFlightById(Integer id) {
		Optional<Flight>optionalFlight=flightRepository.findById(id);
		Flight flight=optionalFlight.get();
		
		FlightResponseDto flightResponseDto=new FlightResponseDto();
		flightResponseDto.setId(flight.getId());
		flightResponseDto.setAirline(flight.getAirline());
		flightResponseDto.setSource(flight.getSource());
		flightResponseDto.setDestination(flight.getDestination());
		flightResponseDto.setDepartureDateTime(flight.getDepartureDateTime());
		flightResponseDto.setArrivalDateTime(flight.getArrivalDateTime());
		flightResponseDto.setTotalSeats(flight.getTotalSeats());
        flightResponseDto.setPrice(flight.getPrice());	
		
		return flightResponseDto;
		
		
	}


	@Override
	public List<FlightResponseDto> getAllFlights() {
		// TODO Auto-generated method stub
		List<Flight>flights=flightRepository.findAll();
		
		List<FlightResponseDto> responseDtos=new ArrayList<>();
		
		
		for(Flight flight:flights) {
			
			FlightResponseDto flightResponseDto=new FlightResponseDto();
			
			flightResponseDto.setId(flight.getId());
			flightResponseDto.setAirline(flight.getAirline());
			flightResponseDto.setSource(flight.getSource());
			flightResponseDto.setDestination(flight.getDestination());
			flightResponseDto.setDepartureDateTime(flight.getDepartureDateTime());
			flightResponseDto.setArrivalDateTime(flight.getArrivalDateTime());
			flightResponseDto.setTotalSeats(flight.getTotalSeats());
			flightResponseDto.setPrice(flight.getPrice());
			
			responseDtos.add(flightResponseDto);
		}
		return responseDtos;
	}


	@Override
	public FlightResponseDto updateFlight(Integer id, FlightRequestDto flightRequestDto) {
		// TODO Auto-generated method stub
		Flight flight=flightRepository.findById(id).get();

	    // Update existing Flight
		    flight.setAirline(flightRequestDto.getAirline());
		    flight.setSource(flightRequestDto.getSource());
		    flight.setDestination(flightRequestDto.getDestination());
		    flight.setDepartureDateTime(flightRequestDto.getDepartureDateTime());
		    flight.setArrivalDateTime(flightRequestDto.getArrivalDateTime());
		    flight.setTotalSeats(flightRequestDto.getTotalSeats());
		    flight.setPrice(flightRequestDto.getPrice());
		    

		    // Save updated Flight
		    Flight updatedFlight=flightRepository.save(flight);
		    
		    
		    // Entity → Response DTO
		    FlightResponseDto flightResponseDto =
		            new FlightResponseDto();

		    flightResponseDto.setId(updatedFlight.getId());
		    flightResponseDto.setAirline(updatedFlight.getAirline());
		    flightResponseDto.setSource(updatedFlight.getSource());
		    flightResponseDto.setDestination(updatedFlight.getDestination());
		    flightResponseDto.setDepartureDateTime(
		            updatedFlight.getDepartureDateTime()
		    );
		    flightResponseDto.setArrivalDateTime(
		            updatedFlight.getArrivalDateTime()
		    );
		    flightResponseDto.setTotalSeats(
		            updatedFlight.getTotalSeats()
		    );
		    flightResponseDto.setPrice(
		            updatedFlight.getPrice()
		    );
		return flightResponseDto;
	}


	@Override
	public void deleteFlight(Integer id) {
		// TODO Auto-generated method stub

	    flightRepository.deleteById(id);
		
	}

}

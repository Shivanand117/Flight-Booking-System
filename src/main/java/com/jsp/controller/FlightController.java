package com.jsp.controller;

import com.jsp.dto.FlightRequestDto;
import com.jsp.dto.FlightResponseDto;
import com.jsp.service.FlightService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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


     @GetMapping("/flights/search")
     public List<FlightResponseDto> searchFlights(
             @RequestParam String source,
             @RequestParam String destination,
             @RequestParam LocalDate date) {

         return flightService.searchFlights(source, destination, date);
     }
     @GetMapping("/flights/{id}")
	 public FlightResponseDto getFlightById(@PathVariable Integer id) {

    	 return flightService.getFlightById(id);

	 }

     @GetMapping("/flights")
     public  List<FlightResponseDto> getAllFlights(){

    	return  flightService.getAllFlights();
     }


     @GetMapping("/flights/suggestions/sources")
     public List<String> searchSources(
             @RequestParam String query) {

         return flightService.searchSources(query);
     }

     @GetMapping("/flights/suggestions/destinations")
     public List<String> searchDestinations(
             @RequestParam String source,
             @RequestParam String query) {

         return flightService.searchDestinations(
                 source,
                 query
         );
     }

     @PutMapping("/flights/{id}")
     public   FlightResponseDto updateFlight(@PathVariable Integer id, @RequestBody FlightRequestDto flightRequestDto) {

    	 return flightService.updateFlight(id, flightRequestDto);
     }



     @DeleteMapping("/flights/{id}")
     public  void deleteFlight( @PathVariable Integer id) {

    	 flightService.deleteFlight(id);

     }

     @GetMapping("/flights/{id}/booked-seats")
     public List<String> getBookedSeats(@PathVariable Integer id) {

         return flightService.getBookedSeats(id);
     }

     @GetMapping("/flights/calendar-fares")
     public Map<String, BigDecimal> getCalendarFares(
             @RequestParam String source,
             @RequestParam String destination,
             @RequestParam LocalDate startDate,
             @RequestParam LocalDate endDate) {

         return flightService.getCalendarFares(
                 source,
                 destination,
                 startDate,
                 endDate
         );
     }
}

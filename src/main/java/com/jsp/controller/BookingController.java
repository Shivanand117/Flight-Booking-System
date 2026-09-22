package com.jsp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.jsp.dto.BookingRequestDto;
import com.jsp.dto.BookingResponseDto;
import com.jsp.service.BookingService;

@RestController
public class BookingController {
	private final BookingService bookingService;

	public BookingController(BookingService bookingService) {
		this.bookingService = bookingService;
	}
	
	@PostMapping("/bookings")
	public  BookingResponseDto createBooking(@RequestBody BookingRequestDto bookingRequestDto) {
		
		return bookingService.createBooking(bookingRequestDto);
	}
	
	@GetMapping("/bookings/{id}")
	public  BookingResponseDto getBookingById(@PathVariable Integer id) {
	
		return bookingService.getBookingById(id);
	}
  
	@GetMapping("/bookings")
	public   List<BookingResponseDto> getAllBookings(){
		
		return bookingService.getAllBookings();
	}
	
	@PutMapping("/bookings/{id}")
	public   BookingResponseDto updateBooking(@PathVariable Integer id,@RequestBody BookingRequestDto bookingRequestDto) {
		
		return bookingService.updateBooking(id, bookingRequestDto);
	}
	
	@DeleteMapping("/bookings/{id}")
	public  void deleteBooking(@PathVariable Integer id) {
		
		bookingService.deleteBooking(id);
	}
	
	@PutMapping("/bookings/{id}/cancel")
	public BookingResponseDto cancelBooking(@PathVariable Integer id) {
	    return bookingService.cancelBooking(id);
	}
}

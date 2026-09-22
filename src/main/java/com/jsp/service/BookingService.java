package com.jsp.service;

import java.util.List;

import com.jsp.dto.BookingRequestDto;
import com.jsp.dto.BookingResponseDto;

public interface BookingService  {
    
	    BookingResponseDto createBooking(BookingRequestDto bookingRequestDto);

	    BookingResponseDto getBookingById(Integer id);

	    List<BookingResponseDto> getAllBookings();

	    BookingResponseDto updateBooking(Integer id, BookingRequestDto bookingRequestDto);

	    void deleteBooking(Integer id);
	    
	    BookingResponseDto cancelBooking(Integer id);

}

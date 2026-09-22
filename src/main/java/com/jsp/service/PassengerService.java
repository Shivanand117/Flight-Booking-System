package com.jsp.service;

import java.util.List;

import com.jsp.dto.PassengerRequestDto;
import com.jsp.dto.PassengerResponseDto;

public interface PassengerService {
   PassengerResponseDto getPassengerById(Integer id);
   List<PassengerResponseDto> getAllPassengers();
   PassengerResponseDto updatePassenger(
           Integer id,
           PassengerRequestDto passengerRequestDto
   );
   void deletePassenger(Integer id);
}

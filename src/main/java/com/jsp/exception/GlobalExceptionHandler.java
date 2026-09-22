package com.jsp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

	
	@ExceptionHandler(SeatAlreadyBookedException.class)
	public ResponseEntity<String> handleSeatAlreadyBooked(
	        SeatAlreadyBookedException ex) {

	    return ResponseEntity
	            .status(HttpStatus.CONFLICT)
	            .body(ex.getMessage());
	}
	
	@ExceptionHandler(PaymentAlreadyExistsException.class)
	public ResponseEntity<String> handlePaymentAlreadyExists(
	        PaymentAlreadyExistsException ex) {

	    return ResponseEntity
	            .status(HttpStatus.CONFLICT)
	            .body(ex.getMessage());
	}
	
	
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<String> handleResourceNotFound(
	        ResourceNotFoundException ex) {

	    return ResponseEntity
	            .status(HttpStatus.NOT_FOUND)
	            .body(ex.getMessage());
	}
	
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<String> handleIllegalArgumentException(
	        IllegalArgumentException ex) {

	    return ResponseEntity
	            .status(HttpStatus.BAD_REQUEST)
	            .body(ex.getMessage());
	}
}

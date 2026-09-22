package com.jsp.exception;

public class SeatAlreadyBookedException  extends RuntimeException{

	public SeatAlreadyBookedException(String message) {
        super(message);
    }
}

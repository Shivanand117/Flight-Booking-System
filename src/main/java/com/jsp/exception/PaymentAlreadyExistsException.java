package com.jsp.exception;

public class PaymentAlreadyExistsException  extends RuntimeException {
 
	public PaymentAlreadyExistsException(String message) {
        super(message);
    }
}

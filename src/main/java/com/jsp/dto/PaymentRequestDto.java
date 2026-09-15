package com.jsp.dto;

import java.math.BigDecimal;

import com.jsp.enums.PaymentMode;

public class PaymentRequestDto {
	   private Integer bookingId;


	    private PaymentMode paymentMode;

		public Integer getBookingId() {
			return bookingId;
		}

		public void setBookingId(Integer bookingId) {
			this.bookingId = bookingId;
		}

		
		public PaymentMode getPaymentMode() {
			return paymentMode;
		}

		public void setPaymentMode(PaymentMode paymentMode) {
			this.paymentMode = paymentMode;
		}
}

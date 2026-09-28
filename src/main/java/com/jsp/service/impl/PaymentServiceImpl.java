package com.jsp.service.impl;

import com.jsp.dto.PaymentRequestDto;
import com.jsp.dto.PaymentResponseDto;
import com.jsp.entity.Booking;
import com.jsp.entity.Flight;
import com.jsp.entity.Payment;
import com.jsp.enums.BookingStatus;
import com.jsp.enums.PaymentStatus;
import com.jsp.exception.PaymentAlreadyExistsException;
import com.jsp.exception.ResourceNotFoundException;
import com.jsp.repository.BookingRepository;
import com.jsp.repository.PaymentRepository;
import com.jsp.service.PaymentService;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
@Service
public class PaymentServiceImpl implements PaymentService{

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            BookingRepository bookingRepository) {

        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
    }

	@Override
	public PaymentResponseDto createPayment(PaymentRequestDto paymentRequestDto) {


		if (paymentRepository.existsByBooking_Id(paymentRequestDto.getBookingId())) {
		    throw new  PaymentAlreadyExistsException(
		            "Payment already exists for booking "
		            + paymentRequestDto.getBookingId());
		}
		Booking booking = bookingRepository
		        .findById(paymentRequestDto.getBookingId())
		        .orElseThrow(() -> new ResourceNotFoundException(
		                "Booking with id " + paymentRequestDto.getBookingId()
		                + " not found"));

		if (booking.getStatus() == BookingStatus.CANCELLED) {
		    throw new IllegalArgumentException(
		            "Cannot make payment for a cancelled booking");
		}
		if (booking.getStatus() == BookingStatus.CONFIRMED) {
		    throw new IllegalArgumentException(
		            "Booking is already confirmed");
		}

		if (paymentRequestDto.getPaymentMode() == null) {
		    throw new IllegalArgumentException(
		            "Payment mode cannot be null");
		}

		  Flight flight = booking.getFlight();
		  int passengerCount = booking.getPassengers().size();
		  BigDecimal amount = flight.getPrice()
			        .multiply(BigDecimal.valueOf(passengerCount));

		    Payment payment = new Payment();
		    payment.setAmount(amount);
		    payment.setPaymentMode(
		            paymentRequestDto.getPaymentMode());
		    payment.setPaymentStatus(PaymentStatus.SUCCESS);

		    payment.setBooking(booking);
		    Payment savedPayment =
		            paymentRepository.save(payment);
		    booking.setStatus(BookingStatus.CONFIRMED);
		    bookingRepository.save(booking);

		return convertToResponseDto(savedPayment);
	}

	@Override
	public PaymentResponseDto getPaymentById(Integer id) {

		Payment payment = paymentRepository
		        .findById(id)
		        .orElseThrow(() -> new ResourceNotFoundException(
		                "Payment with id " + id + " not found"));
		return convertToResponseDto(payment);
	}

	@Override
	public List<PaymentResponseDto> getAllPayments() {


	    List<Payment> payments = paymentRepository.findAll();

		return  payments.stream()
	            .map(this::convertToResponseDto)
	            .toList();
	}

	@Override
	public PaymentResponseDto updatePayment(Integer id, PaymentRequestDto paymentRequestDto) {

		Payment payment = paymentRepository
		        .findById(id)
		        .orElseThrow(() -> new ResourceNotFoundException(
		                "Payment with id " + id + " not found"));

		if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
		    throw new IllegalArgumentException(
		            "Successful payment cannot be updated");
		}
		  payment.setPaymentMode(
		            paymentRequestDto.getPaymentMode());
		  Payment updatedPayment =
		            paymentRepository.save(payment);
		return convertToResponseDto(updatedPayment);
	}

	@Override
	public void deletePayment(Integer id) {

		Payment payment = paymentRepository.findById(id)
	            .orElseThrow(() -> new ResourceNotFoundException(
	                    "Payment with id " + id + " not found"));


		if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
		    throw new IllegalArgumentException(
		            "Successful payment cannot be deleted");
		}



		 paymentRepository.deleteById(id);

	}

	private PaymentResponseDto convertToResponseDto(Payment payment) {

	    PaymentResponseDto responseDto = new PaymentResponseDto();

	    responseDto.setId(payment.getId());
	    responseDto.setPaymentDate(payment.getPaymentDate());
	    responseDto.setAmount(payment.getAmount());
	    responseDto.setPaymentMode(payment.getPaymentMode());
	    responseDto.setPaymentStatus(payment.getPaymentStatus());
	    responseDto.setBookingId(payment.getBooking().getId());

	    return responseDto;
	}

}

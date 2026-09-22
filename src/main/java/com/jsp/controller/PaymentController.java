package com.jsp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.jsp.dto.PaymentRequestDto;
import com.jsp.dto.PaymentResponseDto;
import com.jsp.service.PaymentService;

@RestController
public class PaymentController {

	private final PaymentService paymentService;

	public PaymentController(PaymentService paymentService) {
		super();
		this.paymentService = paymentService;
	}

	@PostMapping("/payments")
	public PaymentResponseDto createPayment(@RequestBody PaymentRequestDto paymentRequestDto) {

		return paymentService.createPayment(paymentRequestDto);

	}

	@GetMapping("payments/{id}")
	public PaymentResponseDto getPaymentById(@PathVariable Integer id) {

		return paymentService.getPaymentById(id);
	}

	@GetMapping("/payments")
	public List<PaymentResponseDto> getAllPayments() {

		return paymentService.getAllPayments();

	}
    
	@PutMapping("/payments/{id}")
	public PaymentResponseDto updatePayment(@PathVariable Integer id, @RequestBody PaymentRequestDto paymentRequestDto) {
		
		return paymentService.updatePayment(id, paymentRequestDto);
	}
   @DeleteMapping("/payments/{id}")
	public  void deletePayment(@PathVariable Integer id) {
		
	    paymentService.deletePayment(id);
	}
}

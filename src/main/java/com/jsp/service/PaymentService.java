package com.jsp.service;

import java.util.List;

import com.jsp.dto.PaymentRequestDto;
import com.jsp.dto.PaymentResponseDto;

public interface PaymentService {

    PaymentResponseDto createPayment(
            PaymentRequestDto paymentRequestDto
    );

    PaymentResponseDto getPaymentById(
            Integer id
    );

    List<PaymentResponseDto> getAllPayments();

    PaymentResponseDto updatePayment(
            Integer id,
            PaymentRequestDto paymentRequestDto
    );

    void deletePayment(Integer id);
}

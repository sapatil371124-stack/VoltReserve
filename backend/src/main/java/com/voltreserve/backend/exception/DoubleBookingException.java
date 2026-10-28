package com.voltreserve.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DoubleBookingException extends RuntimeException {
    public DoubleBookingException(String message) {
        super(message);
    }
}

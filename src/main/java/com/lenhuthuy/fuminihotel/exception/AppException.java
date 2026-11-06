/**
 * Student Name: Lê Nhựt Huy
 * Student ID  : CE200376
 */
package com.lenhuthuy.fuminihotel.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AppException extends RuntimeException {

    private final HttpStatus status;

    public AppException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}

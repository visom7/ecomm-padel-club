package com.ecommpadel.club.exception;

import com.ecommpadel.club.config.RequestLoggingFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException ex,
                                                               HttpServletRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        request.setAttribute(RequestLoggingFilter.ATTR_ERROR + "_MSG", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(ResponseStatusException ex,
                                                                     HttpServletRequest request) {
        String message = ex.getReason() != null ? ex.getReason() : ex.getMessage();
        if (ex.getStatusCode().is5xxServerError()) {
            log.error("HTTP error {}: {}", ex.getStatusCode().value(), message, ex);
            request.setAttribute(RequestLoggingFilter.ATTR_ERROR, ex);
        } else {
            log.warn("HTTP error {}: {}", ex.getStatusCode().value(), message);
        }
        request.setAttribute(RequestLoggingFilter.ATTR_ERROR + "_MSG", message);
        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of("error", message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleUnexpected(Exception ex,
                                                                  HttpServletRequest request) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        request.setAttribute(RequestLoggingFilter.ATTR_ERROR, ex);
        request.setAttribute(RequestLoggingFilter.ATTR_ERROR + "_MSG", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
    }
}

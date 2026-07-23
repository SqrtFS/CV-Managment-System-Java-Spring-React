package com.kiyulex.cv.exception;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;


@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    @ExceptionHandler(EmailExistsException.class)
    public ResponseEntity<Map<String, String>> handleEmailExistsException (EmailExistsException e){
        log.warn(e.getMessage());
        Map<String, String > error = new HashMap<>();
        error.put("Message" , "Email address already exist");
        return new ResponseEntity<>(error ,HttpStatus.CONFLICT);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFoundException (UserNotFoundException e){
        log.warn(e.getMessage());
        Map<String, String > error = new HashMap<>();
        error.put("Message" , "User not found");
        return new ResponseEntity<>(error ,HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(OptimisticLockConflictException.class)
    public ResponseEntity<Map<String, String>> handleOptimisticLockConflictException(OptimisticLockConflictException e){
        log.warn(e.getMessage());
        Map<String, String > error = new HashMap<>();
        error.put("Message" , "The entry was edited by another user - the version does not match");
        return new ResponseEntity<>(error ,HttpStatus.CONFLICT);
    }
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "BUSINESS_RULE_VIOLATION",
                "message", e.getMessage()
        ));
    }


}

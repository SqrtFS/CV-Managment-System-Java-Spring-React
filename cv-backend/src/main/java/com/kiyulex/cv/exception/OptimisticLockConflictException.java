package com.kiyulex.cv.exception;

public class OptimisticLockConflictException extends RuntimeException {
    public OptimisticLockConflictException(Long message) {
        super(String.valueOf(message));
    }
}

package com.gmpp.service;

import com.gmpp.dto.LoginRequest;
import com.gmpp.dto.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    LoginResponse refreshToken(String refreshToken);
}

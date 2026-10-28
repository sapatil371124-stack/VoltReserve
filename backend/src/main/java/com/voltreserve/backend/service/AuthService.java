package com.voltreserve.backend.service;

import com.voltreserve.backend.dto.AuthRequest;
import com.voltreserve.backend.dto.AuthResponse;
import com.voltreserve.backend.dto.RegisterRequest;
import com.voltreserve.backend.dto.UserDto;
import com.voltreserve.backend.entity.User;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    AuthResponse register(RegisterRequest request);
    UserDto getCurrentUser(String email);
    User findEntityByEmail(String email);
}

package com.voltreserve.backend.service;

import com.voltreserve.backend.dto.AuthRequest;
import com.voltreserve.backend.dto.AuthResponse;
import com.voltreserve.backend.dto.RegisterRequest;
import com.voltreserve.backend.dto.UserDto;
import com.voltreserve.backend.entity.User;
import com.voltreserve.backend.exception.BadRequestException;
import com.voltreserve.backend.exception.ResourceNotFoundException;
import com.voltreserve.backend.repository.UserRepository;
import com.voltreserve.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim(), request.getPassword().trim())
        );

        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole(), user.getId());

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("An account with email " + cleanEmail + " already exists.");
        }

        String role = (request.getRole() != null && request.getRole().equalsIgnoreCase("ROLE_ADMIN"))
                ? "ROLE_ADMIN" : "ROLE_USER";

        User user = new User();
        user.setEmail(cleanEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword().trim()));
        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone().trim());
        user.setRole(role);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        String token = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getRole(), savedUser.getId());
        return new AuthResponse(token, savedUser.getId(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole());
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = findEntityByEmail(email);
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public User findEntityByEmail(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}

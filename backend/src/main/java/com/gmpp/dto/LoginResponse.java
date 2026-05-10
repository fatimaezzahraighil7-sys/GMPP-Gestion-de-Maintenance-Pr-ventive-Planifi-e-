package com.gmpp.dto;

import com.gmpp.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String refreshToken;
    private long expiration;
    private UUID userId;
    private String nom;
    private String prenom;
    private String email;
    private Role role;
}

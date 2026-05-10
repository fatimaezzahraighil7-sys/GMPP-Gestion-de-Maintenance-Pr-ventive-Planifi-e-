package com.gmpp.service.impl;

import com.gmpp.dto.LoginRequest;
import com.gmpp.dto.LoginResponse;
import com.gmpp.entity.Utilisateur;
import com.gmpp.exception.BusinessException;
import com.gmpp.repository.UtilisateurRepository;
import com.gmpp.security.JwtTokenProvider;
import com.gmpp.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UtilisateurRepository utilisateurRepository;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider jwtTokenProvider,
                           UtilisateurRepository utilisateurRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMotDePasse()));

            String token = jwtTokenProvider.generateToken(authentication);
            String refreshToken = jwtTokenProvider.generateRefreshToken(request.getEmail());

            Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new BusinessException("Utilisateur non trouvé"));

            return LoginResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .expiration(jwtTokenProvider.getJwtExpirationMs())
                    .userId(utilisateur.getId())
                    .nom(utilisateur.getNom())
                    .prenom(utilisateur.getPrenom())
                    .email(utilisateur.getEmail())
                    .role(utilisateur.getRole())
                    .build();
        } catch (BadCredentialsException e) {
            throw new BusinessException("Email ou mot de passe incorrect");
        }
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("Refresh token invalide ou expiré");
        }

        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Utilisateur non trouvé"));

        String newToken = jwtTokenProvider.generateToken(email);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(email);

        return LoginResponse.builder()
                .token(newToken)
                .refreshToken(newRefreshToken)
                .expiration(jwtTokenProvider.getJwtExpirationMs())
                .userId(utilisateur.getId())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .email(utilisateur.getEmail())
                .role(utilisateur.getRole())
                .build();
    }
}

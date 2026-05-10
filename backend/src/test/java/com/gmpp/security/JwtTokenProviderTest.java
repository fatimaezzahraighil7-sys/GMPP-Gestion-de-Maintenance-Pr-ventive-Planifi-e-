package com.gmpp.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Date;

import static org.assertj.core.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret",
                "aVeryLongSecretKeyThatIsAtLeast512BitsForHS256AlgorithmUsedByJjwtLibraryInProduction2024");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", 86400000L);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtRefreshExpirationMs", 604800000L);
        jwtTokenProvider.init();
    }

    @Test
    void testGenerateToken() {
        User user = new User("admin@gmpp.com", "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));
        Authentication auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

        String token = jwtTokenProvider.generateToken(auth);

        assertThat(token).isNotNull().isNotEmpty();
    }

    @Test
    void testValidateToken() {
        String token = jwtTokenProvider.generateToken("admin@gmpp.com");

        boolean isValid = jwtTokenProvider.validateToken(token);

        assertThat(isValid).isTrue();
    }

    @Test
    void testGetEmailFromToken() {
        String token = jwtTokenProvider.generateToken("admin@gmpp.com");

        String email = jwtTokenProvider.getEmailFromToken(token);

        assertThat(email).isEqualTo("admin@gmpp.com");
    }

    @Test
    void testGetExpirationFromToken() {
        String token = jwtTokenProvider.generateToken("admin@gmpp.com");

        Date expiration = jwtTokenProvider.getExpirationFromToken(token);

        assertThat(expiration).isAfter(new Date());
    }

    @Test
    void testExpiredToken() {
        JwtTokenProvider expiredProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(expiredProvider, "jwtSecret",
                "aVeryLongSecretKeyThatIsAtLeast512BitsForHS256AlgorithmUsedByJjwtLibraryInProduction2024");
        ReflectionTestUtils.setField(expiredProvider, "jwtExpirationMs", -1000L);
        ReflectionTestUtils.setField(expiredProvider, "jwtRefreshExpirationMs", -1000L);
        expiredProvider.init();

        String token = expiredProvider.generateToken("admin@gmpp.com");
        boolean isValid = jwtTokenProvider.validateToken(token);

        assertThat(isValid).isFalse();
    }

    @Test
    void testInvalidToken() {
        boolean isValid = jwtTokenProvider.validateToken("invalid.token.here");

        assertThat(isValid).isFalse();
    }

    @Test
    void testGenerateRefreshToken() {
        String token = jwtTokenProvider.generateRefreshToken("admin@gmpp.com");

        assertThat(token).isNotNull().isNotEmpty();
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getEmailFromToken(token)).isEqualTo("admin@gmpp.com");
    }
}

package com.gmpp.config;

import com.gmpp.security.AuthEntryPoint;
import com.gmpp.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthEntryPoint authEntryPoint;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, AuthEntryPoint authEntryPoint) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authEntryPoint = authEntryPoint;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(org.springframework.security.config.Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .exceptionHandling(exception -> exception.authenticationEntryPoint(authEntryPoint))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/interventions/photo/**", "/api/images/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/machines/**").hasAnyRole(
                    "TECHNICIEN", "CHEF_EQUIPE", "RESPONSABLE_MAINTENANCE", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/machines/**").hasAnyRole("RESPONSABLE_MAINTENANCE", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/machines/**").hasAnyRole("RESPONSABLE_MAINTENANCE", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/machines/**").hasAnyRole("RESPONSABLE_MAINTENANCE", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/machines/**").hasRole("ADMIN")
                .requestMatchers("/api/interventions/**").hasAnyRole(
                    "TECHNICIEN", "CHEF_EQUIPE", "RESPONSABLE_MAINTENANCE", "ADMIN")
                .requestMatchers("/api/points-maintenance/**").hasAnyRole(
                    "TECHNICIEN", "CHEF_EQUIPE", "RESPONSABLE_MAINTENANCE", "ADMIN")
                .requestMatchers("/api/planning/**").hasAnyRole(
                    "CHEF_EQUIPE", "RESPONSABLE_MAINTENANCE", "ADMIN")
                .requestMatchers("/api/techniciens/**").hasAnyRole(
                    "CHEF_EQUIPE", "RESPONSABLE_MAINTENANCE", "ADMIN")
                .requestMatchers("/api/utilisateurs/**").hasRole("ADMIN")
                .requestMatchers("/api/rapports/**").hasAnyRole("RESPONSABLE_MAINTENANCE", "ADMIN")
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

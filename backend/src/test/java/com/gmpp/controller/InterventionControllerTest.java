package com.gmpp.controller;

import com.gmpp.dto.InterventionResponse;
import com.gmpp.service.InterventionService;
import com.gmpp.enums.StatutIntervention;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class InterventionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InterventionService interventionService;

    @Test
    @WithMockUser(roles = "ADMIN")
    public void getAllInterventions_ShouldReturnList() throws Exception {
        InterventionResponse response = InterventionResponse.builder()
                .id(UUID.randomUUID())
                .machineNom("Machine Test")
                .datePlanifiee(LocalDateTime.now())
                .build();

        when(interventionService.getAll(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/interventions")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].machineNom").value("Machine Test"));
    }

    @Test
    @WithMockUser(roles = "TECHNICIEN", username = "tech@gmpp.com")
    public void getMyInterventions_ShouldReturnList() throws Exception {
        InterventionResponse response = InterventionResponse.builder()
                .id(UUID.randomUUID())
                .machineNom("Ma Machine")
                .build();

        // The controller uses current user ID in getAll if TECHNICIEN
        when(interventionService.getAll(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/interventions/mes-interventions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].machineNom").value("Ma Machine"));
    }
}

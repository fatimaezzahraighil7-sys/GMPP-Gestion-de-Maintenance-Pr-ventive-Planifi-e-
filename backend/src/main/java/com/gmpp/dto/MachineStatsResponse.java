package com.gmpp.dto;

import com.gmpp.enums.StatutMachine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MachineStatsResponse {
    private long totalMachines;
    private Map<StatutMachine, Long> countByStatut;
}

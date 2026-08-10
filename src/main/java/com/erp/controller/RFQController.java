package com.erp.controller;

import com.erp.dto.RFQRequest;
import com.erp.service.RFQService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rfq")
@RequiredArgsConstructor
public class RFQController {

    private final RFQService rfqService;

    @PostMapping("/send")
    public ResponseEntity<String> sendRFQ(
            @RequestBody RFQRequest request) {

        System.out.println("====================================");
        System.out.println("RFQ CONTROLLER CALLED");
        System.out.println("PR ID: " + request.getPrId());
        System.out.println("Vendor IDs: " + request.getVendorIds());

        rfqService.sendRFQ(
                request.getPrId(),
                request.getVendorIds()
        );

        System.out.println("RFQ SERVICE COMPLETED");
        System.out.println("====================================");

        return ResponseEntity.ok("RFQ sent successfully.");
    }
}
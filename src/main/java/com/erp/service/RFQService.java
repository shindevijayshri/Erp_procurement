package com.erp.service;

import com.erp.entities.PRItem;
import com.erp.entities.PurchaseRequisition;
import com.erp.entities.Vendor;
import com.erp.repository.PRItemRepository;
import com.erp.repository.PurchaseRequisitionRepository;
import com.erp.repository.VendorRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RFQService {

    private final PurchaseRequisitionRepository purchaseRequisitionRepository;
    private final PRItemRepository prItemRepository;
    private final VendorRepository vendorRepository;

    private final EmailService emailService;


    public void sendRFQ(Long prId, List<Long> vendorIds) {

        // 1. Get Purchase Requisition
        PurchaseRequisition pr =
                purchaseRequisitionRepository
                        .findById(prId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Requisition not found: " + prId
                                )
                        );


        // 2. Check PR status
        if (!"APPROVED".equalsIgnoreCase(pr.getStatus())) {

            throw new RuntimeException(
                    "RFQ can only be sent for an APPROVED Purchase Requisition."
            );
        }


        // 3. Get PR Items
        List<PRItem> prItems =
                prItemRepository.findByPurchaseRequisition_PrId(prId);

        if (prItems.isEmpty()) {

            throw new RuntimeException(
                    "No items found for Purchase Requisition: " + prId
            );
        }


        // 4. Get selected vendors
        List<Vendor> vendors =
                vendorRepository.findAllById(vendorIds);

        if (vendors.isEmpty()) {

            throw new RuntimeException(
                    "No valid vendors selected."
            );
        }


        // 5. Prepare item list for email
        StringBuilder items = new StringBuilder();

        for (PRItem prItem : prItems) {

            items.append(
                    "Item: "
                    + prItem.getItem().getItemName()
                    + " | Quantity: "
                    + prItem.getQuantity()
                    + "\n"
            );
        }


        // 6. Send email to every selected vendor
        for (Vendor vendor : vendors) {

            if (vendor.getEmail() == null ||
                vendor.getEmail().isBlank()) {

                System.out.println(
                        "Skipping vendor without email: "
                        + vendor.getVendorName()
                );

                continue;
            }


            emailService.sendRFQEmail(
                    vendor.getEmail(),
                    vendor.getVendorName(),
                    pr.getPrNumber(),
                    items.toString()
            );


            System.out.println(
                    "RFQ email sent to: "
                    + vendor.getVendorName()
                    + " | "
                    + vendor.getEmail()
            );
        }
    }
}
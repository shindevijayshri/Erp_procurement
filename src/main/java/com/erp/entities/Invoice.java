package com.erp.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Long invoiceId;

    @Column(name = "invoice_no", nullable = false, unique = true)
    private String invoiceNo;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(nullable = false)
    private String status = "Pending"; // Added status field with default value

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private PurchaseOrder purchaseOrder;

}
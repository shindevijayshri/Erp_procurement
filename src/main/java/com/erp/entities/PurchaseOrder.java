package com.erp.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
@Data
// ADD THIS LINE TO PREVENT HIBERNATE LAZY-LOADING PROXY ERRORS
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "po_id")
    private Long poId;

    @Column(name = "po_number")
    private String poNumber;

    @Column(name = "po_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate poDate;

    @Column(name = "status")
    private String status;

    @Column(name = "amount")
    private Double amount;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "quotation_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Quotation quotation;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"purchaseOrder", "hibernateLazyInitializer", "handler"})
    private List<POItem> items;
}
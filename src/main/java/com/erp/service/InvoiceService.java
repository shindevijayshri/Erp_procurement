	package com.erp.service;
	import com.erp.entities.Invoice;
	import com.erp.entities.PurchaseOrder;
	import com.erp.repository.InvoiceRepository;
	import com.erp.repository.PurchaseOrderRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
	import java.util.List;
	import org.springframework.stereotype.Service;



	@Service
	@RequiredArgsConstructor
	public class InvoiceService {

	    private final InvoiceRepository invoiceRepository;

	    private final PurchaseOrderRepository poRepository;

	    // 1. Log Vendor Invoice against a Purchase Order
	    public Invoice createInvoice(Long poId, Invoice invoice) {
	        PurchaseOrder po = poRepository.findById(poId)
	                .orElseThrow(() -> new RuntimeException("PO not found with id: " + poId));

	        invoice.setPurchaseOrder(po);

	        if (invoice.getInvoiceDate() == null) {
	            invoice.setInvoiceDate(LocalDate.now());
	        }

	        return invoiceRepository.save(invoice);
	    }

	    // 2. Fetch all Invoices
	    public List<Invoice> getAllInvoices() {
	        return invoiceRepository.findAll();
	    }

	    // 3. Get Invoice by ID
	    public Invoice getInvoiceById(Long invoiceId) {
	        return invoiceRepository.findById(invoiceId)
	                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));
	    }

	    // 4. Get Invoices for a specific PO
	    public List<Invoice> getInvoicesByPoId(Long poId) {
	        return invoiceRepository.findByPurchaseOrder_PoId(poId);
	    }

	    // 5. Delete Invoice
	    public void deleteInvoice(Long invoiceId) {
	        Invoice invoice = getInvoiceById(invoiceId);
	        invoiceRepository.delete(invoice);
	    }
	}

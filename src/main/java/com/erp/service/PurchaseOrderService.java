	package com.erp.service;
	import com.erp.entities.Item;
	import com.erp.entities.POItem;
	import com.erp.entities.PurchaseOrder;
	import com.erp.entities.Quotation;
	import com.erp.entities.Vendor;
	import com.erp.repository.ItemRepository;
	import com.erp.repository.POItemRepository;
	import com.erp.repository.PurchaseOrderRepository;
	import com.erp.repository.QuotationRepository;
	import com.erp.repository.VendorRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
	import java.util.List;
	import org.springframework.stereotype.Service;
	import org.springframework.transaction.annotation.Transactional;



	@Service
	@RequiredArgsConstructor
	public class PurchaseOrderService {

	    private final PurchaseOrderRepository poRepository;

	    private final POItemRepository poItemRepository;

	    private final VendorRepository vendorRepository;

	    private final QuotationRepository quotationRepository;

	    private final ItemRepository itemRepository;

	    // 1. Generate Purchase Order linked to Vendor & Quotation
	    public PurchaseOrder createPO(Long vendorId, Long quotationId, PurchaseOrder po) {
	        Vendor vendor = vendorRepository.findById(vendorId)
	                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + vendorId));

	        Quotation quotation = quotationRepository.findById(quotationId)
	                .orElseThrow(() -> new RuntimeException("Quotation not found with id: " + quotationId));

	        po.setVendor(vendor);
	        po.setQuotation(quotation);

	        if (po.getPoDate() == null) {
	            po.setPoDate(LocalDate.now());
	        }
	        if (po.getStatus() == null || po.getStatus().isEmpty()) {
	            po.setStatus("ISSUED"); // States: ISSUED, DELIVERED, CANCELLED
	        }

	        return poRepository.save(po);
	    }

	    // 2. Add Line Item to Purchase Order & Update Dynamic Inventory Stock
	    @Transactional
	    public POItem addPOItem(Long poId, Long itemId, POItem poItem) {
	        PurchaseOrder po = poRepository.findById(poId)
	                .orElseThrow(() -> new RuntimeException("PO not found with id: " + poId));

	        Item item = itemRepository.findById(itemId)
	                .orElseThrow(() -> new RuntimeException("Item not found with id: " + itemId));

	        poItem.setPurchaseOrder(po);
	        poItem.setItem(item);

	        // Dynamic Stock Holding Update: Increment stock based on received PO line item
	        item.setStockQty(item.getStockQty() + poItem.getQuantity());
	        itemRepository.save(item);

	        return poItemRepository.save(poItem);
	    }

	    // 3. Fetch All POs
	    public List<PurchaseOrder> getAllPOs() {
	        return poRepository.findAll();
	    }

	    // 4. Get PO By ID
	    public PurchaseOrder getPOById(Long poId) {
	        return poRepository.findById(poId)
	                .orElseThrow(() -> new RuntimeException("PO not found with id: " + poId));
	    }

	    // 5. Get Line Items for a specific PO
	    public List<POItem> getPOItemsByPoId(Long poId) {
	        return poItemRepository.findByPurchaseOrder_PoId(poId);
	    }

	    // 6. Update PO Status
	    public PurchaseOrder updatePOStatus(Long poId, String status) {
	        PurchaseOrder po = getPOById(poId);
	        po.setStatus(status);
	        return poRepository.save(po);
	    }

	    // 7. Delete PO and associated items
	    @Transactional
	    public void deletePO(Long poId) {
	        PurchaseOrder po = getPOById(poId);
	        List<POItem> items = poItemRepository.findByPurchaseOrder_PoId(poId);

	        poItemRepository.deleteAll(items);
	        poRepository.delete(po);
	    }
	}

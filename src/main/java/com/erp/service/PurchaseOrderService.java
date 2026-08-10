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
import java.util.ArrayList;
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

    // 1. Create PO and save/link items correctly using Cascade support
    @Transactional
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
        if (po.getStatus() == null || po.getStatus().trim().isEmpty()) {
            po.setStatus("ISSUED");
        }

        List<POItem> incomingItems = po.getItems();
        po.setItems(new ArrayList<>()); // Initialize safe collection

        // Save parent first to generate poId
        PurchaseOrder savedPO = poRepository.save(po);

        if (incomingItems != null && !incomingItems.isEmpty()) {
            for (POItem poItem : incomingItems) {
                if (poItem.getItem() == null || poItem.getItem().getItemId() == null) {
                    throw new RuntimeException("Item ID is required for all order items.");
                }

                Item item = itemRepository.findById(poItem.getItem().getItemId())
                        .orElseThrow(() -> new RuntimeException("Item not found with id: " + poItem.getItem().getItemId()));

                poItem.setPurchaseOrder(savedPO);
                poItem.setItem(item);

                // Update inventory stock quantity
                int currentStock = (item.getStockQty() != null) ? item.getStockQty() : 0;
                int addedQty = (poItem.getQuantity() != null) ? poItem.getQuantity() : 0;
                item.setStockQty(currentStock + addedQty);
                itemRepository.save(item);

                savedPO.getItems().add(poItem);
            }
            poItemRepository.saveAll(savedPO.getItems());
        }

        return poRepository.save(savedPO);
    }

    // 2. Add Single Line Item to Purchase Order & Update Inventory
    @Transactional
    public POItem addPOItem(Long poId, Long itemId, POItem poItem) {
        PurchaseOrder po = getPOById(poId);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + itemId));

        poItem.setPurchaseOrder(po);
        poItem.setItem(item);

        int currentStock = (item.getStockQty() != null) ? item.getStockQty() : 0;
        int addedQty = (poItem.getQuantity() != null) ? poItem.getQuantity() : 0;
        item.setStockQty(currentStock + addedQty);
        itemRepository.save(item);

        return poItemRepository.save(poItem);
    }

    // 3. Update PO (PUT/PATCH) with items handling
    @Transactional
    public PurchaseOrder updatePurchaseOrder(Long poId, PurchaseOrder updatedDetails) {
        PurchaseOrder existingPO = getPOById(poId);

        if (updatedDetails.getStatus() != null) {
            existingPO.setStatus(updatedDetails.getStatus());
        }
        if (updatedDetails.getPoDate() != null) {
            existingPO.setPoDate(updatedDetails.getPoDate());
        }
        if (updatedDetails.getAmount() != null) {
            existingPO.setAmount(updatedDetails.getAmount());
        }

        // Handle item list synchronization if provided in the payload
        if (updatedDetails.getItems() != null) {
            // Revert stock for old items first if replacing/updating full list
            for (POItem oldItem : existingPO.getItems()) {
                Item item = oldItem.getItem();
                if (item != null) {
                    int stock = item.getStockQty() != null ? item.getStockQty() : 0;
                    int qty = oldItem.getQuantity() != null ? oldItem.getQuantity() : 0;
                    item.setStockQty(Math.max(0, stock - qty));
                    itemRepository.save(item);
                }
            }

            existingPO.getItems().clear();
            
            for (POItem newItem : updatedDetails.getItems()) {
                if (newItem.getItem() == null || newItem.getItem().getItemId() == null) {
                    throw new RuntimeException("Item ID is required.");
                }
                Item item = itemRepository.findById(newItem.getItem().getItemId())
                        .orElseThrow(() -> new RuntimeException("Item not found"));

                newItem.setPurchaseOrder(existingPO);
                newItem.setItem(item);

                int stock = item.getStockQty() != null ? item.getStockQty() : 0;
                int qty = newItem.getQuantity() != null ? newItem.getQuantity() : 0;
                item.setStockQty(stock + qty);
                itemRepository.save(item);

                existingPO.getItems().add(newItem);
            }
        }

        return poRepository.save(existingPO);
    }

    // 4. Fetch All POs
    @Transactional(readOnly = true)
    public List<PurchaseOrder> getAllPOs() {
        return poRepository.findAll();
    }

    // 5. Get PO By ID
    @Transactional(readOnly = true)
    public PurchaseOrder getPOById(Long poId) {
        return poRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found with id: " + poId));
    }

    // 6. Get Line Items for a specific PO
    @Transactional(readOnly = true)
    public List<POItem> getPOItemsByPoId(Long poId) {
        return poItemRepository.findByPurchaseOrder_PoId(poId);
    }

    // 7. Update PO Status Only (PATCH helper)
    @Transactional
    public PurchaseOrder updatePOStatus(Long poId, String status) {
        PurchaseOrder po = getPOById(poId);
        po.setStatus(status);
        return poRepository.save(po);
    }

    // 8. Delete PO, Rollback Stock, and clean items
    @Transactional
    public void deletePO(Long poId) {
        PurchaseOrder po = getPOById(poId);
        List<POItem> items = poItemRepository.findByPurchaseOrder_PoId(poId);

        for (POItem poItem : items) {
            Item item = poItem.getItem();
            if (item != null) {
                int currentStock = (item.getStockQty() != null) ? item.getStockQty() : 0;
                int orderedQty = (poItem.getQuantity() != null) ? poItem.getQuantity() : 0;
                item.setStockQty(Math.max(0, currentStock - orderedQty));
                itemRepository.save(item);
            }
        }

        poItemRepository.deleteAll(items);
        poRepository.delete(po);
    }
    
    public PurchaseOrder updatePO(Long poId, PurchaseOrder updatedPOData) {
        PurchaseOrder existingPO = getPOById(poId);
        
        // Update basic fields
        existingPO.setPoNumber(updatedPOData.getPoNumber());
        existingPO.setPoDate(updatedPOData.getPoDate());
        existingPO.setStatus(updatedPOData.getStatus());
        existingPO.setAmount(updatedPOData.getAmount());

        // Handle items update: clear or replace items appropriately based on your mapping
        if (updatedPOData.getItems() != null) {
            existingPO.getItems().clear();
            for (POItem item : updatedPOData.getItems()) {
                item.setPurchaseOrder(existingPO);
                existingPO.getItems().add(item);
            }
        }

        return poRepository.save(existingPO);
    }
}
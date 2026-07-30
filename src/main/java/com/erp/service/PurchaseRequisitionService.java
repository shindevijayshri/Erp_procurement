	package com.erp.service;
	import com.erp.entities.Item;
	import com.erp.entities.PRItem;
	import com.erp.entities.PurchaseRequisition;
	import com.erp.entities.User;
	import com.erp.repository.ItemRepository;
	import com.erp.repository.PRItemRepository;
	import com.erp.repository.PurchaseRequisitionRepository;
	import com.erp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

	import org.springframework.stereotype.Service;
	import org.springframework.transaction.annotation.Transactional;


	import java.util.List;

	@Service
	@RequiredArgsConstructor
	public class PurchaseRequisitionService {

	    private final PurchaseRequisitionRepository prRepository;

	    private final PRItemRepository prItemRepository;

	    private final UserRepository userRepository;

	    private final ItemRepository itemRepository;

	    // 1. Create Purchase Requisition Header
	    public PurchaseRequisition createPR(Long userId, PurchaseRequisition pr) {
	        User user = userRepository.findById(userId)
	                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

	        pr.setUser(user);
	        if (pr.getStatus() == null || pr.getStatus().isEmpty()) {
	            pr.setStatus("PENDING");
	        }

	        return prRepository.save(pr);
	    }

	    // 2. Add Line Item to a PR
	    public PRItem addPRItem(Long prId, Long itemId, PRItem prItem) {
	        PurchaseRequisition pr = prRepository.findById(prId)
	                .orElseThrow(() -> new RuntimeException("PR not found with id: " + prId));

	        Item item = itemRepository.findById(itemId)
	                .orElseThrow(() -> new RuntimeException("Item not found with id: " + itemId));

	        prItem.setPurchaseRequisition(pr);
	        prItem.setItem(item);

	        return prItemRepository.save(prItem);
	    }

	    // 3. Get All PRs
	    public List<PurchaseRequisition> getAllPRs() {
	        return prRepository.findAll();
	    }

	    // 4. Get PR by ID
	    public PurchaseRequisition getPRById(Long prId) {
	        return prRepository.findById(prId)
	                .orElseThrow(() -> new RuntimeException("PR not found with id: " + prId));
	    }

	    // 5. Get All Line Items for a Specific PR
	    public List<PRItem> getPRItemsByPrId(Long prId) {
	        return prItemRepository.findByPurchaseRequisition_PrId(prId);
	    }

	    // 6. Update PR Status (e.g., PENDING -> APPROVED / REJECTED)
	    public PurchaseRequisition updatePRStatus(Long prId, String status) {
	        PurchaseRequisition pr = getPRById(prId);
	        pr.setStatus(status);
	        return prRepository.save(pr);
	    }

	    // 7. Delete PR and associated line items
	    @Transactional
	    public void deletePR(Long prId) {
	        PurchaseRequisition pr = getPRById(prId);
	        List<PRItem> items = prItemRepository.findByPurchaseRequisition_PrId(prId);
	        
	        prItemRepository.deleteAll(items);
	        prRepository.delete(pr);
	    }
	}

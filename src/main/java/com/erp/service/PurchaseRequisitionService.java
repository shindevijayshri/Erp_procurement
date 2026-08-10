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
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseRequisitionService {

    private final PurchaseRequisitionRepository prRepository;
    private final PRItemRepository prItemRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    // 1. Create Purchase Requisition Header (Accepts numeric ID OR Email)
    @Transactional
    public PurchaseRequisition createPR(String userIdentifier, PurchaseRequisition pr) {
        User user = findUserByIdentifier(userIdentifier);

        pr.setUser(user);
        pr.setPrNumber(getNextPRNumber());
        if (pr.getStatus() == null || pr.getStatus().trim().isEmpty()) {
            pr.setStatus("PENDING");
        } else {
            pr.setStatus(pr.getStatus().toUpperCase());
        }

        return prRepository.save(pr);
    }

    // 2. Add Line Item to a PR
    @Transactional
    public PRItem addPRItem(Long prId, Long itemId, PRItem prItem) {
        PurchaseRequisition pr = getPRById(prId);

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

    // 4. Get PRs created by User ID OR Email Identifier
    public List<PurchaseRequisition> getPRsByUserIdentifier(String userIdentifier) {
        User user = findUserByIdentifier(userIdentifier);
        return prRepository.findByUser_UserId(user.getUserId());
    }

    // 5. Get PR by ID
    public PurchaseRequisition getPRById(Long prId) {
        return prRepository.findById(prId)
                .orElseThrow(() -> new RuntimeException("PR not found with id: " + prId));
    }

    // 6. Get All Line Items for a Specific PR
    public List<PRItem> getPRItemsByPrId(Long prId) {
        return prItemRepository.findByPurchaseRequisition_PrId(prId);
    }

    // 7. Update PR Header (Safe update for Remarks & PR Date without altering Status/User)
    @Transactional
    public PurchaseRequisition updatePRHeader(Long prId, PurchaseRequisition details) {
        PurchaseRequisition existing = getPRById(prId);

        if (details.getRemarks() != null) {
            existing.setRemarks(details.getRemarks());
        }
        if (details.getPrDate() != null) {
            existing.setPrDate(details.getPrDate());
        }

        return prRepository.save(existing);
    }

    // 8. Update PR Status (Used by Purchase Officer: PENDING -> APPROVED / REJECTED)
    @Transactional
    public PurchaseRequisition updatePRStatus(Long prId, String status) {
        PurchaseRequisition pr = getPRById(prId);
        pr.setStatus(status.toUpperCase());
        return prRepository.save(pr);
    }

    // 9. Delete PR and associated line items
    @Transactional
    public void deletePR(Long prId) {
        PurchaseRequisition pr = getPRById(prId);
        List<PRItem> items = prItemRepository.findByPurchaseRequisition_PrId(prId);

        prItemRepository.deleteAll(items);
        prRepository.delete(pr);
    }

    // 10. Update quantity of an existing line item
    @Transactional
    public PRItem updatePRItemQuantity(Long id,Integer quantity){

        PRItem item =
            prItemRepository.findById(id)
            .orElseThrow();

        item.setQuantity(quantity);

        return prItemRepository.save(item);
    }

    // 11. Delete an individual line item
    @Transactional
    public void deletePRItem(Long id){

        PRItem item =
           prItemRepository.findById(id)
           .orElseThrow();

        prItemRepository.delete(item);
    }
    // HELPER: Resolves User whether given numeric ID or Email string
    private User findUserByIdentifier(String userIdentifier) {
        try {
            Long userId = Long.parseLong(userIdentifier);
            return userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        } catch (NumberFormatException e) {
            return userRepository.findByEmail(userIdentifier)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + userIdentifier));
        }
    }
    
    
    public String getNextPRNumber() {

        return prRepository.findTopByOrderByPrIdDesc()
                .map(pr -> {
                    String lastNumber = pr.getPrNumber(); // Example: PR003

                    int number = Integer.parseInt(lastNumber.replaceAll("\\D", ""));

                    return String.format("PR%03d", number + 1);
                })
                .orElse("PR001");
    }
}
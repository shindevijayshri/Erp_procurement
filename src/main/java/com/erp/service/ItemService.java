	package com.erp.service;
	import com.erp.entities.Item;
	import com.erp.repository.ItemRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;
	import org.springframework.stereotype.Service;



	@Service
	@RequiredArgsConstructor
	public class ItemService {

	    private final ItemRepository itemRepository;

	    // 1. Create New Item
	    public Item createItem(Item item) {
	        if (itemRepository.existsByItemCode(item.getItemCode())) {
	            throw new RuntimeException("Item with code " + item.getItemCode() + " already exists.");
	        }
	        return itemRepository.save(item);
	    }

	    // 2. List All Items
	    public List<Item> getAllItems() {
	        return itemRepository.findAll();
	    }

	    // 3. Get Item By ID
	    public Item getItemById(Long itemId) {
	        return itemRepository.findById(itemId)
	                .orElseThrow(() -> new RuntimeException("Item not found with id: " + itemId));
	    }

	    // 4. Update Item Details or Stock Quantity
	    public Item updateItem(Long itemId, Item itemDetails) {
	        Item existingItem = getItemById(itemId);

	        // Ensure ID is explicitly retained to avoid detached entity updates
	        existingItem.setItemId(itemId);

	        existingItem.setItemCode(itemDetails.getItemCode());
	        existingItem.setItemName(itemDetails.getItemName());
	        existingItem.setCategory(itemDetails.getCategory());
	        existingItem.setUnitPrice(itemDetails.getUnitPrice());
	        existingItem.setStockQty(itemDetails.getStockQty());

	        return itemRepository.save(existingItem);
	    }

	    // 5. Delete Item
	    public void deleteItem(Long itemId) {
	        Item existingItem = getItemById(itemId);
	        itemRepository.delete(existingItem);
	    }
	}

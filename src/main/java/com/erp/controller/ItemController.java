	package com.erp.controller;
	import com.erp.entities.Item;
	import com.erp.service.ItemService;

import lombok.RequiredArgsConstructor;

import java.util.List;
	import org.springframework.http.HttpStatus;
	import org.springframework.http.ResponseEntity;
	import org.springframework.web.bind.annotation.*;



	@RestController
	@RequestMapping("/api/items")
	@RequiredArgsConstructor
	public class ItemController {

	    private final ItemService itemService;

	    // 1. Create Item -> POST /api/items
	    @PostMapping
	    public ResponseEntity<Item> createItem(@RequestBody Item item) {
	        Item createdItem = itemService.createItem(item);
	        return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
	    }

	    // 2. Get All Items -> GET /api/items
	    @GetMapping
	    public ResponseEntity<List<Item>> getAllItems() {
	        List<Item> items = itemService.getAllItems();
	        return ResponseEntity.ok(items);
	    }

	    // 3. Get Item By ID -> GET /api/items/{id}
//	    @GetMapping("/{id}")
//	    public ResponseEntity<Item> getItemById(@PathVariable("id") Long itemId) {
//	        Item item = itemService.getItemById(itemId);
//	        return ResponseEntity.ok(item);
//	    }

	    // 4. Update Item -> PUT /api/items/{id}
	    @PutMapping("/{id}")
	    public ResponseEntity<Item> updateItem(@PathVariable("id") Long itemId, @RequestBody Item itemDetails) {
	        Item updatedItem = itemService.updateItem(itemId, itemDetails);
	        return ResponseEntity.ok(updatedItem);
	    }

	    // 5. Delete Item -> DELETE /api/items/{id}
	    @DeleteMapping("/{id}")
	    public ResponseEntity<String> deleteItem(@PathVariable("id") Long itemId) {
	        itemService.deleteItem(itemId);
	        return ResponseEntity.ok("Item with ID " + itemId + " deleted successfully.");
	    }
	}

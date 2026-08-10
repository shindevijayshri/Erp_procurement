import React from "react";

import { FaFileInvoice, FaArrowLeft, FaPlus, FaTrash, FaSave } from "react-icons/fa";



function POForm({

    formData,

    setFormData,

    vendors,

    quotationsList,

    itemsList,

    purchaseOrders,

    editingId,

    onSubmit,

    onCancel

}) {

    // Vendor or Quotation selection change

    const handleInputChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => {

            const updated = { ...prev, [name]: value };



            // Reset quotation if vendor changes

            if (name === "vendorId") {

                updated.quotationId = "";

            }



            // Autofill line items when quotation is selected

            if (name === "quotationId" && value) {

                const selectedQuote = quotationsList.find(

                    (q) => String(q.quotationId || q.id) === String(value)

                );



                if (selectedQuote) {

                    const quoteItems = selectedQuote.quotationItems || selectedQuote.items || [];

                    if (quoteItems.length > 0) {

                        updated.poItems = quoteItems.map((qItem) => ({

                            itemId: String(qItem.item?.itemId || qItem.itemId || qItem.item?.id || ""),

                            quantity: Number(qItem.quantity || 1),

                            price: Number(qItem.unitPrice || qItem.price || 0)

                        }));

                        updated.amount = calculateTotalAmount(updated.poItems);

                    }

                }

            }

            return updated;

        });

    };



    // Item line handlers

    const handleItemChange = (index, field, value) => {

        const items = [...formData.poItems];

        items[index][field] = value;

        const updatedAmount = calculateTotalAmount(items);

        setFormData({ ...formData, poItems: items, amount: updatedAmount });

    };



    const handleItemSelect = (index, itemId) => {

        const items = [...formData.poItems];

        const selectedObj = itemsList.find((i) => String(i.itemId || i.id) === String(itemId));

        items[index].itemId = itemId;

        if (selectedObj && selectedObj.price) {

            items[index].price = selectedObj.price;

        }

        const updatedAmount = calculateTotalAmount(items);

        setFormData({ ...formData, poItems: items, amount: updatedAmount });

    };



    const handleAddItemRow = () => {

        setFormData((prev) => ({

            ...prev,

            poItems: [...prev.poItems, { itemId: "", quantity: 1, price: 0 }]

        }));

    };



    const handleRemoveItemRow = (index) => {

        const items = formData.poItems.filter((_, i) => i !== index);

        const updatedAmount = calculateTotalAmount(items);

        setFormData({ ...formData, poItems: items, amount: updatedAmount });

    };



    const calculateTotalAmount = (items) => {

        return items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);

    };



    // --- QUOTATION FILTER LOGIC ---

    // Extract all used quotation IDs from existing POs

    const usedQuotationIds = purchaseOrders

        .map((po) => String(po.quotation?.quotationId || po.quotationId || po.quotation?.id))

        .filter(Boolean);



    // Filter quotations for selected vendor AND exclude already used ones

    const filteredQuotations = quotationsList.filter((q) => {

        const qId = String(q.quotationId || q.id);

        const qVendorId = String(q.vendor?.vendorId || q.vendorId || q.vendor?.id);



        // Vendor match

        if (formData.vendorId && qVendorId !== String(formData.vendorId)) {

            return false;

        }



        // Allow currently selected quotation if editing, otherwise exclude if used in previous POs

        if (formData.quotationId && qId === String(formData.quotationId)) {

            return true;

        }



        return !usedQuotationIds.includes(qId);

    });



    return (

        <div>

            {/* Header */}

            <div className="p-3 d-flex align-items-center justify-content-between text-white" style={{ backgroundColor: "#0d6efd" }}>

                <div className="d-flex align-items-center gap-2">

                    <FaFileInvoice size={20} />

                    <h5 className="fw-bold m-0" style={{ fontSize: "1.15rem" }}>

                        {editingId ? "Edit Purchase Order" : "Create New Purchase Order"}

                    </h5>

                </div>

                <button

                    type="button"

                    className="btn bg-white text-dark fw-semibold px-3 py-1.5 d-flex align-items-center gap-2 shadow-sm border-0"

                    style={{ borderRadius: "6px", fontSize: "0.85rem", width: "auto" }}

                    onClick={onCancel}

                >

                    <FaArrowLeft size={12} /> Back to List

                </button>

            </div>

            {/* Form */}

            <div className="card-body p-4" style={{ fontSize: "0.95rem" }}>

                <form onSubmit={onSubmit}>

                    <h6 className="fw-bold mb-3 text-secondary">Order Details</h6>

                    <div className="row g-3 mb-4">

                        <div className="col-md-4">

                            <label className="form-label fw-semibold">PO Number *</label>

                            <input

                                type="text"

                                className="form-control bg-light fw-bold"

                                name="poNumber"

                                value={formData.poNumber}

                                readOnly

                            />

                        </div>



                        <div className="col-md-4">

                            <label className="form-label fw-semibold">PO Date *</label>

                            <input

                                type="date"

                                className="form-control"

                                name="poDate"

                                value={formData.poDate}

                                onChange={handleInputChange}

                                required

                            />

                        </div>



                        <div className="col-md-4">

                            <label className="form-label fw-semibold">Vendor *</label>

                            <select

                                className="form-select"

                                name="vendorId"

                                value={formData.vendorId}

                                onChange={handleInputChange}

                                required

                            >

                                <option value="">Select Vendor...</option>

                                {vendors.map((v) => {

                                    const vId = v.vendorId || v.id;

                                    const vName = v.vendorName || v.name || `Vendor #${vId}`;

                                    return (

                                        <option key={vId} value={vId}>

                                            {vName}

                                        </option>

                                    );

                                })}

                            </select>

                        </div>



                        <div className="col-md-4">

                            <label className="form-label fw-semibold">Quotation</label>

                            <select

                                className="form-select"

                                name="quotationId"

                                value={formData.quotationId}

                                onChange={handleInputChange}

                            >

                                <option value="">Select Unused Quotation...</option>

                                {filteredQuotations.map((q) => {

                                    const qId = q.quotationId || q.id;

                                    return (

                                        <option key={qId} value={qId}>

                                            QT{String(qId).padStart(3, "0")} {q.amount ? `(₹${q.amount})` : ""}

                                        </option>

                                    );

                                })}

                            </select>

                        </div>



                        <div className="col-md-4">

                            <label className="form-label fw-semibold">Status</label>

                            <select

                                className="form-select"

                                name="status"

                                value={formData.status}

                                onChange={handleInputChange}

                            >

                                <option value="ISSUED">ISSUED</option>

                                <option value="DELIVERED">DELIVERED</option>

                                <option value="CANCELLED">CANCELLED</option>

                            </select>

                        </div>



                        <div className="col-md-4">

                            <label className="form-label fw-semibold">Total Amount (₹)</label>

                            <input

                                type="number"

                                className="form-control bg-light fw-bold text-success"

                                name="amount"

                                value={formData.amount}

                                readOnly

                            />

                        </div>

                    </div>



                    {/* Items Section */}

                    <div className="d-flex justify-content-between align-items-center mb-2">

                        <h6 className="fw-bold m-0 text-secondary">PO Items</h6>

                        <button

                            type="button"

                            className="btn btn-outline-primary btn-sm fw-semibold"

                            onClick={handleAddItemRow}

                        >

                            <FaPlus size={12} className="me-1" /> Add Row

                        </button>

                    </div>



                    <div className="table-responsive mb-4">

                        <table className="table table-bordered align-middle">

                            <thead className="table-light">

                                <tr className="text-secondary fw-semibold">

                                    <th>Item Name *</th>

                                    <th style={{ width: "150px" }}>Quantity *</th>

                                    <th style={{ width: "180px" }}>Price (₹) *</th>

                                    <th style={{ width: "180px" }}>Subtotal (₹)</th>

                                    <th style={{ width: "60px" }}>Action</th>

                                </tr>

                            </thead>

                            <tbody>

                                {formData.poItems.map((item, index) => (

                                    <tr key={index}>

                                        <td>

                                            <select

                                                className="form-select"

                                                value={item.itemId}

                                                onChange={(e) => handleItemSelect(index, e.target.value)}

                                                required

                                            >

                                                <option value="">Select Item...</option>

                                                {itemsList.map((itm) => {

                                                    const iId = itm.itemId || itm.id;

                                                    return (

                                                        <option key={iId} value={iId}>

                                                            {itm.itemName || itm.name || `Item #${iId}`}

                                                        </option>

                                                    );

                                                })}

                                            </select>

                                        </td>

                                        <td>

                                            <input

                                                type="number"

                                                className="form-control"

                                                min="1"

                                                value={item.quantity}

                                                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}

                                                required

                                            />

                                        </td>

                                        <td>

                                            <input

                                                type="number"

                                                step="0.01"

                                                className="form-control"

                                                value={item.price}

                                                onChange={(e) => handleItemChange(index, "price", e.target.value)}

                                                required

                                            />

                                        </td>

                                        <td className="fw-bold text-success">

                                            ₹{(Number(item.quantity || 0) * Number(item.price || 0)).toFixed(2)}

                                        </td>

                                        <td className="text-center">

                                            {formData.poItems.length > 1 && (

                                                <button

                                                    type="button"

                                                    className="btn btn-outline-danger btn-sm p-1"

                                                    onClick={() => handleRemoveItemRow(index)}

                                                >

                                                    <FaTrash size={12} />

                                                </button>

                                            )}

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>



                    <div className="d-flex justify-content-end gap-3">

                        <button type="button" className="btn btn-secondary px-4" onClick={onCancel}>

                            Cancel

                        </button>

                        <button type="submit" className="btn btn-primary px-4">

                            <FaSave className="me-1" /> {editingId ? "Update Purchase Order" : "Save Purchase Order"}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}



export default POForm; 
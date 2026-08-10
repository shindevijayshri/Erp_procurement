import React from "react";
import { FaFileInvoiceDollar, FaArrowLeft, FaSave } from "react-icons/fa";

function InvoiceForm({ formData, setFormData, purchaseOrders, editingId, onSubmit, onCancel }) {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };

            // Automatically auto-populate amount from selected Purchase Order
            if (name === "poId" && value) {
                const selectedPO = purchaseOrders.find((po) => String(po.poId) === String(value));
                if (selectedPO && selectedPO.amount) {
                    updated.amount = selectedPO.amount;
                }
            }
            return updated;
        });
    };

    // Filter purchase orders to only display DELIVERED ones
    const deliveredPurchaseOrders = purchaseOrders.filter(
        (po) => po.status && po.status.toUpperCase() === "DELIVERED"
    );

    return (
        <div className="card shadow-sm border-0">
            <div
                className="p-3 d-flex align-items-center justify-content-between w-100 text-white"
                style={{ backgroundColor: "#0d6efd" }}
            >
                <div className="d-flex align-items-center gap-2">
                    <FaFileInvoiceDollar size={20} />
                    <h5 className="fw-bold m-0" style={{ fontSize: "1.15rem" }}>
                        {editingId ? "Edit Invoice" : "Add New Invoice"}
                    </h5>
                </div>

                <button
                    type="button"
                    className="btn bg-white text-dark fw-semibold px-3 py-1 d-inline-flex align-items-center gap-2 shadow-sm border-0 flex-shrink-0"
                    style={{
                        borderRadius: "6px",
                        fontSize: "0.9rem",
                        width: "fit-content"
                    }}
                    onClick={onCancel}
                >
                    <FaArrowLeft size={14} />
                    Back to List
                </button>
            </div>
            <div className="card-body p-4" style={{ fontSize: "0.95rem" }}>
                <form onSubmit={onSubmit}>
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Invoice Number *</label>
                            <input
                                type="text"
                                className="form-control bg-light fw-bold"
                                name="invoiceNo"
                                value={formData.invoiceNo}
                                readOnly
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Invoice Date *</label>
                            <input
                                type="date"
                                className="form-control"
                                name="invoiceDate"
                                value={formData.invoiceDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Purchase Order (Delivered Only) *</label>
                            <select
                                className="form-select"
                                name="poId"
                                value={formData.poId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Delivered Purchase Order...</option>
                                {deliveredPurchaseOrders.length === 0 ? (
                                    <option value="" disabled>No delivered purchase orders available</option>
                                ) : (
                                    deliveredPurchaseOrders.map((po) => (
                                        <option key={po.poId} value={po.poId}>
                                            {po.poNumber} {po.amount ? `(₹${po.amount})` : ""}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Amount (₹) *</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control fw-bold text-success"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                placeholder="e.g. 5000"
                                required
                            />
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-3">
                        <button type="button" className="btn btn-secondary px-4" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary px-4">
                            <FaSave className="me-1" /> {editingId ? "Update Invoice" : "Save Invoice"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default InvoiceForm;
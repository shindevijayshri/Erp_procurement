import React from "react";
import { FaCheck, FaTimes, FaEnvelope } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function PurchaseOfficerRequisitionModal({
    selectedPR,
    vendors,
    onClose,
    onUpdateStatus,
}) {

    const [selectedVendors, setSelectedVendors] = useState([]);


    if (!selectedPR) return null;

    const prId = selectedPR.prId || selectedPR.pr_id;
    const prNo = selectedPR.prNumber || selectedPR.pr_number || `PR-00${prId}`;
    const prDate = selectedPR.prDate || selectedPR.pr_date || "N/A";
    const prStatus = String(selectedPR.status || "PENDING").toUpperCase();
    const remarksText = selectedPR.remarks || "No remarks provided.";

    const requestedBy =
        selectedPR.user?.name ||
        selectedPR.user?.username ||
        selectedPR.createdByName ||
        (selectedPR.userId || selectedPR.user_id ? `User #${selectedPR.userId || selectedPR.user_id}` : "Unknown User");

    const items = selectedPR.prItems || selectedPR.items || [];

    const handleSendRFQ = async () => {

        if (selectedVendors.length === 0) {
            alert("Please select at least one vendor.");
            return;
        }

        console.log("PR ID:", prId);
        console.log("Selected Vendor IDs:", selectedVendors);

        try {

            const response = await fetch("http://localhost:8080/api/rfq/send", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },

                body: JSON.stringify({
                    prId: prId,
                    vendorIds: selectedVendors
                })
            });

            const data = await response.text();

            console.log("RFQ API Status:", response.status);
            console.log("RFQ API Response:", data);

            if (!response.ok) {
                throw new Error(data || "Failed to send RFQ");
            }

            alert("RFQ sent successfully!");

        } catch (error) {

            console.error("RFQ Error:", error);

            alert(
                "Failed to send RFQ.\n" +
                (error.message || "Something went wrong.")
            );
        }
    };

    return (
        <div className="modal show d-block tab-index-1 bg-dark bg-opacity-50" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg rounded-3">

                    {/* Modal Header */}
                    <div className="modal-header bg-light">
                        <h5 className="modal-title fw-bold text-primary">
                            Requisition Details — {prNo}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body p-4">
                        <div className="card bg-light border-0 mb-4 p-3 rounded-3">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <span className="text-muted fs-7 d-block">Requested By:</span>
                                    <strong className="text-dark fs-6">{requestedBy}</strong>
                                </div>

                                <div className="col-md-6">
                                    <span className="text-muted fs-7 d-block">Status:</span>
                                    <span
                                        className={`badge ${prStatus === "PENDING"
                                            ? "bg-warning text-dark"
                                            : prStatus === "APPROVED"
                                                ? "bg-success"
                                                : prStatus === "REJECTED"
                                                    ? "bg-danger"
                                                    : "bg-info text-dark"
                                            }`}
                                    >
                                        {prStatus}
                                    </span>
                                </div>

                                <div className="col-md-6">
                                    <span className="text-muted fs-7 d-block">Requisition Date:</span>
                                    <strong className="text-dark fs-6">{prDate}</strong>
                                </div>

                                <div className="col-md-12">
                                    <span className="text-muted fs-7 d-block">Remarks:</span>
                                    <span className="text-secondary">{remarksText}</span>
                                </div>
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <h6 className="fw-bold mb-3">Line Items Requested</h6>
                        <div className="table-responsive border rounded-3">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="fw-bold" style={{ width: "80px" }}>#</th>
                                        <th className="fw-bold">Item Name</th>
                                        <th className="fw-bold">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4 text-muted">
                                                No line items attached to this requisition.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((prItem, idx) => {
                                            const itemNameDisplay =
                                                prItem.item?.itemName ||
                                                prItem.item?.name ||
                                                prItem.itemName ||
                                                `Item #${prItem.item?.itemId || idx + 1}`;

                                            const qty = prItem.quantity || 0;

                                            return (
                                                <tr key={prItem.prItemId || idx}>
                                                    <td>{idx + 1}</td>
                                                    <td className="fw-semibold text-dark">{itemNameDisplay}</td>
                                                    <td>{qty}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {prStatus === "APPROVED" && (
                            <div className="mt-4">
                                <h6 className="fw-bold mb-3">Select Vendor(s) for RFQ</h6>

                                {vendors && vendors.length > 0 ? (
                                    <div className="row g-3">
                                        {vendors.map((vendor) => (
                                            <div className="col-md-6" key={vendor.vendorId}>
                                                <div className="border rounded-3 p-3">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`vendor-${vendor.vendorId}`}
                                                            checked={selectedVendors.includes(vendor.vendorId)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedVendors([
                                                                        ...selectedVendors,
                                                                        vendor.vendorId
                                                                    ]);
                                                                } else {
                                                                    setSelectedVendors(
                                                                        selectedVendors.filter(
                                                                            id => id !== vendor.vendorId
                                                                        )
                                                                    );
                                                                }
                                                            }}
                                                        />

                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={`vendor-${vendor.vendorId}`}
                                                        >
                                                            <strong>{vendor.vendorName}</strong>

                                                            <div className="text-muted small mt-1">
                                                                {vendor.email}
                                                            </div>

                                                            <div className="text-muted small">
                                                                {vendor.phone}
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="alert alert-warning">
                                        No vendors available.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* ```jsx */}
                    {/* Modal Footer */}
                    <div className="modal-footer bg-light">

                        <div
                            style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "12px"
                            }}
                        >

                            {/* CLOSE BUTTON - ALWAYS VISIBLE */}
                            <button
                                type="button"
                                className="btn btn-secondary px-4"
                                onClick={onClose}
                            >
                                Close
                            </button>

                            {/* PENDING PR BUTTONS */}
                            {prStatus === "PENDING" && (
                                <>
                                    <button
                                        type="button"
                                        className="btn btn-danger d-inline-flex align-items-center gap-2"
                                        onClick={() => {
                                            onUpdateStatus(prId, "REJECTED");
                                            onClose();
                                        }}
                                    >
                                        <FaTimes />
                                        Reject
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-success d-inline-flex align-items-center gap-2"
                                        onClick={() => {
                                            onUpdateStatus(prId, "APPROVED");
                                            onClose();
                                        }}
                                    >
                                        <FaCheck />
                                        Approve
                                    </button>
                                </>
                            )}

                            {/* APPROVED PR - SEND RFQ */}
                            {prStatus === "APPROVED" && (
                                <button
                                    type="button"
                                    className="btn btn-primary px-4 d-inline-flex align-items-center gap-2"
                                    onClick={handleSendRFQ}
                                >
                                    <FaEnvelope />
                                    Send RFQ
                                </button>
                            )}

                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
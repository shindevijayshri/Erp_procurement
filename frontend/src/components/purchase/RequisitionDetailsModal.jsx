import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function RequisitionDetailsModal({
    selectedPR,
    userRole,
    onClose,
    onUpdateStatus,
}) {
    if (!selectedPR) return null;

    // Standardized Extractors with fallbacks for both User and Officer APIs
    const prId = selectedPR.prId || selectedPR.pr_id || selectedPR.id;
    const prNo = selectedPR.prNumber || selectedPR.pr_number || selectedPR.code || `PR-00${prId}`;
    const prDate = selectedPR.prDate || selectedPR.pr_date || selectedPR.createdDate || selectedPR.createdAt || "N/A";
    const prStatus = String(selectedPR.status || "PENDING").toUpperCase();
    const remarksText = selectedPR.remarks || selectedPR.remark || selectedPR.description || "No remarks provided.";

    const requestedBy =
        selectedPR.user?.name ||
        selectedPR.user?.username ||
        selectedPR.createdByName ||
        selectedPR.userName ||
        (selectedPR.userId || selectedPR.user_id ? `User #${selectedPR.userId || selectedPR.user_id}` : "Unknown User");

    // Retrieve Items Array
    const items = selectedPR.prItems || selectedPR.items || selectedPR.lineItems || [];

    const isOfficer =
        String(userRole).toUpperCase().includes("OFFICER") ||
        String(userRole).toUpperCase().includes("ADMIN");

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
                                        className={`badge ${
                                            prStatus === "PENDING"
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
                                                prItem.name ||
                                                `Item #${prItem.item?.itemId || prItem.itemId || idx + 1}`;

                                            const qty = prItem.quantity ?? prItem.qty ?? 0;

                                            return (
                                                <tr key={prItem.prItemId || prItem.id || idx}>
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
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer bg-light d-flex justify-content-between">
                        <button type="button" className="btn btn-secondary px-4" onClick={onClose}>
                            Close
                        </button>

                        {/* Purchase Officer Actions */}
                        {isOfficer && prStatus === "PENDING" && (
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-danger d-inline-flex align-items-center gap-2"
                                    onClick={() => {
                                        onUpdateStatus(prId, "REJECTED");
                                        onClose();
                                    }}
                                >
                                    <FaTimes /> Reject
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success d-inline-flex align-items-center gap-2"
                                    onClick={() => {
                                        onUpdateStatus(prId, "APPROVED");
                                        onClose();
                                    }}
                                >
                                    <FaCheck /> Approve
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
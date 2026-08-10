import React, { useState } from "react";
import { FaClipboardList, FaSearch, FaEye, FaCheck, FaTimes } from "react-icons/fa";

export default function OfficerPurchaseRequisition({
    requisitions = [],
    onViewPR,
    onUpdateStatus,
}) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredRequisitions = requisitions.filter((pr) => {
        if (!pr) return false;
        const term = searchTerm.toLowerCase();

        const prNumber = String(pr.prNumber || pr.pr_number || pr.prId || pr.pr_id || "").toLowerCase();
        const createdBy = String(
            pr.user?.name || pr.user?.fullName || pr.user?.username || pr.createdByName || ""
        ).toLowerCase();
        const status = String(pr.status || "").toLowerCase();
        const remarks = String(pr.remarks || "").toLowerCase();

        return (
            prNumber.includes(term) ||
            createdBy.includes(term) ||
            status.includes(term) ||
            remarks.includes(term)
        );
    });

    return (
        <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            {/* Header Bar */}
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center p-3">
                <div className="d-flex align-items-center gap-2">
                    <FaClipboardList size={22} />
                    <h4 className="mb-0 fw-bold fs-5">Purchase Requisitions</h4>
                </div>
            </div>

            {/* Body & Search */}
            <div className="card-body p-4 bg-white">
                <div className="row mb-4">
                    <div className="col-md-5 col-lg-4">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 text-muted">
                                <FaSearch />
                            </span>
                            <input
                                type="text"
                                className="form-control bg-light border-start-0 ps-0"
                                placeholder="Search by PR Number, User, or Status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="fw-bold py-3">PR Number</th>
                                <th className="fw-bold py-3">Requested By</th>
                                <th className="fw-bold py-3">Req Date</th>
                                <th className="fw-bold py-3">Remarks</th>
                                <th className="fw-bold py-3">Status</th>
                                <th className="fw-bold py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequisitions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        No purchase requisitions found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRequisitions.map((pr) => {
                                    const prId = pr.prId;
                                    const prNo = pr.prNumber || pr.pr_number || `PR-00${prId}`;
                                    const prDate = pr.prDate || pr.pr_date || "N/A";

                                    // Extract exact name from user object or top-level properties
                                    const requestedBy =
                                        pr.user?.name ||
                                        pr.requestedBy ||
                                        pr.createdByName ||
                                        (pr.userId || pr.user_id ? `User #${pr.userId || pr.user_id}` : "Unknown User");

                                    const prStatus = String(pr.status || "PENDING").toUpperCase();
                                    const remarksText = pr.remarks || "-";

                                    return (
                                        <tr key={prId || Math.random()}>
                                            <td>{prNo}</td>
                                            <td>
                                                <span className="badge bg-secondary text-white px-2 py-1">
                                                    {requestedBy}
                                                </span>
                                            </td>
                                            <td>{prDate}</td>
                                            <td>{remarksText}</td>
                                            <td>
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
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center align-items-center gap-1">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                                        onClick={() => onViewPR(pr)}
                                                    >
                                                        <FaEye /> Review
                                                    </button>

                                                    {prStatus === "PENDING" && (
                                                        <>
                                                            <button
                                                                className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                                                                onClick={() => onUpdateStatus(prId, "APPROVED")}
                                                            >
                                                                <FaCheck /> Approve
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1"
                                                                onClick={() => onUpdateStatus(prId, "REJECTED")}
                                                            >
                                                                <FaTimes /> Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
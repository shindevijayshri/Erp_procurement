import React from "react";
import { FaFileInvoiceDollar, FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";

function InvoiceList({ invoices, searchQuery, setSearchQuery, onCreateClick, onEdit, onPay, onDelete }) {
    return (
        <div className="card shadow-sm border-0">
            <div
                className="p-3 d-flex align-items-center justify-content-between text-white"
                style={{ backgroundColor: "#0d6efd" }}
            >
                <div className="d-flex align-items-center gap-2">
                    <FaFileInvoiceDollar size={22} />
                    <h4 className="fw-bold m-0" style={{ fontSize: "1.25rem" }}>
                        Invoice Management
                    </h4>
                </div>

                <button
                    type="button"
                    className="btn bg-white text-dark border-0 fw-semibold px-3 py-1 d-flex align-items-center gap-2 shadow-sm"
                    style={{
                        borderRadius: "6px",
                        fontSize: "0.9rem",
                        width: "fit-content"
                    }}
                    onClick={onCreateClick}
                >
                    <FaPlus size={14} />
                    Add New Invoice
                </button>
            </div>

            <div className="card-body p-4">
                <div className="input-group mb-4" style={{ maxWidth: "400px" }}>
                    <span className="input-group-text bg-light border-end-0">
                        <FaSearch size={14} className="text-muted" />
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0 bg-light"
                        placeholder="Search invoices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr className="text-secondary fw-semibold">
                                <th>Invoice No</th>
                                <th>Invoice Date</th>
                                <th>PO Number</th>
                                <th>Amount (₹)</th>
                                <th>Status</th>
                                <th className="text-center" style={{ width: "180px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted py-4">
                                        No invoices found.
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv) => {
                                    const isPaid = inv.status?.toUpperCase() === "PAID";
                                    return (
                                        <tr key={inv.invoiceId || inv.id}>
                                            <td className="fw-bold">{inv.invoiceNo}</td>
                                            <td>{inv.invoiceDate}</td>
                                            <td>{inv.purchaseOrder?.poNumber || "N/A"}</td>
                                            <td className="fw-bold text-success">₹{Number(inv.amount || 0).toFixed(2)}</td>
                                            <td>
                                                {isPaid ? (
                                                    <span className="badge bg-success">Paid</span>
                                                ) : (
                                                    <span className="badge bg-warning text-dark">Pending</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                {isPaid ? (
                                                    <span className="text-muted fw-bold fs-5">-</span>
                                                ) : (
                                                    <div className="d-flex justify-content-center align-items-center gap-2">
                                                        {/* Edit Button */}
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-warning btn-sm d-flex align-items-center justify-content-center"
                                                            style={{ width: "36px", height: "36px" }}
                                                            onClick={() => onEdit && onEdit(inv)}
                                                            title="Edit Invoice"
                                                        >
                                                            <FaEdit size={16} />
                                                        </button>

                                                        {/* Payment Button */}
                                                        <button
                                                            type="button"
                                                            className="btn btn-success btn-sm px-3 py-2 fw-semibold"
                                                            style={{ fontSize: "0.9rem" }}
                                                            onClick={() => onPay && onPay(inv)}
                                                        >
                                                            Pay
                                                        </button>

                                                        {/* Delete Button */}
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                                                            style={{ width: "36px", height: "36px" }}
                                                            onClick={() => onDelete(inv.invoiceId || inv.id)}
                                                            title="Delete Invoice"
                                                        >
                                                            <FaTrash size={15} />
                                                        </button>
                                                    </div>
                                                )}
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

export default InvoiceList;
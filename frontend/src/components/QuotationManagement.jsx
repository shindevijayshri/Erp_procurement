import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaArrowLeft, FaFileInvoiceDollar } from 'react-icons/fa';

const API_QUOTATIONS_URL = "http://localhost:8080/api/quotations";
const API_REQUISITIONS_URL = "http://localhost:8080/api/requisitions";
const API_VENDORS_URL = "http://localhost:8080/api/vendors";

// Helper function to format Quote IDs (e.g., 1 -> QT001)
const formatQuoteId = (id) => {
    if (id === null || id === undefined || id === '') return '-';
    return `QT${String(id).padStart(3, '0')}`;
};

export default function QuotationManagement() {
    const [viewMode, setViewMode] = useState('LIST'); // 'LIST' | 'FORM'
    const [quotations, setQuotations] = useState([]);
    const [editingQuotation, setEditingQuotation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper for Headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        return { headers: { Authorization: token ? `Bearer ${token}` : "" } };
    };

    // Fetch Quotations List
    const fetchQuotations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(API_QUOTATIONS_URL, getAuthHeaders());
            setQuotations(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch quotations:", err);
            setError("Failed to load quotations. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuotations();
    }, [fetchQuotations]);

    // Handlers
    const handleOpenCreate = () => {
        setEditingQuotation(null);
        setViewMode('FORM');
    };

    const handleOpenEdit = (quote) => {
        setEditingQuotation(quote);
        setViewMode('FORM');
    };

    const handleDelete = async (quotationId) => {
        if (!window.confirm("Are you sure you want to delete this quotation?")) return;

        try {
            await axios.delete(`${API_QUOTATIONS_URL}/${quotationId}`, getAuthHeaders());
            fetchQuotations();
        } catch (err) {
            alert("Failed to delete quotation.");
        }
    };

    // Filter Search
    const filteredQuotations = quotations.filter((q) => {
        const rawQuoteId = q.quotationId;
        const formattedQuoteId = formatQuoteId(rawQuoteId).toLowerCase();

        const prNumber = (q.purchaseRequisition?.prNumber || `PR${String(q.purchaseRequisition?.prId || '').padStart(3, '0')}`).toLowerCase();
        const vendorName = (q.vendor?.vendorName || '').toLowerCase();
        const status = (q.status || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        return (
            formattedQuoteId.includes(search) ||
            prNumber.includes(search) ||
            vendorName.includes(search) ||
            status.includes(search)
        );
    });

    return (
        <div className="container-fluid p-0">
            {viewMode === 'LIST' ? (
                <QuotationListView
                    quotations={filteredQuotations}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    loading={loading}
                    error={error}
                    onAddNew={handleOpenCreate}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <QuotationFormModal
                    editData={editingQuotation}
                    getAuthHeaders={getAuthHeaders}
                    onBack={() => setViewMode('LIST')}
                    onSuccess={() => {
                        setViewMode('LIST');
                        fetchQuotations();
                    }}
                />
            )}
        </div>
    );
}

/* ==========================================================================
   1. QUOTATION LIST VIEW
   ========================================================================== */
function QuotationListView({
    quotations,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    onAddNew,
    onEdit,
    onDelete,
}) {
    return (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div
                className="p-3 d-flex align-items-center justify-content-between text-white"
                style={{ backgroundColor: "#0d6efd" }}
            >
                <div className="d-flex align-items-center gap-2">
                    <FaFileInvoiceDollar size={22} />
                    <h4 className="fw-bold m-0" style={{ fontSize: "1.25rem" }}>
                        Quotation Management
                    </h4>
                </div>

                <button
                    type="button"
                    className="btn bg-white text-dark border-0 fw-semibold px-3 py-1 d-flex align-items-center gap-2 shadow-sm"
                    style={{ borderRadius: "6px", fontSize: "0.9rem", width: "fit-content" }}
                    onClick={onAddNew}
                >
                    <FaPlus size={14} /> Add New Quotation
                </button>
            </div>

            <div className="card-body p-4 bg-white">
                {error && <div className="alert alert-danger mb-3">{error}</div>}

                <div className="row mb-4">
                    <div className="col-md-5 col-lg-4">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                                <FaSearch className="text-secondary" />
                            </span>
                            <input
                                type="text"
                                className="form-control bg-light border-start-0 ps-0"
                                placeholder="Search by ID, Status, PR or Vendor Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr className="text-secondary border-bottom">
                                <th className="fw-bold">Quote ID</th>
                                <th className="fw-bold">PR ID</th>
                                <th className="fw-bold">Vendor Name</th>
                                <th className="fw-bold">Amount ($)</th>
                                <th className="fw-bold">Quote Date</th>
                                <th className="fw-bold">Status</th>
                                <th className="fw-bold text-center" style={{ width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">
                                        Loading quotations...
                                    </td>
                                </tr>
                            ) : quotations.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">
                                        No quotations found.
                                    </td>
                                </tr>
                            ) : (
                                quotations.map((q) => {
                                    const quoteIdFormatted = formatQuoteId(q.quotationId);
                                    const prNumberDisplay = q.purchaseRequisition?.prNumber ||
                                        (q.purchaseRequisition?.prId ? `PR${String(q.purchaseRequisition.prId).padStart(3, '0')}` : '-');
                                    const vendorNameDisplay = q.vendor?.vendorName || '-';

                                    return (
                                        <tr key={q.quotationId}>
                                            <td>
                                                {quoteIdFormatted}
                                            </td>
                                            <td>
                                                {prNumberDisplay}
                                            </td>
                                            <td>
                                                {vendorNameDisplay}
                                            </td>
                                            <td>
                                                {(q.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td>{q.quoteDate || '-'}</td>
                                            <td>
                                                <span
                                                    className={`badge px-2 py-1 ${q.status === 'ACCEPTED'
                                                        ? 'bg-success'
                                                        : q.status === 'REJECTED'
                                                            ? 'bg-danger'
                                                            : 'bg-warning text-dark'
                                                        }`}
                                                >
                                                    {q.status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-warning btn-sm d-inline-flex align-items-center justify-content-center p-1"
                                                        onClick={() => onEdit(q)}
                                                        title="Edit Quotation"
                                                        style={{ width: '32px', height: '32px', borderRadius: '4px' }}
                                                    >
                                                        <FaEdit size={14} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm d-inline-flex align-items-center justify-content-center p-1"
                                                        onClick={() => onDelete(q.quotationId)}
                                                        title="Delete Quotation"
                                                        style={{ width: '32px', height: '32px', borderRadius: '4px' }}
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
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

/* ==========================================================================
   2. QUOTATION CREATE / EDIT FORM
   ========================================================================== */
function QuotationFormModal({ editData, getAuthHeaders, onBack, onSuccess }) {
    const isEditMode = Boolean(editData);
    const [prOptions, setPrOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        prId: editData?.purchaseRequisition?.prId || editData?.prId || '',
        vendorId: editData?.vendor?.vendorId || editData?.vendorId || '',
        amount: editData?.amount || '',
        quoteDate: editData?.quoteDate || new Date().toISOString().split('T')[0],
        status: editData?.status || 'PENDING',
    });

    // Fetch PRs and Vendors for dropdowns (Filtered to only show approved PRs)
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [prRes, vendorRes] = await Promise.all([
                    axios.get(API_REQUISITIONS_URL, getAuthHeaders()),
                    axios.get(API_VENDORS_URL, getAuthHeaders()),
                ]);

                // Filter PRs to only keep those with status === 'APPROVED' (case-insensitive check just in case)
                const allPrs = Array.isArray(prRes.data) ? prRes.data : [];
                const approvedPrs = allPrs.filter(pr => pr.status && pr.status.toUpperCase() === 'APPROVED');

                setPrOptions(approvedPrs);
                setVendorOptions(Array.isArray(vendorRes.data) ? vendorRes.data : []);
            } catch (err) {
                console.error("Failed to load dropdown choices", err);
            }
        };
        fetchDropdowns();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const quoteId = editData?.quotationId;

            if (isEditMode) {
                const putUrl = `${API_QUOTATIONS_URL}/${quoteId}?prId=${formData.prId}&vendorId=${formData.vendorId}`;

                const payload = {
                    amount: parseFloat(formData.amount),
                    quoteDate: formData.quoteDate,
                    status: formData.status,
                };

                await axios.put(putUrl, payload, getAuthHeaders());
            } else {
                const postUrl = `${API_QUOTATIONS_URL}?prId=${formData.prId}&vendorId=${formData.vendorId}`;
                const payload = {
                    amount: parseFloat(formData.amount),
                    quoteDate: formData.quoteDate,
                    status: formData.status,
                };

                await axios.post(postUrl, payload, getAuthHeaders());
            }

            onSuccess();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Failed to save quotation.";
            setError(typeof msg === 'string' ? msg : "An unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div
                className="p-3 d-flex align-items-center justify-content-between text-white"
                style={{ backgroundColor: "#0d6efd" }}
            >
                <div className="d-flex align-items-center gap-2">
                    <FaFileInvoiceDollar size={22} />
                    <h4 className="fw-bold m-0" style={{ fontSize: "1.25rem" }}>
                        {isEditMode ? "Edit Quotation" : "Add New Quotation"}
                    </h4>
                </div>

                <button
                    type="button"
                    className="btn bg-white text-dark border-0 fw-semibold px-3 py-1 d-flex align-items-center gap-2 shadow-sm"
                    style={{ borderRadius: "6px", fontSize: "0.9rem", width: "fit-content" }}
                    onClick={onBack}
                >
                    <FaArrowLeft size={14} /> Back to List
                </button>
            </div>

            <div className="card-body p-4 bg-white">
                {error && <div className="alert alert-danger mb-4">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row g-3 mb-4">
                        {/* Display Quotation ID when updating */}
                        {isEditMode && (
                            <div className="col-md-6">
                                <label className="form-label fw-medium text-secondary">
                                    Quotation ID
                                </label>
                                <input
                                    type="text"
                                    className="form-control bg-light"
                                    value={formatQuoteId(editData?.quotationId)}
                                    readOnly
                                    disabled
                                />
                            </div>
                        )}

                        {/* PR Dropdown */}
                        <div className="col-md-6">
                            <label className="form-label fw-medium text-secondary">
                                Purchase Requisition (PR) <span className="text-danger">*</span>
                            </label>
                            <select
                                name="prId"
                                required
                                value={formData.prId}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="">-- Select Approved PR --</option>
                                {prOptions.map((pr) => {
                                    const id = pr.prId || pr.id;
                                    const prNum = pr.prNumber || `PR${String(id).padStart(3, '0')}`;
                                    return (
                                        <option key={id} value={id}>
                                            {prNum} - {pr.user?.name ? `Requested by ${pr.user.name}` : 'Requisition'}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Vendor Dropdown */}
                        <div className="col-md-6">
                            <label className="form-label fw-medium text-secondary">
                                Vendor <span className="text-danger">*</span>
                            </label>
                            <select
                                name="vendorId"
                                required
                                value={formData.vendorId}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="">-- Select Vendor --</option>
                                {vendorOptions.map((v) => {
                                    const id = v.vendorId || v.id;
                                    const name = v.vendorName || `Vendor #${id}`;
                                    return (
                                        <option key={id} value={id}>
                                            {name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Amount */}
                        <div className="col-md-6">
                            <label className="form-label fw-medium text-secondary">
                                Amount ($) <span className="text-danger">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="amount"
                                required
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        {/* Quote Date */}
                        <div className="col-md-6">
                            <label className="form-label fw-medium text-secondary">
                                Quote Date <span className="text-danger">*</span>
                            </label>
                            <input
                                type="date"
                                name="quoteDate"
                                required
                                value={formData.quoteDate}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        {/* Status */}
                        <div className="col-md-6">
                            <label className="form-label fw-medium text-secondary">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="PENDING">PENDING</option>
                                <option value="ACCEPTED">ACCEPTED</option>
                                <option value="REJECTED">REJECTED</option>
                            </select>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 border-top pt-4 mt-4">
                        <button type="button" onClick={onBack} className="btn btn-secondary px-4">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="btn btn-primary px-4">
                            {submitting ? "Saving..." : isEditMode ? "Update Quotation" : "Submit Quotation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
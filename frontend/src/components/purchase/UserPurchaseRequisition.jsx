import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaEye, FaPlus, FaSearch, FaClipboardList, FaEdit, FaTrash } from "react-icons/fa";
import CreateRequisitionModal from "../CreateRequisitionModal";

const API_BASE_URL = "http://localhost:8080/api/requisitions";

export default function UserPurchaseRequisition({
    requisitions = [],
    onRefresh,
    loggedInUser,
}) {
    const [viewMode, setViewMode] = useState("LIST");
    const [editData, setEditData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPR, setSelectedPR] = useState(null);
    const [selectedPRItems, setSelectedPRItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [prList, setPrList] = useState(requisitions);

    useEffect(() => {
        setPrList(requisitions);
    }, [requisitions]);

    // Extract email first as reliable identifier
    const currentEmail =
        loggedInUser?.email ||
        localStorage.getItem("userEmail") ||
        localStorage.getItem("email") ||
        (() => {
            try {
                return JSON.parse(localStorage.getItem("user") || "{}")?.email;
            } catch (e) {
                return null;
            }
        })();

    const currentName =
        loggedInUser?.name ||
        localStorage.getItem("userName") ||
        (() => {
            try {
                return JSON.parse(localStorage.getItem("user") || "{}")?.name;
            } catch (e) {
                return null;
            }
        })();

    // Extract user ID, falling back to email if numeric ID is missing in active session
    const currentUserId = (() => {
        if (loggedInUser?.id) return loggedInUser.id;
        if (loggedInUser?.userId) return loggedInUser.userId;
        if (loggedInUser?.user_id) return loggedInUser.user_id;

        const directId = localStorage.getItem("userId") || localStorage.getItem("id") || localStorage.getItem("user_id");
        if (directId) return directId;

        const rawUser = localStorage.getItem("user") || localStorage.getItem("loggedInUser");
        if (rawUser) {
            try {
                const parsed = JSON.parse(rawUser);
                const extractedId = parsed?.id || parsed?.userId || parsed?.user_id || parsed?.user?.id;
                if (extractedId) return extractedId;
            } catch (e) {
                if (!isNaN(rawUser)) return rawUser;
            }
        }

        return currentEmail || null;
    })();

    const getAuthHeaders = () => {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("jwtToken") ||
            localStorage.getItem("accessToken");
        return {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        };
    };

    const fetchLatestPRs = useCallback(async () => {
        if (!currentUserId) return;
        try {
            const res = await axios.get(
                `${API_BASE_URL}?userId=${encodeURIComponent(currentUserId)}`,
                getAuthHeaders()
            );
            if (Array.isArray(res.data)) {
                setPrList(res.data);
            }
        } catch (err) {
            console.error("Error fetching updated PR list:", err);
        }
    }, [currentUserId]);

    useEffect(() => {
        fetchLatestPRs();
    }, [fetchLatestPRs]);

    const userPRs = (prList || []).filter((pr) => {
        if (!pr) return false;

        const prUserId = pr.user?.id || pr.userId || pr.user_id;
        if (currentUserId && prUserId) {
            return String(prUserId) === String(currentUserId);
        }

        const prUserEmail = pr.user?.email || pr.userEmail || pr.email;
        if (currentEmail && prUserEmail) {
            return prUserEmail.toLowerCase() === currentEmail.toLowerCase();
        }

        const prUserName = pr.user?.name || pr.user?.username || pr.userName;
        if (currentName && prUserName) {
            return prUserName.toLowerCase() === currentName.toLowerCase();
        }

        return false;
    });

    const filteredPRs = userPRs.filter((pr) => {
        const term = searchTerm.toLowerCase();
        const prNo = String(pr.prNumber || pr.pr_number || pr.prId || pr.pr_id || pr.id || "").toLowerCase();
        const status = String(pr.status || "").toLowerCase();
        return prNo.includes(term) || status.includes(term);
    });

    const handleCreateSuccess = async () => {
        setEditData(null);
        setViewMode("LIST");
        await fetchLatestPRs();
        if (onRefresh) onRefresh();
    };

    const handleEditPR = async (pr) => {
        // DEBUG: Check full PR object coming from backend table
        console.log("FULL PR OBJECT RECEIVED FROM BACKEND:", pr);

        try {
            const prId = pr.prId || pr.pr_id || pr.id;
            console.log("EXTRACTED prId:", prId);

            if (!prId) {
                console.error("Purchase Requisition ID not found on object:", pr);
                setEditData(pr);
                setViewMode("CREATE");
                return;
            }

            const res = await axios.get(
                `${API_BASE_URL}/${prId}/items`,
                getAuthHeaders()
            );

            const rawItems = res.data || pr.items || pr.requisitionItems || pr.prItems || [];
            const mappedItems = rawItems.map((itm) => ({
                prItemId:
                    itm.prItemId ||
                    itm.pr_item_id ||
                    null,

                itemId: String(
                    itm.item?.itemId ||
                    itm.itemId ||
                    itm.item?.id ||
                    ""
                ),

                quantity: Number(itm.quantity || 1)
            }));
            setEditData({ ...pr, items: mappedItems });
        } catch (err) {
            console.error("Error fetching items for edit:", err);
            const fallbackRawItems = pr.items || pr.requisitionItems || pr.prItems || [];
            const mappedFallbackItems = fallbackRawItems.map((itm) => ({
                itemId: String(
                    itm.item?.itemId ||
                    itm.itemId ||
                    itm.item?.id ||
                    itm.id ||
                    ""
                ),
                quantity: Number(itm.quantity || 1)
            }));
            setEditData({ ...pr, items: mappedFallbackItems });
        }
        setViewMode("CREATE");
    };

    const handleDeletePR = async (pr) => {
        console.log("DELETE PR OBJECT:", pr);
        const prId = pr.prId || pr.pr_id || pr.id;
        const prNo = pr.prNumber || pr.pr_number || `PR#${prId}`;

        if (window.confirm(`Are you sure you want to delete requisition ${prNo}?`)) {
            try {
                await axios.delete(`${API_BASE_URL}/${prId}`, getAuthHeaders());
                await fetchLatestPRs();
                if (onRefresh) onRefresh();
            } catch (err) {
                console.error("Error deleting requisition:", err);
                alert("Failed to delete requisition.");
            }
        }
    };

    const handleViewModal = async (pr) => {
        console.log("VIEW PR OBJECT:", pr);
        setSelectedPR(pr);
        setLoadingItems(true);
        try {
            const prId = pr.prId || pr.pr_id || pr.id;
            const res = await axios.get(
                `${API_BASE_URL}/${prId}/items`,
                getAuthHeaders()
            );
            setSelectedPRItems(res.data);
        } catch (err) {
            console.error("Error fetching line items:", err);
            setSelectedPRItems(pr.prItems || pr.items || []);
        } finally {
            setLoadingItems(false);
        }
    };

    const handleCloseViewModal = () => {
        setSelectedPR(null);
        setSelectedPRItems([]);
    };

    return (
        <div className="container-fluid p-4">
            {viewMode === "CREATE" ? (
                <CreateRequisitionModal
                    editData={editData}
                    onClose={() => {
                        setEditData(null);
                        setViewMode("LIST");
                    }}
                    onSuccess={handleCreateSuccess}
                    currentUserId={currentUserId}
                />
            ) : (
                <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                    <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <FaClipboardList className="fs-5" />
                            <h5 className="mb-0 fw-bold fs-5">My Purchase Requisitions</h5>
                        </div>
                        <button
                            type="button"
                            className="btn btn-light btn-sm fw-semibold text-dark d-inline-flex align-items-center gap-1 px-3 py-1 rounded-2 shadow-sm"
                            style={{ width: "auto" }}
                            onClick={() => {
                                setEditData(null);
                                setViewMode("CREATE");
                            }}
                        >
                            <FaPlus className="me-1" /> Post New Requisition
                        </button>
                    </div>

                    <div className="card-body p-4">
                        <div className="row mb-4">
                            <div className="col-md-4">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-light border-end-0">
                                        <FaSearch className="text-muted" />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-start-0"
                                        placeholder="Search by PR Number or Status..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="fw-bold">PR Number</th>
                                        <th className="fw-bold">Req Date</th>
                                        <th className="fw-bold">Remarks</th>
                                        <th className="fw-bold">Status</th>
                                        <th className="fw-bold text-center" style={{ width: "130px" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPRs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted">
                                                No purchase requisitions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPRs.map((pr) => {
                                            const prId = pr.prId || pr.pr_id || pr.id;
                                            const prNo =
                                                pr.prNumber || pr.pr_number || `PR${String(prId || "").padStart(3, "0")}`;
                                            const prDate = pr.prDate || pr.pr_date || "N/A";
                                            const status = String(pr.status || "PENDING").toUpperCase();
                                            const isPending = status === "PENDING";

                                            return (
                                                <tr key={prId || Math.random()}>
                                                    <td className="fw-bold text-dark">{prNo}</td>
                                                    <td>{prDate}</td>
                                                    <td className="text-muted">{pr.remarks || "—"}</td>
                                                    <td>
                                                        <span
                                                            className={`badge px-3 py-2 ${status === "PENDING"
                                                                ? "bg-warning text-dark"
                                                                : status === "APPROVED"
                                                                    ? "bg-success"
                                                                    : status === "REJECTED"
                                                                        ? "bg-danger"
                                                                        : "bg-secondary"
                                                                }`}
                                                        >
                                                            {status}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="d-flex justify-content-center gap-1">
                                                            <button
                                                                className="btn btn-sm btn-outline-primary p-0 d-inline-flex justify-content-center align-items-center rounded-2"
                                                                style={{ width: "32px", height: "32px" }}
                                                                title="View Details"
                                                                onClick={() => handleViewModal(pr)}
                                                            >
                                                                <FaEye size={14} />
                                                            </button>

                                                            {isPending && (
                                                                <>
                                                                    <button
                                                                        className="btn btn-sm btn-outline-warning p-0 d-inline-flex justify-content-center align-items-center rounded-2"
                                                                        style={{ width: "32px", height: "32px" }}
                                                                        title="Edit PR"
                                                                        onClick={() => handleEditPR(pr)}
                                                                    >
                                                                        <FaEdit size={14} />
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger p-0 d-inline-flex justify-content-center align-items-center rounded-2"
                                                                        style={{ width: "32px", height: "32px" }}
                                                                        title="Delete PR"
                                                                        onClick={() => handleDeletePR(pr)}
                                                                    >
                                                                        <FaTrash size={14} />
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
            )}

            {/* VIEW MODAL */}
            {selectedPR && (
                <div
                    className="modal show d-block bg-dark bg-opacity-50"
                    tabIndex="-1"
                    style={{ zIndex: 1050 }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg rounded-3">
                            <div className="modal-header border-bottom-0 pb-0">
                                <h5 className="modal-title fw-bold text-primary">
                                    PR Details -{" "}
                                    {selectedPR.prNumber ||
                                        selectedPR.pr_number ||
                                        `PR${String(selectedPR.prId || selectedPR.pr_id || selectedPR.id || "").padStart(3, "0")}`}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseViewModal}
                                ></button>
                            </div>

                            <div className="modal-body p-4">
                                <div className="card bg-light border-0 mb-4 p-3 rounded-3">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <span className="text-muted d-block small fw-semibold">Req Date:</span>
                                            <span>{selectedPR.prDate || selectedPR.pr_date || "N/A"}</span>
                                        </div>
                                        <div className="col-md-4">
                                            <span className="text-muted d-block small fw-semibold">Status:</span>
                                            <span
                                                className={`badge ${String(selectedPR.status).toUpperCase() === "PENDING"
                                                    ? "bg-warning text-dark"
                                                    : String(selectedPR.status).toUpperCase() === "APPROVED"
                                                        ? "bg-success"
                                                        : "bg-danger"
                                                    }`}
                                            >
                                                {String(selectedPR.status || "PENDING").toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="col-md-4">
                                            <span className="text-muted d-block small fw-semibold">Remarks:</span>
                                            <span>{selectedPR.remarks || "—"}</span>
                                        </div>
                                    </div>
                                </div>

                                <h6 className="fw-bold mb-3">Line Items</h6>
                                {loadingItems ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                        <span className="ms-2 text-muted">Loading items...</span>
                                    </div>
                                ) : (
                                    <div className="table-responsive border rounded-3">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Item Name</th>
                                                    <th>Code/Category</th>
                                                    <th className="text-center">Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedPRItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="3" className="text-center py-3 text-muted">
                                                            No line items found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    selectedPRItems.map((item, idx) => (
                                                        <tr key={item.prItemId || item.itemId || idx}>
                                                            <td className="fw-semibold">
                                                                {item.item?.itemName || item.item?.name || item.itemName || `Item #${item.itemId || idx + 1}`}
                                                            </td>
                                                            <td className="text-muted">
                                                                {item.item?.category || item.category || "Office Supplies"}
                                                            </td>
                                                            <td className="text-center fw-bold">{item.quantity || 0}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer border-top-0 pt-0">
                                <button
                                    type="button"
                                    className="btn btn-secondary w-100 py-2 fw-semibold"
                                    onClick={handleCloseViewModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
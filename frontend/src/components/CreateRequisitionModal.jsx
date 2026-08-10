import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaArrowLeft, FaPlus, FaTrash, FaClipboardList } from "react-icons/fa";

const BASE_URL = "http://localhost:8080/api";

export default function CreateRequisitionModal({
    editData = null,
    onClose,
    onSuccess,
    currentUserId,
    loggedInUser,
}) {
    const isEdit = Boolean(editData);

    // Form state
    const [prNumber, setPrNumber] = useState("");
    const [prDate, setPrDate] = useState("");
    const [remarks, setRemarks] = useState("");
    const [status] = useState("PENDING");

    // Dynamic Items state
    const [availableItems, setAvailableItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([
        { id: Date.now(), prItemId: null, itemId: "", quantity: 1 },
    ]);

    // UI Loading states
    const [loading, setLoading] = useState(false);
    const [fetchingItems, setFetchingItems] = useState(false);

    // --- Helper: Resolves User ID from props, localStorage, or JWT Token Payload ---
    const getResolvedUserId = () => {
        if (currentUserId && currentUserId !== "undefined" && currentUserId !== "null") {
            return currentUserId;
        }
        if (loggedInUser?.id) return loggedInUser.id;
        if (loggedInUser?.userId) return loggedInUser.userId;
        if (loggedInUser?.user_id) return loggedInUser.user_id;

        const directKeys = ["userId", "user_id", "id", "empId", "employeeId"];
        for (const key of directKeys) {
            const val = localStorage.getItem(key);
            if (val && val !== "undefined" && val !== "null") return val;
        }

        const objectKeys = ["user", "userData", "authUser", "currentUser", "userInfo"];
        for (const key of objectKeys) {
            const item = localStorage.getItem(key);
            if (item) {
                try {
                    const parsed = JSON.parse(item);
                    const resolved = parsed?.id || parsed?.userId || parsed?.user_id || parsed?.empId;
                    if (resolved) return resolved;
                } catch (e) {
                    // Ignore JSON parse errors
                }
            }
        }

        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("jwtToken") ||
            localStorage.getItem("accessToken");

        if (token && token.includes(".")) {
            try {
                const base64Url = token.split(".")[1];
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const payload = JSON.parse(window.atob(base64));
                const jwtId = payload.id || payload.userId || payload.user_id || payload.sub;
                if (jwtId && !isNaN(jwtId)) return jwtId;
            } catch (e) {
                console.warn("Could not parse JWT token payload:", e);
            }
        }

        return null;
    };

    // --- Helper: Setup Auth Headers ---
    const getAuthHeaders = () => {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("jwtToken") ||
            localStorage.getItem("accessToken");
        return {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
                "Content-Type": "application/json",
            },
        };
    };

    // --- Helper: Get Today's Date formatted YYYY-MM-DD ---
    const getTodayDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };


    // --- Initial Effect: Fetch Catalog Items & Pre-fill Form ---
    useEffect(() => {
        let isMounted = true;

        const fetchItems = async () => {
            setFetchingItems(true);
            try {
                const res = await axios.get(`${BASE_URL}/items`, getAuthHeaders());

                if (isMounted && Array.isArray(res.data)) {
                    setAvailableItems(res.data);
                }
            } catch (err) {
                console.error("Error fetching items catalog:", err);
            } finally {
                if (isMounted) {
                    setFetchingItems(false);
                }
            }
        };

        const fetchNextPRNumber = async () => {
            try {
                const res = await axios.get(
                    `${BASE_URL}/requisitions/next-number`,
                    getAuthHeaders()
                );

                if (isMounted) {
                    setPrNumber(res.data);
                }
            } catch (err) {
                console.error("Error fetching next PR number:", err);

                if (isMounted) {
                    setPrNumber("");
                }
            }
        };

        fetchItems();

        if (isEdit && editData) {

            // EDIT MODE
            setPrNumber(editData.prNumber || editData.pr_number || "");
            setPrDate(editData.prDate || editData.pr_date || getTodayDate());
            setRemarks(editData.remarks || "");

            const items = editData.items || editData.prItems || [];

            if (items.length > 0) {
                setSelectedItems(
                    items.map((i, idx) => ({
                        id: `edit_${idx}`,
                        prItemId:
                            i.prItemId ||
                            i.pr_item_id ||
                            i.id ||
                            i.prItem?.prItemId ||
                            null,

                        itemId: String(
                            i.item?.itemId ||
                            i.item?.id ||
                            i.itemId ||
                            ""
                        ),

                        quantity: Number(i.quantity || 1)
                    }))
                );
            }

        } else {

            // CREATE MODE
            fetchNextPRNumber();
            setPrDate(getTodayDate());
            setRemarks("");

        }

        return () => {
            isMounted = false;
        };

    }, [editData, isEdit]);
    // --- Item Handlers ---
    const handleItemChange = (index, field, value) => {
        const updated = [...selectedItems];
        updated[index][field] = value;
        setSelectedItems(updated);
    };

    const handleAddItemRow = () => {
        setSelectedItems([
            ...selectedItems,
            { id: Date.now() + Math.random(), prItemId: null, itemId: "", quantity: 1 },
        ]);
    };

    const handleRemoveItemRow = (index) => {
        if (selectedItems.length === 1) return;
        const updated = selectedItems.filter((_, i) => i !== index);
        setSelectedItems(updated);
    };

    // --- Form Submit Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        const activeUserId = getResolvedUserId();

        if (!activeUserId) {
            alert("User ID missing from active session. Please log out and log in again.");
            return;
        }

        const validItems = selectedItems.filter(
            (i) => i.itemId !== "" && Number(i.quantity) > 0
        );

        if (validItems.length === 0) {
            alert("Please select at least one valid item with a quantity greater than 0.");
            return;
        }

        // Check for duplicate selected items in UI rows
        const selectedIds = validItems.map((i) => i.itemId);
        if (new Set(selectedIds).size !== selectedIds.length) {
            alert("Duplicate items detected in rows. Please combine quantities into a single row.");
            return;
        }

        setLoading(true);

        try {
            if (isEdit) {
                const prId = editData.prId || editData.pr_id;
                const existingItems = editData.items || editData.prItems || [];

                // 1. Update Header
                try {
                    await axios.put(
                        `${BASE_URL}/requisitions/${prId}`,
                        { prNumber, prDate, remarks, status: "PENDING" },
                        getAuthHeaders()
                    );
                } catch (putErr) {
                    try {
                        await axios.put(
                            `${BASE_URL}/requisitions/${prId}/remarks?remarks=${encodeURIComponent(
                                remarks
                            )}`,
                            {},
                            getAuthHeaders()
                        );
                    } catch (remErr) {
                        console.warn("Header update warning:", remErr);
                    }
                }

                // 2. Safely Delete Removed Items
                const deletePromises = existingItems
                    .filter((oldItem) => {
                        const oldPrItemId = oldItem.prItemId || oldItem.pr_item_id || oldItem.id;
                        if (!oldPrItemId) return false;

                        // Check if this old database item still exists in our current valid UI rows
                        const stillExists = validItems.some(
                            (item) =>
                                (item.prItemId && String(item.prItemId) === String(oldPrItemId)) ||
                                String(item.itemId) === String(oldItem.item?.itemId || oldItem.item?.id || oldItem.itemId)
                        );
                        return !stillExists;
                    })
                    .map((oldItem) => {
                        const oldPrItemId = oldItem.prItemId || oldItem.pr_item_id || oldItem.id;
                        return axios.delete(
                            `${BASE_URL}/requisitions/items/${oldPrItemId}`,
                            getAuthHeaders()
                        );
                    });

                await Promise.all(deletePromises);

                // 3. Save / Update Items Cleanly
                const savePromises = validItems.map((item) => {
                    const matchingExistingItem = existingItems.find(
                        (old) =>
                            String(old.item?.itemId || old.item?.id || old.itemId) === String(item.itemId)
                    );

                    const targetPrItemId = item.prItemId || matchingExistingItem?.prItemId || matchingExistingItem?.pr_item_id;

                    if (targetPrItemId) {
                        // Update existing database entry quantity
                        return axios.put(
                            `${BASE_URL}/requisitions/items/${targetPrItemId}?quantity=${Number(
                                item.quantity
                            )}`,
                            {},
                            getAuthHeaders()
                        );
                    } else {
                        // Add brand new item entry to PR
                        return axios.post(
                            `${BASE_URL}/requisitions/${prId}/items?itemId=${item.itemId}`,
                            { quantity: Number(item.quantity) },
                            getAuthHeaders()
                        );
                    }
                });

                await Promise.all(savePromises);
            } else {
                // CREATE NEW PR
                const createRes = await axios.post(
                    `${BASE_URL}/requisitions?userId=${encodeURIComponent(activeUserId)}`,
                    { prNumber, prDate, remarks, status: "PENDING" },
                    getAuthHeaders()
                );

                const createdPR = createRes.data;
                const newPrId = createdPR.prId || createdPR.pr_id || createdPR.id;

                if (newPrId) {
                    const itemPromises = validItems.map((item) =>
                        axios.post(
                            `${BASE_URL}/requisitions/${newPrId}/items?itemId=${item.itemId}`,
                            { quantity: Number(item.quantity) },
                            getAuthHeaders()
                        )
                    );
                    await Promise.all(itemPromises);
                }
            }

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Error saving requisition:", err);
            const serverMsg =
                err.response?.data?.message ||
                (typeof err.response?.data === "string" ? err.response?.data : null) ||
                "Failed to save requisition.";
            alert(`Error: ${serverMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                    <FaClipboardList className="fs-5" />
                    <h5 className="mb-0 fw-bold fs-5">
                        {isEdit ? "Edit Purchase Requisition" : "Create Purchase Requisition"}
                    </h5>
                </div>
                <button
                    type="button"
                    className="btn btn-light btn-sm fw-semibold text-dark d-inline-flex align-items-center gap-1 px-3 py-1 rounded-2 shadow-sm w-auto flex-shrink-0"
                    onClick={onClose}
                >
                    <FaArrowLeft /> Back to List
                </button>
            </div>

            <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label text-muted fw-semibold small">
                                PR Number
                            </label>
                            <input
                                type="text"
                                className="form-control bg-light"
                                value={prNumber}
                                readOnly
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label text-muted fw-semibold small">
                                PR Date <span className="text-danger">*</span>
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                value={prDate}
                                onChange={(e) => setPrDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label className="form-label text-muted fw-semibold small">
                                Status
                            </label>
                            <input
                                type="text"
                                className="form-control bg-light"
                                value={status}
                                readOnly
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label text-muted fw-semibold small">
                                Remarks
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Optional remarks..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="d-flex align-items-center mb-3">
                            <h6 className="fw-bold text-dark mb-0 me-3">
                                Requisition Items
                            </h6>
                            <button
                                type="button"
                                className="btn btn-outline-primary flex-grow-1 fw-semibold"
                                onClick={handleAddItemRow}
                            >
                                <FaPlus className="me-2" />
                                Add Item
                            </button>
                        </div>
                        {fetchingItems ? (
                            <div className="text-center py-3 text-muted">Loading items catalog...</div>
                        ) : (
                            selectedItems.map((itemRow, index) => (
                                <div className="row g-2 align-items-center mb-2" key={itemRow.id}>
                                    <div className="col-md-8">
                                        <select
                                            className="form-select"
                                            value={itemRow.itemId}
                                            onChange={(e) =>
                                                handleItemChange(index, "itemId", e.target.value)
                                            }
                                            required
                                        >
                                            <option value="">-- Select Item --</option>
                                            {availableItems.map((item) => {
                                                const id = String(item.itemId || item.id);
                                                const label =
                                                    item.itemName || item.name || `Item #${id}`;
                                                return (
                                                    <option key={id} value={id}>
                                                        {label}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="1"
                                            value={itemRow.quantity}
                                            onChange={(e) =>
                                                handleItemChange(index, "quantity", e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="col-md-1 text-end">
                                        {selectedItems.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm p-2"
                                                onClick={() => handleRemoveItemRow(index)}
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="row g-2 pt-3">
                        <div className="col-md-6">
                            <button
                                type="button"
                                className="btn btn-secondary w-100 py-2 fw-semibold"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                        <div className="col-md-6">
                            <button
                                type="submit"
                                className="btn btn-primary w-100 py-2 fw-semibold"
                                disabled={loading}
                            >
                                {loading ? "Submitting..." : "Submit Requisition"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBoxes, FaPlus, FaSearch, FaEdit, FaTrash, FaSave, FaArrowLeft } from "react-icons/fa";

function Items() {
    const [itemsList, setItemsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState("list"); // 'list' or 'form'
    const [editingId, setEditingId] = useState(null);

    const initialFormState = {
        itemCode: "",
        itemName: "",
        category: "Electronics",
        stockQty: 0,
        unitPrice: 0
    };

    const [formData, setFormData] = useState(initialFormState);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token") || localStorage.getItem("jwt");
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:8080/api/items", getAuthHeaders());
            const data = Array.isArray(res.data)
                ? res.data
                : res.data.content || res.data.data || [];
            setItemsList(data);
        } catch (error) {
            console.error("Error fetching items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setView("form");
    };

    const handleOpenEdit = (item) => {
        const id = item.itemId || item.item_id || item.id;
        setEditingId(id);
        setFormData({
            itemCode: item.itemCode || item.item_code || "",
            itemName: item.itemName || item.item_name || "",
            category: item.category || "Electronics",
            stockQty: item.stockQty ?? item.stock_qty ?? 0,
            unitPrice: item.unitPrice ?? item.unit_price ?? 0
        });
        setView("form");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/items/${id}`, getAuthHeaders());
            await fetchItems();
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Failed to delete item.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            itemCode: formData.itemCode,
            itemName: formData.itemName,
            category: formData.category,
            stockQty: Number(formData.stockQty),
            unitPrice: Number(formData.unitPrice)
        };

        try {
            const config = getAuthHeaders();
            if (editingId) {
                await axios.put(`http://localhost:8080/api/items/${editingId}`, payload, config);
            } else {
                await axios.post("http://localhost:8080/api/items", payload, config);
            }
            await fetchItems();
            setView("list");
        } catch (error) {
            console.error("Error saving item:", error);
            alert("Failed to save item. Please verify backend fields.");
        }
    };

    const filteredItems = itemsList.filter((item) => {
        const name = item.itemName || item.item_name || "";
        const code = item.itemCode || item.item_code || "";
        const cat = item.category || "";
        const search = searchTerm.toLowerCase();

        return (
            name.toLowerCase().includes(search) ||
            code.toLowerCase().includes(search) ||
            cat.toLowerCase().includes(search)
        );
    });

    return (
        <div className="card border-0 rounded-3 overflow-hidden shadow-sm">
            {/* Header */}
            <div
                className="p-3 d-flex align-items-center justify-content-between text-white"
                style={{ backgroundColor: "#0d6efd" }}
            >
                <div className="d-flex align-items-center gap-2">
                    <FaBoxes size={22} />
                    <h5 className="fw-bold m-0" style={{ fontSize: "1.2rem" }}>
                        {view === "list" ? "Items Master Data" : editingId ? "Edit Item" : "Add New Item"}
                    </h5>
                </div>
                {view === "list" ? (
                    <button
                        type="button"
                        className="btn bg-white text-black fw-semibold px-3 py-1.5 d-flex align-items-center gap-2 shadow-sm border-0"
                        style={{ borderRadius: "6px", fontSize: "0.85rem", width: "auto" }}
                        onClick={handleOpenAdd}
                    >
                        <FaPlus size={12} /> Add New Item
                    </button>
                ) : (
                    <button
                        type="button"
                        className="btn bg-white text-dark fw-semibold px-3 py-1.5 d-flex align-items-center gap-2 shadow-sm border-0"
                        style={{ borderRadius: "6px", fontSize: "0.85rem", width: "auto" }}
                        onClick={() => setView("list")}
                    >
                        <FaArrowLeft size={12} /> Back to List
                    </button>
                )}
            </div>

            {/* List View */}
            {view === "list" ? (
                <div className="card-body p-4">
                    <div className="mb-4" style={{ maxWidth: "320px" }}>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                                <FaSearch className="text-muted" />
                            </span>
                            <input
                                type="text"
                                className="form-control bg-light border-start-0 ps-0"
                                placeholder="Search by name, code, category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5 text-muted">
                            <div className="spinner-border text-primary me-2" role="status"></div>
                            Loading items...
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-5 text-muted fw-semibold">
                            No items found.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr className="text-secondary fw-semibold" style={{ fontSize: "0.88rem" }}>
                                        <th>ID</th>
                                        <th>Item Code</th>
                                        <th>Item Name</th>
                                        <th>Category</th>
                                        <th>Stock Qty</th>
                                        <th>Unit Price</th>
                                        <th className="text-center" style={{ width: "90px" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody style={{ fontSize: "0.9rem" }}>
                                    {filteredItems.map((item) => {
                                        const id = item.itemId || item.item_id || item.id;
                                        const code = item.itemCode || item.item_code || "N/A";
                                        const name = item.itemName || item.item_name || "N/A";
                                        const category = item.category || "N/A";
                                        const stock = item.stockQty ?? item.stock_qty ?? 0;
                                        const price = item.unitPrice ?? item.unit_price ?? 0;

                                        return (
                                            <tr key={id}>
                                                <td className="fw-bold text-muted">{id}</td>
                                                <td><span className="badge bg-light text-dark border">{code}</span></td>
                                                <td className="fw-semibold">{name}</td>
                                                <td>{category}</td>
                                                <td>
                                                    <span className={`fw-semibold ${stock < 15 ? "text-danger" : "text-dark"}`}>
                                                        {stock}
                                                    </span>
                                                </td>
                                                <td className="fw-bold text-success">
                                                    ₹{Number(price).toLocaleString()}
                                                </td>
                                                <td className="text-center">
                                                    {/* Compacted Action Buttons */}
                                                    <div className="d-flex justify-content-center gap-1">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-warning p-1"
                                                            style={{ lineHeight: "1", padding: "2px 6px" }}
                                                            title="Edit Item"
                                                            onClick={() => handleOpenEdit(item)}
                                                        >
                                                            <FaEdit size={12} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger p-1"
                                                            style={{ lineHeight: "1", padding: "2px 6px" }}
                                                            title="Delete Item"
                                                            onClick={() => handleDelete(id)}
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                /* Form View */
                <div className="card-body p-4" style={{ fontSize: "0.95rem" }}>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Item Code *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. IT-006, OFF-005"
                                    value={formData.itemCode}
                                    onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Category *</label>
                                <select
                                    className="form-select"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="Electronics">Electronics</option>
                                    <option value="Office Supplies">Office Supplies</option>
                                    <option value="Furniture">Furniture</option>
                                    <option value="Networking">Networking</option>
                                    <option value="Breakroom">Breakroom</option>
                                </select>
                            </div>

                            <div className="col-md-12">
                                <label className="form-label fw-semibold">Item Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Dell Latitude Laptop 5540"
                                    value={formData.itemName}
                                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Stock Quantity *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={formData.stockQty}
                                    onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Unit Price (₹) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-control"
                                    value={formData.unitPrice}
                                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary px-4" onClick={() => setView("list")}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary px-4">
                                <FaSave className="me-1" /> {editingId ? "Update Item" : "Save Item"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Items;
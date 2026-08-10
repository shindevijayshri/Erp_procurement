import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    FaBuilding,
    FaPlus,
    FaEdit,
    FaTrash,
    FaArrowLeft,
    FaSave,
    FaSearch
} from "react-icons/fa";

function Vendors() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState("list"); // 'list' | 'form'
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State matching backend camelCase JSON properties
    const [formData, setFormData] = useState({
        vendorName: "",
        email: "",
        phone: "",
        gstNo: "",
        address: ""
    });

    const API_BASE_URL = "http://localhost:8080/api/vendors";
    const token = localStorage.getItem("token");
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // ----------------------------------------------------
    // FETCH VENDORS
    // ----------------------------------------------------
    const fetchVendors = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_BASE_URL, authHeader);
            console.log("Fetched Vendors:", response.data);
            setVendors(response.data);
        } catch (error) {
            console.error("Error fetching vendors:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    // ----------------------------------------------------
    // HANDLERS
    // ----------------------------------------------------
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({ vendorName: "", email: "", phone: "", gstNo: "", address: "" });
        setView("form");
    };

    const handleOpenEdit = (vendor) => {
        setEditingId(vendor.vendorId);
        setFormData({
            vendorName: vendor.vendorName || "",
            email: vendor.email || "",
            phone: vendor.phone || "",
            gstNo: vendor.gstNo || "",
            address: vendor.address || ""
        });
        setView("form");
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this vendor?")) {
            try {
                await axios.delete(`${API_BASE_URL}/${id}`, authHeader);
                setVendors(vendors.filter((v) => v.vendorId !== id));
            } catch (error) {
                console.error("Error deleting vendor:", error);
                alert("Failed to delete vendor.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const response = await axios.put(`${API_BASE_URL}/${editingId}`, formData, authHeader);
                setVendors(vendors.map((v) => (v.vendorId === editingId ? response.data : v)));
            } else {
                const response = await axios.post(API_BASE_URL, formData, authHeader);
                setVendors([...vendors, response.data]);
            }
            setView("list");
        } catch (error) {
            console.error("Error saving vendor:", error);
            alert("Failed to save vendor details.");
        }
    };

    // Search filter matching camelCase properties
    const filteredVendors = vendors.filter((v) =>
        (v.vendorName && v.vendorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.email && v.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.gstNo && v.gstNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const cardStyle = {
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        border: "1px solid #eaeaea",
        backgroundColor: "#ffffff"
    };

    return (
        <div className="card border-0 rounded-3 overflow-hidden" style={cardStyle}>

            {/* HEADER */}
            <div
                className="p-3 d-flex align-items-center justify-content-between text-white"
                style={{ backgroundColor: "#0d6efd" }}
            >
                <div className="d-flex align-items-center gap-2">
                    <FaBuilding size={22} />
                    <h4 className="fw-bold m-0" style={{ fontSize: "1.25rem" }}>
                        {view === "list" ? "Vendor Management" : (editingId ? "Edit Vendor" : "Add New Vendor")}
                    </h4>
                </div>

                <button
                    type="button"
                    className="btn bg-white text-dark border-0 fw-semibold px-3 py-1 d-flex align-items-center gap-2 shadow-sm"
                    style={{ borderRadius: "6px", fontSize: "0.9rem", width: "fit-content" }}
                    onClick={view === "list" ? handleOpenAdd : () => setView("list")}
                >
                    {view === "list" ? (
                        <><FaPlus size={14} /> Add New Vendor</>
                    ) : (
                        <><FaArrowLeft size={14} /> Back to List</>
                    )}
                </button>
            </div>

            {/* LIST VIEW */}
            {view === "list" && (
                <div className="p-4">
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white text-muted">
                                    <FaSearch />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Search vendors..."
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
                                    <th>Vendor Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>GST No</th>
                                    <th>Address</th>
                                    <th className="text-center" style={{ width: "120px" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">Loading vendors...</td>
                                    </tr>
                                ) : filteredVendors.length > 0 ? (
                                    filteredVendors.map((vendor) => (
                                        <tr key={vendor.vendorId}>
                                            <td>{vendor.vendorName}</td>
                                            <td>{vendor.email}</td>
                                            <td>{vendor.phone}</td>
                                            <td>{vendor.gstNo || "-"}</td>
                                            <td>{vendor.address || "-"}</td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-warning p-2 d-flex align-items-center justify-content-center"
                                                        style={{ borderRadius: "6px", width: "32px", height: "32px" }}
                                                        title="Edit Vendor"
                                                        onClick={() => handleOpenEdit(vendor)}
                                                    >
                                                        <FaEdit size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger p-2 d-flex align-items-center justify-content-center"
                                                        style={{ borderRadius: "6px", width: "32px", height: "32px" }}
                                                        title="Delete Vendor"
                                                        onClick={() => handleDelete(vendor.vendorId)}
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">
                                            No vendors found. Click "Add New Vendor" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* FORM VIEW */}
            {view === "form" && (
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Vendor / Company Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="vendorName"
                                    value={formData.vendorName}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Sunrise Enterprise"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Email Address *</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="sunrise@gmail.com"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Phone Number *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="3245627134"
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">GST Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="gstNo"
                                    value={formData.gstNo}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 4357fet980"
                                />
                            </div>

                            <div className="col-md-12">
                                <label className="form-label fw-semibold">Address</label>
                                <textarea
                                    className="form-control"
                                    name="address"
                                    rows="2"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Mumbai"
                                />
                            </div>
                        </div>

                        <hr className="my-4" />

                        <div className="d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-secondary px-5 py-2 fw-semibold"
                                style={{ width: "48%" }}
                                onClick={() => setView("list")}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary px-5 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                style={{ width: "48%" }}
                            >
                                <FaSave /> {editingId ? "Update Vendor" : "Save Vendor"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}

export default Vendors;
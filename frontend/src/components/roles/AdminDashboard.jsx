import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaUserPlus, FaUsers, FaUserShield, FaUserTie, FaUserCog, FaTimes, FaArrowLeft, FaSave, FaBell, FaCheck, FaBan } from "react-icons/fa";

function AdminDashboard({ activeTab, setActiveTab }) {
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Modal state for EDITING users
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        user_id: null,
        name: "",
        email: "",
        password: "",
        phone: "",
        department: "",
        role: "ROLE_USER"
    });

    const token = localStorage.getItem("token");
    const authHeader = {
        headers: { Authorization: `Bearer ${token}` }
    };

    // Fetch Users & Filter Pending/Approved based on status field
    const fetchUsers = async () => {
        try {

            // Fetch approved users
            const usersResponse = await axios.get(
                "http://localhost:8080/api/users",
                authHeader
            );

            // Fetch pending users separately
            const pendingResponse = await axios.get(
                "http://localhost:8080/api/users/pending",
                authHeader
            );

            setUsers(usersResponse.data);
            setPendingUsers(pendingResponse.data);

            console.log("Approved Users:", usersResponse.data);
            console.log("Pending Users:", pendingResponse.data);

        } catch (error) {

            console.error("Error fetching users:", error);

            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Response:", error.response.data);
            }

        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Save/Update Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...formData, status: "APPROVED" };
            const userId = formData.user_id || formData.id;

            if (editMode) {
                await axios.put(`http://localhost:8080/api/users/${userId}`, payload, authHeader);
                alert("User updated successfully!");
            } else {
                await axios.post("http://localhost:8080/api/users", payload, authHeader);
                alert("New user created successfully!");
            }

            fetchUsers();
            resetForm();

            if (setActiveTab) setActiveTab("dashboard");

        } catch (error) {
            console.error("Error saving user:", error);
            alert("Failed to save user details. Check console for details.");
        } finally {
            setSubmitting(false);
        }
    };

    // accept Pending User
    const handleAcceptPending = async (pendingUser) => {
        try {
            const userId = pendingUser.userId || pendingUser.id;

            await axios.put(
                `http://localhost:8080/api/users/approve/${userId}`,
                {},
                authHeader
            );

            alert(`User ${pendingUser.name} approved successfully!`);

            fetchUsers();
        } catch (error) {
            console.error("Error accepting user:", error);
            alert("Failed to approve user.");
        }
    };

    // Deny Pending User
    const handleDenyPending = async (pendingUser) => {
        if (window.confirm(`Are you sure you want to reject ${pendingUser.name}?`)) {

            try {

                const userId = pendingUser.userId || pendingUser.id;

                await axios.put(
                    `http://localhost:8080/api/users/reject/${userId}`,
                    {},
                    authHeader
                );

                alert(`${pendingUser.name} has been rejected.`);

                fetchUsers();

            } catch (error) {
                console.error("Error rejecting user:", error);
                alert("Failed to reject user.");
            }
        }
    };

    // Delete User
    const handleDelete = async (user) => {
        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
            try {
                await axios.delete(`http://localhost:8080/api/users/${user.userId || user.id}`, authHeader);
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };

    const handleEdit = (user) => {
        setFormData({
            user_id: user.userId || user.id,
            name: user.name || "",
            email: user.email || "",
            password: "",
            phone: user.phone || "",
            department: user.department || "",
            role: user.role || "ROLE_USER"
        });
        setEditMode(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ user_id: null, name: "", email: "", password: "", phone: "", department: "", role: "ROLE_USER" });
        setEditMode(false);
        setShowModal(false);
    };

    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === "ROLE_ADMIN").length;
    const purchaseCount = users.filter(u => u.role === "ROLE_PURCHASE_OFFICER").length;
    const financeCount = users.filter(u => u.role === "ROLE_FINANCE_OFFICER").length;

    // ==========================================
    // VIEW 1: ADD NEW USER FORM
    // ==========================================
    if (activeTab === "add-user") {
        return (
            <div className="p-4">
                <div className="card shadow-sm border-0 rounded-3 overflow-hidden">

                    {/* BLUE HEADER BAR - IDENTICAL TO IMAGE 1 */}
                    <div
                        className="p-3 d-flex align-items-center justify-content-between text-white"
                        style={{ backgroundColor: "#0d6efd" }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <FaUserPlus size={22} />
                            <h4 className="fw-bold m-0" style={{ fontSize: "1.3rem" }}>
                                Add New User
                            </h4>
                        </div>

                        <button
                            type="button"
                            className="btn bg-white text-dark border-0 fw-semibold px-3 py-1 d-flex align-items-center gap-2 shadow-sm"
                            style={{ borderRadius: "6px", fontSize: "0.9rem", width: "fit-content" }}
                            onClick={() => setActiveTab && setActiveTab("dashboard")}
                        >
                            <FaArrowLeft size={14} /> Back to List
                        </button>
                    </div>

                    {/* FORM BODY */}
                    <div className="card-body p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Full Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Email Address *</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="john@company.com"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Password *</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">User Role *</label>
                                    <select
                                        className="form-select"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="ROLE_ADMIN">ADMIN</option>
                                        <option value="ROLE_PURCHASE_OFFICER">PURCHASE OFFICER</option>
                                        <option value="ROLE_FINANCE_OFFICER">FINANCE OFFICER</option>
                                        <option value="ROLE_USER">EMPLOYEE / USER</option>
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Phone</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="9876543210"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Department</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        placeholder="IT / Finance / Procurement"
                                    />
                                </div>
                            </div>

                            <hr className="my-4" />

                            {/* BOTTOM BUTTONS - MATCHING IMAGE 1 */}
                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary px-5 py-2 fw-semibold"
                                    style={{ width: "48%" }}
                                    onClick={() => setActiveTab && setActiveTab("dashboard")}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary px-5 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                    style={{ width: "48%" }}
                                    disabled={submitting}
                                >
                                    <FaSave /> {submitting ? "Saving..." : "Save User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // VIEW 2: USER MANAGEMENT TABLE & METRICS
    // ==========================================
    return (
        <div className="p-4 position-relative">

            {/* NOTIFICATION BELL ICON IN THE RIGHT CORNER */}
            <div className="d-flex justify-content-end mb-3 position-relative">
                <div className="position-relative">
                    <button
                        className="btn btn-light border position-relative rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                        style={{ width: "45px", height: "45px" }}
                        onClick={() => setShowNotifications(!showNotifications)}
                        title="Registration Notifications"
                    >
                        <FaBell size={20} className="text-secondary" />
                        {pendingUsers.length > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {pendingUsers.length}
                            </span>
                        )}
                    </button>

                    {/* DROPDOWN NOTIFICATION PANEL */}
                    {showNotifications && (
                        <div
                            className="card shadow-lg border-0 position-absolute end-0 mt-2 p-3 bg-white"
                            style={{ width: "380px", zIndex: 1050, borderRadius: "10px" }}
                        >
                            <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
                                <h6 className="fw-bold m-0 text-dark">Registration Requests</h6>
                                <button
                                    className="btn btn-sm text-muted p-0 border-0"
                                    onClick={() => setShowNotifications(false)}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {pendingUsers.length === 0 ? (
                                <p className="text-muted small text-center my-3">No new registration requests.</p>
                            ) : (
                                <div className="d-flex flex-column gap-3" style={{ maxHeight: "350px", overflowY: "auto" }}>
                                    {pendingUsers.map((pUser, idx) => (
                                        <div key={pUser.userId || pUser.id || idx} className="p-2 border rounded bg-light">
                                            <div className="mb-1">
                                                <strong className="text-primary">{pUser.name}</strong> wants to register.
                                            </div>
                                            <div className="small text-muted mb-2">
                                                <div><strong>Email:</strong> {pUser.email}</div>
                                                <div><strong>Dept:</strong> {pUser.department || "N/A"}</div>
                                                <div><strong>Role:</strong> {pUser.role ? pUser.role.replace("ROLE_", "") : "USER"}</div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-success btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                                                    onClick={() => handleAcceptPending(pUser)}
                                                >
                                                    <FaCheck size={12} /> Accept
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                                                    onClick={() => handleDenyPending(pUser)}
                                                >
                                                    <FaBan size={12} /> Deny
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Metric Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="metric-card d-flex align-items-center justify-content-between">
                        <div>
                            <h6>Total Users</h6>
                            <h3>{totalUsers}</h3>
                        </div>
                        <FaUsers size={28} className="text-primary opacity-50" />
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="metric-card d-flex align-items-center justify-content-between">
                        <div>
                            <h6>Admins</h6>
                            <h3>{adminCount}</h3>
                        </div>
                        <FaUserShield size={28} className="text-danger opacity-50" />
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="metric-card d-flex align-items-center justify-content-between">
                        <div>
                            <h6>Purchase Officers</h6>
                            <h3>{purchaseCount}</h3>
                        </div>
                        <FaUserTie size={28} className="text-warning opacity-50" />
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="metric-card d-flex align-items-center justify-content-between">
                        <div>
                            <h6>Finance Officers</h6>
                            <h3>{financeCount}</h3>
                        </div>
                        <FaUserCog size={28} className="text-success opacity-50" />
                    </div>
                </div>
            </div>

            {/* User Management Table */}
            <div className="card shadow-sm border-0 p-4">
                <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom">
                    <div>
                        <h4 className="fw-bold m-0 text-dark">User Management</h4>
                        <small className="text-muted">Manage system access, roles, and employee records</small>
                    </div>
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 fw-semibold"
                        onClick={() => setActiveTab ? setActiveTab("add-user") : setShowModal(true)}
                    >
                        <FaUserPlus /> Add New User
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-4">Loading user records...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: "80px" }}>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Department</th>
                                    <th>Role</th>
                                    <th style={{ width: "120px" }} className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, index) => {
                                    const displayId = u.userId || u.id || index + 1;
                                    return (
                                        <tr key={displayId}>
                                            <td className="fw-bold text-secondary">{displayId}</td>
                                            <td className="fw-semibold">{u.name}</td>
                                            <td>{u.email}</td>
                                            <td>{u.phone || "N/A"}</td>
                                            <td>{u.department || "N/A"}</td>
                                            <td>
                                                <span className={`badge ${u.role === "ROLE_ADMIN" ? "bg-dark" :
                                                    u.role === "ROLE_PURCHASE_OFFICER" ? "bg-warning text-dark" :
                                                        u.role === "ROLE_FINANCE_OFFICER" ? "bg-info text-dark" : "bg-secondary"
                                                    }`}>
                                                    {u.role ? u.role.replace("ROLE_", "") : "USER"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-warning d-flex align-items-center justify-content-center"
                                                        style={{ width: "32px", height: "32px" }}
                                                        onClick={() => handleEdit(u)}
                                                        title="Edit User"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                                                        style={{ width: "32px", height: "32px" }}
                                                        onClick={() => handleDelete(u)}
                                                        title="Delete User"
                                                    >
                                                        <FaTrash />
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

            {/* Modal for Edit User */}
            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header d-flex justify-content-between align-items-center border-0 pb-0">
                                <h4 className="modal-title fw-bold text-dark m-0">Edit User Details</h4>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{
                                        backgroundColor: "#6b52ed",
                                        color: "#ffffff",
                                        border: "none",
                                        borderRadius: "8px",
                                        width: "32px",
                                        height: "32px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer"
                                    }}
                                >
                                    <FaTimes size={16} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Full Name</label>
                                        <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Email Address</label>
                                        <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Password</label>
                                        <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} />
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Phone</label>
                                            <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Department</label>
                                            <input type="text" className="form-control" name="department" value={formData.department} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">User Role</label>
                                        <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
                                            <option value="ROLE_ADMIN">ADMIN</option>
                                            <option value="ROLE_PURCHASE_OFFICER">PURCHASE OFFICER</option>
                                            <option value="ROLE_FINANCE_OFFICER">FINANCE OFFICER</option>
                                            <option value="ROLE_USER">EMPLOYEE / USER</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light">
                                    <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? "Updating..." : "Update User"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
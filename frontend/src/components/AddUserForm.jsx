import React, { useState } from "react";
import { FaUserPlus, FaSave, FaArrowLeft } from "react-icons/fa";

export default function AddUserForm({ onCancel }) {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        role: "ROLE_USER",
        status: "Active",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // TODO: Replace with your actual API endpoint
            // await axios.post("/api/users", formData);
            console.log("Saving user:", formData);

            setMessage({ type: "success", text: "User created successfully!" });

            // Optional: Navigate back to the user list after saving
            setTimeout(() => {
                if (onCancel) onCancel();
            }, 1500);
        } catch (err) {
            setMessage({ type: "danger", text: "Failed to create user." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card border-0 shadow-sm my-3">
            {/* Form Header */}
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                    <FaUserPlus /> Add New User
                </h5>
                {onCancel && (
                    <button className="btn btn-sm btn-light d-flex align-items-center gap-1" onClick={onCancel}>
                        <FaArrowLeft /> Back to Users List
                    </button>
                )}
            </div>

            {/* Form Body */}
            <div className="card-body p-4">
                {message && (
                    <div className={`alert alert-${message.type} mb-4`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Username *</label>
                            <input
                                type="text"
                                className="form-control"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="johndoe"
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-bold">Email Address *</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-bold">Role *</label>
                            <select
                                className="form-select"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="ROLE_USER">Standard User</option>
                                <option value="ROLE_ADMIN">Admin</option>
                                <option value="ROLE_MANAGER">Manager</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-bold">Status *</label>
                            <select
                                className="form-select"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="col-md-12">
                            <label className="form-label fw-bold">Password *</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <hr className="my-4" />

                    <div className="d-flex justify-content-end gap-2">
                        {onCancel && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={onCancel}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="btn btn-primary d-flex align-items-center gap-2"
                            disabled={loading}
                        >
                            <FaSave /> {loading ? "Saving..." : "Save User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
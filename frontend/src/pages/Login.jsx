import React, { useState } from "react";
import "../css/Login.css";
import { FaUserAlt, FaLock, FaEnvelope, FaPhone, FaBuilding, FaUserTag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
    const [isRegistering, setIsRegistering] = useState(false);

    // Login Form State
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    // Register Form State (matching screenshot fields)
    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        password: "",
        role: "ROLE_USER",
        phone: "",
        department: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const navigate = useNavigate();

    const handleLoginChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value,
        });
        if (errorMessage) setErrorMessage("");
    };

    const handleRegisterChange = (e) => {
        setRegisterData({
            ...registerData,
            [e.target.name]: e.target.value,
        });
        if (errorMessage) setErrorMessage("");
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await axios.post("http://localhost:8080/api/auth/login", loginData);
            const { token, id, name, email, role } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify({ id, name, email, role }));

            navigate("/dashboard");
        } catch (error) {
            console.error("Login failed:", error);
            if (error.response?.status === 403) {
                setErrorMessage(error.response.data);
            } else if (error.response && error.response.status === 403) {
                setErrorMessage("Access denied. Account may be pending approval.");
            } else {
                setErrorMessage("Server error or invalid credentials. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            // Adjust endpoint route if your backend registration route differs (e.g., /api/auth/register or /api/users)
            await axios.post(
                "http://localhost:8080/api/users",
                registerData
            );

            alert(
                "Registration request submitted successfully!\n\nYour request has been sent to the administrator.\nPlease wait until your account is approved before logging in."
            );
            setTimeout(() => {
                setIsRegistering(false);
                setSuccessMessage("");
            }, 3500);
        } catch (error) {
            console.error("Registration failed:", error);
            const msg = error.response?.data?.message || error.response?.data || "Registration failed. Please try again.";
            setErrorMessage(typeof msg === 'string' ? msg : "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-left">
                <h1>Procure-X</h1>
                <h3>Smart Procurement Management System</h3>
                <p>
                    Manage Purchase Requisitions, Vendors,
                    Purchase Orders, Quotations, Invoices
                    and Payments efficiently.
                </p>
            </div>

            <div className="login-right">
                <div className="login-card" style={{ width: isRegistering ? "520px" : "400px", transition: "width 0.3s ease" }}>

                    {/* Error / Success Banners */}
                    {errorMessage && (
                        <div style={{ color: "#d9534f", marginBottom: "15px", fontSize: "14px", textAlign: "center" }}>
                            {errorMessage}
                        </div>
                    )}
                    {successMessage && (
                        <div style={{ color: "#28a745", marginBottom: "15px", fontSize: "14px", textAlign: "center", fontWeight: "600" }}>
                            {successMessage}
                        </div>
                    )}

                    {!isRegistering ? (
                        /* ================= LOGIN VIEW ================= */
                        <>
                            <h2>Welcome Back</h2>
                            <p>Login to continue</p>

                            <form onSubmit={handleLoginSubmit}>
                                <div className="input-box">
                                    <FaUserAlt />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        name="email"
                                        value={loginData.email}
                                        onChange={handleLoginChange}
                                        required
                                    />
                                </div>

                                <div className="input-box">
                                    <FaLock />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        name="password"
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        required
                                    />
                                </div>

                                <button type="submit" disabled={loading}>
                                    {loading ? "Logging in..." : "Login"}
                                </button>
                            </form>

                            <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px" }}>
                                <span className="text-secondary">Don't have an account? </span>
                                <button
                                    type="button"
                                    className="btn btn-link p-0 fw-bold"
                                    style={{ textDecoration: "none", color: "#0d6efd" }}
                                    onClick={() => {
                                        setIsRegistering(true);
                                        setErrorMessage("");
                                    }}
                                >
                                    Register here
                                </button>
                            </div>
                        </>
                    ) : (
                        /* ================= REGISTRATION VIEW ================= */
                        <>
                            <h2>Create Account</h2>
                            <p>Fill in the details to request access</p>

                            <form onSubmit={handleRegisterSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary" style={{ fontSize: "12px" }}>Full Name *</label>
                                        <div className="input-box m-0">
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                name="name"
                                                value={registerData.name}
                                                onChange={handleRegisterChange}
                                                required
                                                className="form-control"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary" style={{ fontSize: "12px" }}>Email Address *</label>
                                        <div className="input-box m-0">
                                            <input
                                                type="email"
                                                placeholder="john@company.com"
                                                name="email"
                                                value={registerData.email}
                                                onChange={handleRegisterChange}
                                                required
                                                className="form-control"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary" style={{ fontSize: "12px" }}>Password *</label>
                                        <div className="input-box m-0">
                                            <input
                                                type="password"
                                                placeholder="********"
                                                name="password"
                                                value={registerData.password}
                                                onChange={handleRegisterChange}
                                                required
                                                className="form-control"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary" style={{ fontSize: "12px" }}>User Role *</label>
                                        <div className="input-box m-0">
                                            <select
                                                name="role"
                                                value={registerData.role}
                                                onChange={handleRegisterChange}
                                                className="form-select"
                                                style={{ height: "42px", borderRadius: "8px", border: "1px solid #ccc" }}
                                            >
                                                <option value="ROLE_USER">Employee / User</option>
                                                <option value="ROLE_PURCHASE_OFFICER">Purchase Officer</option>
                                                <option value="ROLE_FINANCE_OFFICER">Finance Officer</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary" style={{ fontSize: "12px" }}>Phone</label>
                                        <div className="input-box m-0">
                                            <input
                                                type="text"
                                                placeholder="9876543210"
                                                name="phone"
                                                value={registerData.phone}
                                                onChange={handleRegisterChange}
                                                className="form-control"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-medium text-secondary" style={{ fontSize: "12px" }}>Department</label>
                                        <div className="input-box m-0">
                                            <input
                                                type="text"
                                                placeholder="IT / Finance / Procurement"
                                                name="department"
                                                value={registerData.department}
                                                onChange={handleRegisterChange}
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-4 gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-secondary w-50"
                                        onClick={() => {
                                            setIsRegistering(false);
                                            setErrorMessage("");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary w-50"
                                        style={{ height: "40px" }}
                                    >
                                        {loading ? "Submitting..." : "Save User"}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}

export default Login;
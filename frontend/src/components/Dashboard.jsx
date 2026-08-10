import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminDashboard from "./roles/AdminDashboard";
import FinanceDashboard from "./roles/FinanceDashboard";
import PurchaseDashboard from "./roles/PurchaseDashboard";
import EmployeeDashboard from "./roles/EmployeeDashboard";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!token || !storedUser) {
            navigate("/login");
            return;
        }

        const loggedInUser = JSON.parse(storedUser);

        setUser(loggedInUser);

        switch (loggedInUser.role) {

            case "ROLE_ADMIN":
                setActiveTab("dashboard");
                break;

            case "ROLE_PURCHASE_OFFICER":
                setActiveTab("dashboard");
                break;

            case "ROLE_FINANCE_OFFICER":
                setActiveTab("invoices");
                break;

            case "ROLE_USER":
                setActiveTab("requisitions");
                break;

            default:
                setActiveTab("dashboard");
        }

    }, [navigate]);

    if (!user) return <div className="p-4">Loading dashboard...</div>;

    return (
        <div className="app-container">
            {/* Left Sidebar filtered by user.role */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={user.role} />

            {/* Main Area */}
            <div className="main-content">
                {/* Top Navbar */}
                <div className="top-navbar">
                    <h5 className="m-0 text-secondary">Procurement Management System</h5>
                    <span className="text-muted">
                        Welcome, <strong>{user.name || "User"}</strong> ({user.role.replace("ROLE_", "")})
                    </span>
                </div>

                {/* Dashboard Content Area */}
                <div className="content-area">
                    {/* ADMIN: Pass activeTab to toggle between User List and Add User Form */}
                    {user.role === "ROLE_ADMIN" && <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />}

                    {/* PURCHASE OFFICER */}
                    {user.role === "ROLE_PURCHASE_OFFICER" && <PurchaseDashboard activeTab={activeTab} />}

                    {/* FINANCE OFFICER */}
                    {user.role === "ROLE_FINANCE_OFFICER" && <FinanceDashboard activeTab={activeTab} />}

                    {/* STANDARD EMPLOYEE */}
                    {user.role === "ROLE_USER" && <EmployeeDashboard user={user} />}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Sidebar.css";
import {
    FaHome, FaUserPlus, FaBoxes, FaBuilding, FaClipboardList,
    FaFileInvoice, FaShoppingCart, FaReceipt,
    FaMoneyBillWave, FaSignOutAlt
} from "react-icons/fa";

function Sidebar({ activeTab, setActiveTab, role, onOpenAddUser }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const isUser = role === "ROLE_USER" || role === "USER";
    const isFinance = role === "ROLE_FINANCE_OFFICER";
    const isRequisitionActive = activeTab === "requisitions" || activeTab === "requisition" || isUser;

    return (
        <div className="sidebar">
            <div className="sidebar-brand">Smart ERP</div>
            <ul className="sidebar-menu">

                {/* 1. Dashboard Main View (Hidden for standard USER) */}
                {!isUser && !isFinance && (
                    <li
                        className={`sidebar-item ${activeTab === "dashboard" ? "active" : ""}`}
                        onClick={() => setActiveTab("dashboard")}
                    >
                        <FaHome /> Dashboard
                    </li>
                )}

                {/* 2. ADMIN ONLY - Add New User Direct Link */}
                {role === "ROLE_ADMIN" && (
                    <li
                        className={`sidebar-item ${activeTab === "add-user" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("add-user");
                            if (onOpenAddUser) onOpenAddUser();
                        }}
                    >
                        <FaUserPlus /> Add New User
                    </li>
                )}

                {/* 3. PURCHASE OFFICER ONLY */}
                {role === "ROLE_PURCHASE_OFFICER" && (
                    <>
                        <li className={`sidebar-item ${activeTab === "items" ? "active" : ""}`} onClick={() => setActiveTab("items")}>
                            <FaBoxes /> Items
                        </li>
                        <li className={`sidebar-item ${activeTab === "vendors" ? "active" : ""}`} onClick={() => setActiveTab("vendors")}>
                            <FaBuilding /> Vendors
                        </li>
                        <li className={`sidebar-item ${activeTab === "quotations" ? "active" : ""}`} onClick={() => setActiveTab("quotations")}>
                            <FaFileInvoice /> Quotations
                        </li>
                        <li className={`sidebar-item ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
                            <FaShoppingCart /> Purchase Orders
                        </li>
                    </>
                )}

                {/* 4. REQUISITIONS (Always active for ROLE_USER) */}
                {(isUser || role === "ROLE_PURCHASE_OFFICER") && (
                    <li
                        className={`sidebar-item ${isRequisitionActive ? "active" : ""}`}
                        onClick={() => setActiveTab("requisitions")}
                    >
                        <FaClipboardList /> Purchase Requisition
                    </li>
                )}

                {/* 5. FINANCE OFFICER ONLY */}
                {role === "ROLE_FINANCE_OFFICER" && (
                    <>
                        <li className={`sidebar-item ${activeTab === "invoices" ? "active" : ""}`} onClick={() => setActiveTab("invoices")}>
                            <FaReceipt /> Invoices
                        </li>
                        <li className={`sidebar-item ${activeTab === "payments" ? "active" : ""}`} onClick={() => setActiveTab("payments")}>
                            <FaMoneyBillWave /> Payments
                        </li>
                    </>
                )}

                {/* Logout Button */}
                <li className="sidebar-item mt-4" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                </li>
            </ul>
        </div>
    );
}

export default Sidebar;
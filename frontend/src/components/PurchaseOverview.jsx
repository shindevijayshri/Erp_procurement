import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080/api";

export default function PurchaseOverview() {
    const [stats, setStats] = useState({
        totalPR: 0,
        vendors: 0,
        items: 0,
        purchaseOrders: 0,
        pendingPR: 0,
        quotations: 0,
        invoices: 0,
        payments: "₹0",
    });
    const [loading, setLoading] = useState(true);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        return { headers: { Authorization: token ? `Bearer ${token}` : "" } };
    };

    const fetchDashboardStats = useCallback(async () => {
        setLoading(true);
        try {
            const headers = getAuthHeaders();

            // Executing backend calls using correct endpoints (/api/orders for POs)
            const [prRes, vendorRes, itemRes, poRes, quoteRes, invoiceRes] = await Promise.allSettled([
                axios.get(`${API_BASE}/requisitions`, headers),
                axios.get(`${API_BASE}/vendors`, headers),
                axios.get(`${API_BASE}/items`, headers),
                axios.get(`${API_BASE}/orders`, headers), // Corrected endpoint for POs
                axios.get(`${API_BASE}/quotations`, headers),
                axios.get(`${API_BASE}/invoices`, headers),
            ]);

            // Safely parse array responses
            const getData = (res) => (res.status === "fulfilled" && Array.isArray(res.value.data) ? res.value.data : []);

            const prList = getData(prRes);
            const vendorList = getData(vendorRes);
            const itemList = getData(itemRes);
            const poList = getData(poRes);
            const quoteList = getData(quoteRes);
            const invoiceList = getData(invoiceRes);

            // Calculate pending PRs
            const pendingPRCount = prList.filter(
                (pr) => pr.status && pr.status.toUpperCase() === "PENDING"
            ).length;

            // Calculate total payment value across all Purchase Orders
            const totalPoPaymentsSum = poList.reduce((sum, po) => {
                // Extracts price/amount/totalAmount from PO object or nested quotation
                const poAmount =
                    po.totalAmount ||
                    po.amount ||
                    po.totalPrice ||
                    po.quotation?.amount ||
                    0;
                return sum + Number(poAmount);
            }, 0);

            // Format total PO payment value (e.g., ₹4.5 Lakh or standard rupee representation)
            let formattedPayments = "₹0";
            if (totalPoPaymentsSum >= 100000) {
                formattedPayments = `₹${(totalPoPaymentsSum / 100000).toFixed(1)} Lakh`;
            } else if (totalPoPaymentsSum > 0) {
                formattedPayments = `₹${totalPoPaymentsSum.toLocaleString('en-IN')}`;
            }

            setStats({
                totalPR: prList.length,
                vendors: vendorList.length,
                items: itemList.length,
                purchaseOrders: poList.length,
                pendingPR: pendingPRCount,
                quotations: quoteList.length,
                invoices: invoiceList.length,
                payments: formattedPayments,
            });
        } catch (err) {
            console.error("Failed to load overview data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    const cardStyle = {
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        border: "1px solid #eaeaea",
        backgroundColor: "#ffffff",
        minHeight: "110px"
    };

    return (
        <div>
            <h2 className="fw-semibold mb-4" style={{ color: "#2c3038", fontSize: "1.75rem" }}>
                Dashboard
            </h2>

            {/* Row 1 */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="p-3" style={cardStyle}>
                        <span className="text-secondary small">Total PR</span>
                        <h2 className="fw-bold my-2" style={{ color: "#5b42f3" }}>
                            {loading ? "..." : stats.totalPR}
                        </h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="p-3" style={cardStyle}>
                        <span className="text-secondary small">Vendors</span>
                        <h2 className="fw-bold my-2" style={{ color: "#5b42f3" }}>
                            {loading ? "..." : stats.vendors}
                        </h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="p-3" style={cardStyle}>
                        <span className="text-secondary small">Items</span>
                        <h2 className="fw-bold my-2" style={{ color: "#5b42f3" }}>
                            {loading ? "..." : stats.items}
                        </h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="p-3" style={cardStyle}>
                        <span className="text-secondary small">Purchase Orders</span>
                        <h2 className="fw-bold my-2" style={{ color: "#5b42f3" }}>
                            {loading ? "..." : stats.purchaseOrders}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Row 2 */}
            <div className="row g-4">
                <div className="col-md-3">
                    <div className="p-3" style={cardStyle}>
                        <span className="text-secondary small">Pending PR</span>
                        <h2 className="fw-bold my-2" style={{ color: "#5b42f3" }}>
                            {loading ? "..." : stats.pendingPR}
                        </h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="p-3" style={cardStyle}>
                        <span className="text-secondary small">Quotations</span>
                        <h2 className="fw-bold my-2" style={{ color: "#5b42f3" }}>
                            {loading ? "..." : stats.quotations}
                        </h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="p-3" style={cardStyle}>
                        <span className="text-secondary small">Invoices</span>
                        <h2 className="fw-bold my-2" style={{ color: "#5b42f3" }}>
                            {loading ? "..." : stats.invoices}
                        </h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="p-3" style={cardStyle}>
                        <span className="text-secondary small">Payments</span>
                        <h2 className="fw-bold my-2" style={{ color: "#5b42f3" }}>
                            {loading ? "..." : stats.payments}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
}
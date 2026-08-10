import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCreditCard, FaSearch } from "react-icons/fa";

function Payments() {
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [payRes, invRes] = await Promise.all([
                axios.get("http://localhost:8081/api/payments/all", { headers }),
                axios.get("http://localhost:8080/api/invoices", { headers })
            ]);

            setPayments(payRes.data);
            setInvoices(invRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const getInvoiceNo = (invoiceId) => {
        const found = invoices.find(inv => (inv.invoiceId || inv.id) === invoiceId);
        return found ? found.invoiceNo : `INV-0${invoiceId}`;
    };

    const filteredPayments = payments.filter((p) => {
        const invNo = getInvoiceNo(p.invoiceId);
        return (
            p.razorpayOrderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(p.paymentId || p.id).includes(searchQuery) ||
            invNo.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className="container-fluid p-4">
            <div className="card shadow-sm border-0">
                <div
                    className="p-3 d-flex align-items-center justify-content-between text-white"
                    style={{ backgroundColor: "#0d6efd" }}
                >
                    <div className="d-flex align-items-center gap-2">
                        <FaCreditCard size={22} />
                        <h4 className="fw-bold m-0" style={{ fontSize: "1.25rem" }}>
                            Payment Transactions
                        </h4>
                    </div>
                </div>

                <div className="card-body p-4">
                    <div className="input-group mb-4" style={{ maxWidth: "400px" }}>
                        <span className="input-group-text bg-light border-end-0">
                            <FaSearch size={14} className="text-muted" />
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0 bg-light"
                            placeholder="Search by Payment ID, Invoice No, Order ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr className="text-secondary fw-semibold">
                                    <th>Payment ID</th>
                                    <th>Invoice No</th>
                                    <th>Razorpay Order ID</th>
                                    <th>Payment Date</th>
                                    <th>Amount (₹)</th>
                                    <th className="text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-4">
                                            No payment records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((p) => {
                                        const paymentIdFormatted = `PAY-${String(p.paymentId || p.id).padStart(3, '0')}`;
                                        const invoiceNo = getInvoiceNo(p.invoiceId);
                                        const isSuccess = p.status?.toUpperCase() === "SUCCESS";

                                        return (
                                            <tr key={p.paymentId || p.id}>
                                                <td className="fw-bold">{paymentIdFormatted}</td>
                                                <td>{invoiceNo}</td>
                                                <td className="text-muted small font-monospace">{p.razorpayOrderId}</td>
                                                <td>{p.paymentDate}</td>
                                                <td className="fw-bold text-success">₹{Number(p.amount || 0).toFixed(2)}</td>
                                                <td className="text-center">
                                                    <span
                                                        className={`badge ${isSuccess ? "bg-success" : "bg-warning text-dark"
                                                            }`}
                                                    >
                                                        {p.status}
                                                    </span>
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
        </div>
    );
}

export default Payments;
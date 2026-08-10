import React, { useState, useEffect } from "react";
import axios from "axios";
import InvoiceList from "./InvoiceList";
import InvoiceForm from "./InvoiceForm";

function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [currentView, setCurrentView] = useState("list"); // "list" or "form"
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        invoiceNo: "",
        invoiceDate: new Date().toISOString().split("T")[0],
        poId: "",
        amount: ""
    });

    useEffect(() => {
        fetchData();

        // Dynamically load Razorpay checkout script for frontend popups
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [invRes, poRes] = await Promise.all([
                axios.get("http://localhost:8080/api/invoices", { headers }),
                axios.get("http://localhost:8080/api/orders", { headers })
            ]);

            const fetchedInvoices = invRes.data;
            const fetchedOrders = poRes.data;

            const invoicedPoIds = fetchedInvoices
                .filter(inv => {
                    const invId = inv.id || inv.invoiceId;
                    return invId !== editingId;
                })
                .map(inv => inv.purchaseOrder?.id || inv.purchaseOrder?.poId)
                .filter(Boolean);

            const availableOrders = fetchedOrders.filter(
                po => !invoicedPoIds.includes(po.id || po.poId)
            );

            setInvoices(fetchedInvoices);
            setPurchaseOrders(availableOrders);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // --- Razorpay Payment Integration Handler with Verification ---
    const handlePay = async (invoice) => {
        const invoiceId = invoice.invoiceId || invoice.id;
        try {
            // 1. Call Payment Microservice on port 8081 to generate Razorpay order
            const response = await axios.post(`http://localhost:8081/api/payments/create-order/${invoiceId}`);
            const paymentData = response.data;

            // 2. Configure Razorpay modal properties
            const options = {
                key: "rzp_test_TL9eReaPyrWJqh", // Your Key ID
                amount: paymentData.amount * 100, // Amount in paise
                currency: "INR",
                name: "ERP System",
                description: `Payment for Invoice #${invoice.invoiceNo}`,
                order_id: paymentData.razorpayOrderId, // Order ID from payment-service
                handler: async function (response) {
                    try {
                        // 3. Send payment signature data back to backend for verification
                        const verificationPayload = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        };

                        await axios.post(
                            "http://localhost:8081/api/payments/verify-payment",
                            verificationPayload
                        );

                        // 4. Directly update the invoice status on port 8080 to PAID
                        const token = localStorage.getItem("token");
                        const headers = { Authorization: `Bearer ${token}` };
                        await axios.put(
                            `http://localhost:8080/api/invoices/${invoiceId}/status?status=PAID`,
                            null,
                            { headers }
                        );

                        alert("Payment successful and verified!");
                        fetchData(); // Refresh list to reflect updated 'PAID' status and remove button
                    } catch (verifyError) {
                        console.error("Verification error:", verifyError);
                        alert("Payment signature verification or status update failed!");
                    }
                },
                prefill: {
                    name: "Client Name",
                    email: "client@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#0d6efd"
                }
            };

            // 5. Open Razorpay Popup
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Payment error:", error);
            alert("Could not initialize payment. Ensure the payment microservice is running on port 8081.");
        }
    };

    const handleCreateClick = () => {
        setEditingId(null);
        fetchData();
        const nextInvNum = `INV-${String(invoices.length + 1).padStart(3, "0")}`;
        setFormData({
            invoiceNo: nextInvNum,
            invoiceDate: new Date().toISOString().split("T")[0],
            poId: "",
            amount: ""
        });
        setCurrentView("form");
    };

    const handleEditClick = (invoice) => {
        setEditingId(invoice.id || invoice.invoiceId);
        setFormData({
            invoiceNo: invoice.invoiceNo,
            invoiceDate: invoice.invoiceDate,
            poId: invoice.purchaseOrder?.id || invoice.purchaseOrder?.poId || "",
            amount: invoice.amount
        });
        setCurrentView("form");
    };

    const handleCancel = () => {
        setCurrentView("list");
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const payload = {
                invoiceNo: formData.invoiceNo,
                invoiceDate: formData.invoiceDate,
                amount: Number(formData.amount)
            };

            if (editingId) {
                await axios.put(
                    `http://localhost:8080/api/invoices/${editingId}?poId=${formData.poId}`,
                    payload,
                    { headers }
                );
            } else {
                await axios.post(
                    `http://localhost:8080/api/invoices?poId=${formData.poId}`,
                    payload,
                    { headers }
                );
            }

            fetchData();
            setCurrentView("list");
            setEditingId(null);
        } catch (error) {
            console.error("Error saving invoice:", error);
            alert("Failed to save invoice.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this invoice?")) {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                await axios.delete(`http://localhost:8080/api/invoices/${id}`, { headers });
                fetchData();
            } catch (error) {
                console.error("Error deleting invoice:", error);
            }
        }
    };

    const filteredInvoices = invoices.filter((inv) =>
        inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.purchaseOrder?.poNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container-fluid p-4">
            {currentView === "list" ? (
                <InvoiceList
                    invoices={filteredInvoices}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onCreateClick={handleCreateClick}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                    onPay={handlePay}
                />
            ) : (
                <InvoiceForm
                    formData={formData}
                    setFormData={setFormData}
                    purchaseOrders={purchaseOrders}
                    editingId={editingId}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}

export default Invoices;
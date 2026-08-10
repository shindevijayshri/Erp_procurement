import React, { useState, useEffect } from "react";

import axios from "axios";

import POList from "./POList";

import POForm from "./POForm";



function PurchaseOrders() {

    const [purchaseOrders, setPurchaseOrders] = useState([]);

    const [vendors, setVendors] = useState([]);

    const [quotationsList, setQuotationsList] = useState([]);

    const [itemsList, setItemsList] = useState([]);



    const [view, setView] = useState("list"); // 'list' or 'form'

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);



    const initialFormState = {

        poNumber: "",

        poDate: new Date().toISOString().split("T")[0],

        vendorId: "",

        quotationId: "",

        status: "ISSUED",

        amount: 0,

        poItems: [{ itemId: "", quantity: 1, price: 0 }]

    };



    const [formData, setFormData] = useState(initialFormState);



    // Get Auth Token if stored in localStorage

    const getAuthHeaders = () => {

        const token = localStorage.getItem("token") || localStorage.getItem("jwt");

        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    };



    useEffect(() => {

        fetchInitialData();

    }, []);



    const fetchInitialData = async () => {

        setLoading(true);

        const config = getAuthHeaders();



        try {

            // Distinct and correct REST endpoints

            const [poRes, vendorRes, quoteRes, itemRes] = await Promise.all([

                axios.get("http://localhost:8080/api/orders", config).catch(err => {

                    console.error("Orders Fetch Error:", err);

                    return null;

                }),

                axios.get("http://localhost:8080/api/vendors", config).catch(err => {

                    console.error("Vendors Fetch Error:", err);

                    return null;

                }),

                axios.get("http://localhost:8080/api/quotations", config).catch(err => {

                    console.error("Quotations Fetch Error:", err);

                    return null;

                }),

                axios.get("http://localhost:8080/api/items", config).catch(err => {

                    console.error("Items Fetch Error:", err);

                    return null;

                })

            ]);



            const extractArray = (res) => {

                if (!res || !res.data) return [];

                if (Array.isArray(res.data)) return res.data;

                if (Array.isArray(res.data.content)) return res.data.content;

                if (Array.isArray(res.data.data)) return res.data.data;

                return [];

            };



            setPurchaseOrders(extractArray(poRes));

            setVendors(extractArray(vendorRes));

            setQuotationsList(extractArray(quoteRes));

            setItemsList(extractArray(itemRes));

        } catch (error) {

            console.error("Error fetching data:", error);

        } finally {

            setLoading(false);

        }

    };



    const generateNextPONumber = (ordersList) => {

        if (!ordersList || ordersList.length === 0) return "PO001";

        let maxNum = 0;

        ordersList.forEach((po) => {

            const poNumStr = po.poNumber || (po.poId ? `PO${po.poId}` : "");

            const match = poNumStr.match(/\d+/);

            if (match) {

                const num = parseInt(match[0], 10);

                if (num > maxNum) maxNum = num;

            }

        });

        return `PO${String(maxNum + 1).padStart(3, "0")}`;

    };



    const handleOpenAdd = () => {

        setEditingId(null);

        setFormData({

            ...initialFormState,

            poNumber: generateNextPONumber(purchaseOrders),

            poDate: new Date().toISOString().split("T")[0]

        });

        setView("form");

    };
    const handleOpenEdit = (po) => {
        setEditingId(po.poId);

        const vendorId = po.vendor?.vendorId || po.vendorId || po.vendor?.id || "";
        const quotationId = po.quotation?.quotationId || po.quotationId || po.quotation?.id || "";

        let items = [];
        // FIX: Read from 'po.items' (matching the backend entity field name) instead of 'po.poItems'
        const sourceItems = po.items || po.poItems || [];

        if (sourceItems.length > 0) {
            items = sourceItems.map((itm) => ({
                itemId: String(itm.item?.itemId || itm.itemId || itm.item?.id || ""),
                quantity: Number(itm.quantity || 1),
                price: Number(itm.price || 0)
            }));
        } else {
            items = [{ itemId: "", quantity: 1, price: 0 }];
        }

        setFormData({
            poNumber: po.poNumber || `PO${String(po.poId).padStart(3, "0")}`,
            poDate: po.poDate || new Date().toISOString().split("T")[0],
            vendorId: String(vendorId),
            quotationId: String(quotationId),
            status: po.status || "ISSUED",
            amount: po.amount || 0,
            poItems: items
        });
        setView("form");
    };



    const handleDelete = async (id) => {

        if (!window.confirm("Are you sure you want to delete this purchase order?")) return;

        try {

            await axios.delete(`http://localhost:8080/api/orders/${id}`, getAuthHeaders());

            await fetchInitialData();

        } catch (error) {

            console.error("Error deleting purchase order:", error);

            alert("Failed to delete Purchase Order.");

        }

    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            poNumber: formData.poNumber,
            poDate: formData.poDate,
            status: formData.status,
            amount: Number(formData.amount),
            // CHANGE 'poItems' TO 'items' BELOW:
            items: formData.poItems.map((itm) => ({
                item: { itemId: Number(itm.itemId) },
                quantity: Number(itm.quantity),
                price: Number(itm.price)
            }))
        };

        try {
            const config = getAuthHeaders();
            const vId = formData.vendorId;
            const qId = formData.quotationId;

            if (editingId) {
                await axios.put(`http://localhost:8080/api/orders/${editingId}`, payload, config);
            } else {
                await axios.post(
                    `http://localhost:8080/api/orders?vendorId=${vId}&quotationId=${qId}`,
                    payload,
                    config
                );
            }
            await fetchInitialData();
            setView("list");
        } catch (error) {
            console.error("Error saving purchase order:", error?.response?.data || error);
            alert(`Failed to save Purchase Order: ${error?.response?.data?.message || "Please check backend logs"}`);
        }
    };



    return (

        <div className="card border-0 rounded-3 overflow-hidden shadow-sm">

            {view === "list" ? (

                <POList

                    purchaseOrders={purchaseOrders}

                    loading={loading}

                    onAddNew={handleOpenAdd}

                    onEdit={handleOpenEdit}

                    onDelete={handleDelete}

                />

            ) : (

                /* REPLACE YOUR POFORM WITH THIS BELOW: */

                <POForm

                    formData={formData}

                    setFormData={setFormData}

                    vendors={vendors}

                    quotationsList={quotationsList}

                    itemsList={itemsList}

                    purchaseOrders={purchaseOrders} // Pass this so POForm can filter out used quotations

                    editingId={editingId}

                    onSubmit={handleSubmit}

                    onCancel={() => setView("list")}

                />

            )}

        </div>

    );

}



export default PurchaseOrders;


import React, { useState } from "react";

import { FaReceipt, FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";



function POList({ purchaseOrders, loading, onAddNew, onEdit, onDelete }) {

    const [searchTerm, setSearchTerm] = useState("");



    // Filter POs based on search input

    const filteredOrders = purchaseOrders.filter((po) => {

        const poNum = po.poNumber || `PO${String(po.poId || "").padStart(3, "0")}`;

        const vendorName = po.vendor?.vendorName || po.vendorName || "";

        const status = po.status || "";

        const search = searchTerm.toLowerCase();



        return (

            poNum.toLowerCase().includes(search) ||

            vendorName.toLowerCase().includes(search) ||

            status.toLowerCase().includes(search)

        );

    });



    const getStatusBadgeClass = (status) => {

        switch (status?.toUpperCase()) {

            case "DELIVERED":

                return "bg-success";

            case "ISSUED":

                return "bg-primary";

            case "CANCELLED":

                return "bg-danger";

            default:

                return "bg-secondary";

        }

    };



    return (

        <div>

            {/* Header matching Quotations style */}

            <div

                className="p-3 d-flex align-items-center justify-content-between text-white"

                style={{ backgroundColor: "#0d6efd" }}

            >

                <div className="d-flex align-items-center gap-2">

                    <FaReceipt size={22} />

                    <h5 className="fw-bold m-0" style={{ fontSize: "1.2rem" }}>

                        Purchase Orders

                    </h5>

                </div>

                <button

                    type="button"

                    className="btn bg-white text-black fw-semibold px-3 py-1.5 d-flex align-items-center gap-2 shadow-sm border-0"

                    style={{ borderRadius: "6px", fontSize: "0.85rem", width: "auto" }}

                    onClick={onAddNew}

                >

                    <FaPlus size={12} /> Create Purchase Order

                </button>

            </div>



            {/* Content Body */}

            <div className="card-body p-4">

                {/* Search Bar */}

                <div className="mb-4" style={{ maxWidth: "320px" }}>

                    <div className="input-group">

                        <span className="input-group-text bg-light border-end-0">

                            <FaSearch className="text-muted" />

                        </span>

                        <input

                            type="text"

                            className="form-control bg-light border-start-0 ps-0"

                            placeholder="Search POs..."

                            value={searchTerm}

                            onChange={(e) => setSearchTerm(e.target.value)}

                        />

                    </div>

                </div>



                {/* Table */}

                {loading ? (

                    <div className="text-center py-5 text-muted">

                        <div className="spinner-border text-primary me-2" role="status"></div>

                        Loading Purchase Orders...

                    </div>

                ) : filteredOrders.length === 0 ? (

                    <div className="text-center py-5 text-muted fw-semibold">

                        No purchase orders found.

                    </div>

                ) : (

                    <div className="table-responsive">

                        <table className="table table-hover align-middle">

                            <thead className="table-light">

                                <tr className="text-secondary fw-semibold" style={{ fontSize: "0.9rem" }}>

                                    <th>PO Number</th>

                                    <th>PO Date</th>

                                    <th>Vendor</th>

                                    <th>Quotation</th>

                                    <th>Total Amount</th>

                                    <th>Status</th>

                                    <th className="text-center">Actions</th>

                                </tr>

                            </thead>

                            <tbody style={{ fontSize: "0.92rem" }}>

                                {filteredOrders.map((po) => {

                                    const poId = po.poId || po.id;

                                    const poNum = po.poNumber || `PO${String(poId).padStart(3, "0")}`;

                                    const vendorName = po.vendor?.vendorName || po.vendorName || "N/A";

                                    const qId = po.quotation?.quotationId || po.quotationId;

                                    const quoteNum = qId ? `QT${String(qId).padStart(3, "0")}` : "N/A";



                                    return (

                                        <tr key={poId}>

                                            <td>{poNum}</td>

                                            <td>{po.poDate || "N/A"}</td>

                                            <td>{vendorName}</td>

                                            <td>{quoteNum}</td>

                                            <td className="fw-bold text-success">

                                                ₹{Number(po.amount || 0).toLocaleString()}

                                            </td>

                                            <td>

                                                <span

                                                    className={`badge ${getStatusBadgeClass(

                                                        po.status

                                                    )} px-2 py-1`}

                                                    style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}

                                                >

                                                    {po.status || "ISSUED"}

                                                </span>

                                            </td>

                                            <td className="text-center">

                                                <div className="d-flex justify-content-center gap-2">

                                                    <button

                                                        type="button"

                                                        className="btn btn-outline-warning btn-sm d-flex align-items-center justify-content-center"

                                                        title="Edit"

                                                        onClick={() => onEdit(po)}

                                                        style={{

                                                            width: "36px",

                                                            height: "36px",

                                                            borderRadius: "5px",

                                                            padding: 0

                                                        }}

                                                    >

                                                        <FaEdit size={15} />

                                                    </button>



                                                    <button

                                                        type="button"

                                                        className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"

                                                        title="Delete"

                                                        onClick={() => onDelete(poId)}

                                                        style={{

                                                            width: "36px",

                                                            height: "36px",

                                                            borderRadius: "5px",

                                                            padding: 0

                                                        }}

                                                    >

                                                        <FaTrash size={15} />

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

        </div>

    );

}



export default POList;


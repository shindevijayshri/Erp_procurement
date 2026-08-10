import React from "react";
import Invoices from "../finance/Invoices"; // Adjust path if needed
import Payments from "../PaymentList"; // Adjust path based on where you save Payments.jsx

function FinanceDashboard({ activeTab }) {
    return (
        <div className="w-100">
            {activeTab === "invoices" && <Invoices />}

            {activeTab === "payments" && <Payments />}
        </div>
    );
}

export default FinanceDashboard;
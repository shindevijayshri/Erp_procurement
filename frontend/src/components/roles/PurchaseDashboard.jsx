import React from "react";
import PurchaseOverview from "../PurchaseOverview";
import Items from "../Items"; // Imported Items component
import Vendors from "../Vendors";
import PurchaseOrders from "../PurchaseOrders/PurchaseOrders";
import PurchaseRequisitions from "../PurchaseRequisitions";
import QuotationManagement from "../QuotationManagement";

function PurchaseDashboard({ activeTab, loggedInUser }) {
    return (
        <div className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            {/* Dashboard / Overview */}
            {activeTab === "dashboard" && <PurchaseOverview />}

            {/* Items Management */}
            {(activeTab === "items" || activeTab === "item") && <Items />}

            {/* Vendors */}
            {activeTab === "vendors" && <Vendors />}

            {/* Purchase Orders */}
            {activeTab === "orders" && <PurchaseOrders />}

            {/* Quotations */}
            {(activeTab === "quotations" || activeTab === "quotation") && (
                <QuotationManagement loggedInUser={loggedInUser} />
            )}

            {/* Purchase Requisitions */}
            {(activeTab === "requisitions" || activeTab === "requisition") && (
                <PurchaseRequisitions
                    userRole="ROLE_PURCHASE_OFFICER"
                    loggedInUser={loggedInUser}
                />
            )}
        </div>
    );
}

export default PurchaseDashboard;
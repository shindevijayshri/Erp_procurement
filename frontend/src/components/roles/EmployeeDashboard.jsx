import React from "react";
import PurchaseRequisitions from "../PurchaseRequisitions"; // Adjust path if needed

function EmployeeDashboard({ user, loggedInUser }) {
    // Falls back to loggedInUser if user isn't passed directly
    const currentUser = user || loggedInUser;

    return (
        <div className="w-100 p-2">
            <PurchaseRequisitions
                userRole="ROLE_USER"
                loggedInUser={currentUser}
            />
        </div>
    );
}

export default EmployeeDashboard;
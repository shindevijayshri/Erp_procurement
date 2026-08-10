import React, { useState, useEffect } from "react";
import axios from "axios";
import UserPurchaseRequisition from "./purchase/UserPurchaseRequisition";
import OfficerPurchaseRequisition from "./purchase/OfficerPurchaseRequisition";
import PurchaseOfficerRequisitionModal from "../components/PurchaseOfficerRequisitionModal";

const API_BASE_URL = "http://localhost:8080/api/requisitions";

export default function PurchaseRequisitions({ userRole, loggedInUser }) {
    const role = userRole || loggedInUser?.role || "USER";
    const normalizedRole = String(role).toUpperCase().replace("_", " ");
    const isOfficer =
        normalizedRole.includes("OFFICER") || normalizedRole.includes("ADMIN");

    const [requisitions, setRequisitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPR, setSelectedPR] = useState(null);
    const [vendors, setVendors] = useState([]);

    // Helper function to get Authorization Headers with JWT
    const getAuthHeaders = () => {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("jwtToken") ||
            localStorage.getItem("accessToken");
        return {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        };
    };

    // 1. FETCH ALL PRs FROM DATABASE
    const fetchRequisitions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_BASE_URL, getAuthHeaders());
            setRequisitions(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching PRs from backend:", err);
            if (err.response?.status === 403) {
                setError("Access Denied (403): Missing or expired JWT authentication token.");
            } else {
                setError("Failed to fetch requisitions from backend API.");
            }
        } finally {
            setLoading(false);
        }
    };


    const fetchVendors = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8080/api/vendors",
                getAuthHeaders()
            );

            setVendors(response.data);
        } catch (err) {
            console.error("Error fetching vendors:", err);
        }
    };

    useEffect(() => {
        fetchRequisitions();
        fetchVendors();
    }, []);

    // 2. FETCH PR DETAILS & LINE ITEMS (FOR OFFICER MODAL)
    const handleViewPR = async (pr) => {
        try {
            const prId = pr.pr_id || pr.prId;
            const itemsResponse = await axios.get(
                `${API_BASE_URL}/${prId}/items`,
                getAuthHeaders()
            );

            setSelectedPR({
                ...pr,
                prItems: itemsResponse.data,
            });
        } catch (err) {
            console.error("Error fetching PR items:", err);
            setSelectedPR(pr);
        }
    };

    // 3. UPDATE PR STATUS
    const handleUpdateStatus = async (prId, newStatus) => {
        try {
            const authHeaders = getAuthHeaders();

            await axios.put(
                `${API_BASE_URL}/${prId}/status`,
                null,
                {
                    params: { status: newStatus },
                    ...authHeaders,
                }
            );

            await fetchRequisitions();
            alert(`PR #${prId} updated to ${newStatus}`);
        } catch (err) {
            console.error("Error updating status in database:", err);
            if (err.response?.status === 403) {
                alert("Access Denied (403): You don't have permission to update status.");
            } else {
                alert("Failed to update status in database.");
            }
        }
    };

    // 4. DELETE ENTIRE PR
    const handleDeletePR = async (prId, status) => {
        const currentStatus = String(status).toUpperCase();
        if (currentStatus !== "PENDING") {
            alert("You can only delete requisitions that are PENDING.");
            return;
        }

        if (window.confirm(`Are you sure you want to delete PR #${prId}?`)) {
            try {
                await axios.delete(`${API_BASE_URL}/${prId}`, getAuthHeaders());
                fetchRequisitions();
            } catch (err) {
                console.error("Error deleting PR:", err);
                alert("Failed to delete requisition from database.");
            }
        }
    };


    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading PRs...</span>
                </div>
                <p className="mt-2 text-muted">Connecting to MySQL database...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger m-3" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div className="container-fluid p-0">
            {!isOfficer ? (
                <UserPurchaseRequisition
                    requisitions={requisitions}
                    onRefresh={fetchRequisitions}
                    onDeletePR={handleDeletePR}
                    loggedInUser={loggedInUser}
                />
            ) : (
                <OfficerPurchaseRequisition
                    requisitions={requisitions}
                    onViewPR={handleViewPR}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}

            {/* OFFICER MODAL ONLY */}
            {isOfficer && selectedPR && (
                <PurchaseOfficerRequisitionModal
                    selectedPR={selectedPR}
                    vendors={vendors}
                    onClose={() => setSelectedPR(null)}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}
        </div>
    );
}
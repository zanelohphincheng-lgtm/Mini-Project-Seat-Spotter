import React, { useState } from "react";
import Navbar from "../components/navbar";
import "../styles/dashboard.css"

const Dashboard = () => {
    // Read user from localStorage to determine role
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === "admin";

    // Regular user state: 'bookmark' or 'reservation'
    const [activeTab, setActiveTab] = useState("bookmark");

    // <svg viewBox="0 0 24 24">
    //      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    // </svg>
    // <svg viewBox="0 0 24 24">
    //      <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" />
    // </svg>
    return (
        <>
            <div className="dashboard-body">
                <Navbar />
            </div>
        </>
    );
};

export default Dashboard;

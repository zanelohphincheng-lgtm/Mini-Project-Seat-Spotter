import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "../components/navbar";
import "../styles/dashboard.css";

const Dashboard = () => {
    const [cafe, setCafe] = useState([]);
    // Read user from localStorage to determine role
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === "admin";

    const navigate = useNavigate();

    if (isAdmin) {
        return (
            <>
                <div className="dashboard-body">
                <Navbar />

                <div className="dashboard-container">
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <i className="bi bi-people card-icon-circle"></i>
                            <Link to="/manage-user" className="dashboard-btn">Manage User</Link>
                        </div>
                        <div className="dashboard-card">
                            <i className="bi bi-cup card-icon-circle"></i>
                            <Link to="/manage-cafe" className="dashboard-btn">Manage Cafe</Link>
                        </div>
                        <div className="dashboard-card">
                            <i className="card-icon-pill">RESERVATION</i>
                            <Link to="/manage-reservation" className="dashboard-btn">Manage Reservation</Link>
                        </div>
                        <div className="dashboard-card">
                            <i className="card-icon-pill">REVIEW</i>
                            <Link to="/manage-review" className="dashboard-btn">Manage Review</Link>
                        </div>
                    </div>
                </div>
            </div>
            </>
        );
    }
    return (
        <>
            <div className="dashboard-body">
                <Navbar />

                <div className="dashboard-container">
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <i className="bi bi-journal card-icon-circle"></i>
                            <Link to="/user-bookmark" className="dashboard-btn">View Bookmark</Link>
                        </div>
                        <div className="dashboard-card">
                            <i className="card-icon-pill">RESERVATION</i>
                            <Link to="/user-reservation" className="dashboard-btn">View Reservation</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "../components/navbar";
import "../styles/dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();

    // 1. Properly parse user. Keep it null if it doesn't exist.
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const isAdmin = user?.role === "admin";

    // 2. Safely kick out non-users using useEffect
    useEffect(() => {
        if (!user) {
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    // 3. Prevent rendering anything if there is no user (avoids visual glitch before redirect)
    if (!user) {
        return null;
    }

    if (isAdmin) {
        return (
            <>
                <div className="dashboard-body">
                    <Navbar />
                    <div className="welcome-text">
                        <h1 className="welcome-text-p1">Welcome Back</h1>
                        <h1 className="welcome-text-p2">{user.name}</h1>
                    </div>
                    <div className="dashboard-container">
                        <div className="dashboard-grid">
                            <div className="dashboard-card">
                                <i className="bi bi-people card-icon-circle"></i>
                                <Link to="/manage-user" className="dashboard-btn">
                                    Manage User
                                </Link>
                            </div>
                            <div className="dashboard-card">
                                <i className="bi bi-cup card-icon-circle"></i>
                                <Link to="/manage-cafe" className="dashboard-btn">
                                    Manage Cafe
                                </Link>
                            </div>
                            <div className="dashboard-card">
                                <i className="card-icon-pill">RESERVATION</i>
                                <Link to="/manage-reservation" className="dashboard-btn">
                                    Manage Reservation
                                </Link>
                            </div>
                            <div className="dashboard-card">
                                <i className="card-icon-pill">REVIEW</i>
                                <Link to="/manage-review" className="dashboard-btn">
                                    Manage Review
                                </Link>
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
                <div className="welcome-text">
                    <h1 className="welcome-text-p1">Welcome Back</h1>
                    <h1 className="welcome-text-p2">{user.name}</h1>
                </div>
                <div className="dashboard-container">
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <i className="bi bi-journal card-icon-circle"></i>
                            <Link to="/user-bookmark" className="dashboard-btn">
                                View Bookmark
                            </Link>
                        </div>
                        <div className="dashboard-card">
                            <i className="card-icon-pill">RESERVATION</i>
                            <Link to="/user-reservation" className="dashboard-btn">
                                View Reservation
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import "../styles/navbar.css";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Retrieve auth info from localStorage
    const token = localStorage.getItem("token");
    const onLogout = (e) => {
        e.preventDefault();
        alert("Logout Successfully!")
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="nav-body">
            <nav className="navbar">
                {/* Brand Logo */}
                <Link to="/" className="brand-title">
                    <h1>SeatSpotter</h1>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-6">
                    {/* Home Button */}
                    <Link to="/" className={isActive("/") ? "nav-btn-custom active" : "nav-btn-custom"}>
                        Home
                    </Link>

                    {/* Cafes Button */}
                    <Link to="/cafes" className={isActive("/cafes") ? "nav-btn-custom active" : "nav-btn-custom"}>
                        Cafes
                    </Link>

                    {/* Dynamic Auth Section */}
                    {token ? (
                        <>
                            {/* Logged In View: User Dropdown */}
                            {/* Dashboard Button */}
                            <Link to="/dashboard" className={isActive("/dashboard") ? "nav-btn-custom active" : "nav-btn-custom"}>
                                Dashboard
                            </Link>
                            {/* Logout Button */}
                            <button onClick={onLogout} className="btn-logout-custom">
                                <i className="bi bi-box-arrow-right"></i>
                                Logout
                            </button>
                        </>
                    ) : (
                        /* Guest View: Sign Up & Login */
                        <>
                            <Link to="/register" className="nav-btn-custom">
                                Sign Up
                            </Link>
                            <Link to="/login" className="btn-login-outline">
                                Login
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import "../styles/navbar.css"

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Retrieve auth info from localStorage
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const onLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
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
                <Link to="/" className="nav-btn-custom">
                    Home
                </Link>

                {/* Cafes Button */}
                <Link to="/cafes" className="nav-btn-custom">
                    Cafes
                </Link>

                {/* Dynamic Auth Section */}
                {token ? (
                    <>
                        {/* Logged In View: User Dropdown */}
                        {/* Dashboard Button */}
                        <Link to="/dashboard" className="nav-btn-pill">
                            Dashboard
                        </Link>
                        {/* Logout Button */}
                        <button onClick={onLogout} className="btn-logout-custom">
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

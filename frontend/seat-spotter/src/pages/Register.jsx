import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import api from "../utils/api";
import "../styles/userLoginPage.css";

const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(`Form Submitted`, { name, email, password });
        try {
            const response = await api.post("/users/register", {
                name,
                email,
                password,
            });
            localStorage.setItem("token", response.data.token);
            navigate("/");
            console.log(response.data);
            alert("Sign Up Successful!");
        } catch (error) {
            console.log("Sign Up Error : ", error);
            setError(error.response?.data?.message || "Sign up failed. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-login-page-body">
            {/* Home Icon in Top-Right Corner */}
            <Link to="/">
                <i className="bi bi-house-fill home-icon-btn"></i>
            </Link>

            {/* Main Card Container */}
            <div className="user-login-page-card">
                {/* Logo Header */}
                <div className="brand-container">
                    <div className="brand-icon-box">S</div>
                    <span className="user-login-page-brand-title">SeatSpotter</span>
                </div>
                <span className="user-login-page-label">Register</span>

                {/* Error Alert Box */}
                {error && <div className="user-login-page-label">{error}</div>}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="input-container">
                    {/* Username Field */}
                    <div>
                        <label className="input-label">Username</label>
                        <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="user-login-page-input" />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label className="input-label">Email</label>
                        <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="user-login-page-input" />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="input-label">Password</label>
                        <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength="6" className="user-login-page-input" />
                    </div>

                    <div className="user-login-page-btn-container">
                        {/* Submit Button */}
                        <button type="submit" disabled={loading} className="btn-user-login-page-primary">
                            {loading ? "Signing Up..." : "Sign Up"}
                        </button>
                        {/* Login Redirect Button */}
                        <Link to="/login" className="btn-user-login-page-secondary">
                            Have an Account? Login Here!
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;

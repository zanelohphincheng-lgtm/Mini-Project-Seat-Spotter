import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../utils/api";
import { useNavigate } from "react-router";
import "../styles/userLoginPage.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const userToken = localStorage.getItem("token");
        console.log(userToken);
        if (userToken !== null) navigate("/");
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 💡 Add your login / authentication logic here
        console.log("Form submitted:", {email, password });
        try {
            const response = await api.post("/users/login", {
                email,
                password,
            });
            localStorage.setItem("token", response.data.token);
            navigate("/");
            console.log(response.data);
            alert("Login Successful!");
            // if(user.password != password) alert("Info incorrect! Check your username, email and password!")
        } catch (error) {
            console.error("Login Error:", error);
            alert("Login failed. Please check your connection or user info.");
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
                <span className="user-login-page-label">Login</span>

                {/* Error Alert Box */}
                {error && <div className="user-login-page-label">{error}</div>}
                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="input-container">

                    {/* Email Field */}
                    <div>
                        <label className="input-label">Email :</label>
                        <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="user-login-page-input" />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="input-label">Password :</label>
                        <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength="6" className="user-login-page-input" />
                    </div>

                    <div className="user-login-page-btn-container">
                        {/* Submit Button */}
                        <button type="submit" disabled={loading} className="btn-user-login-page-primary">
                            {loading ? "Loging In..." : "Login"}
                        </button>

                        {/* Login Redirect Button */}
                        <Link to="/register" className="btn-user-login-page-secondary">
                            No Account? Sign Up Here!
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;

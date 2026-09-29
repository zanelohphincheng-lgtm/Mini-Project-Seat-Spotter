import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";

// Import pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Cafes from "./pages/Cafes";
import CafeDetail from "./pages/CafesDetails";
import Dashboard from "./pages/Dashboard";
import ManageUser from "./pages/ManageUser";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cafes" element={<Cafes />} />
                <Route path="/cafes/:id" element={<CafeDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/manage-user" element={<ManageUser />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";

// Import pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Cafes from "./pages/Cafes";
import Dashboard from "./pages/Dashboard";
import ManageUser from "./pages/ManageUser";
import ManageCafe from "./pages/ManageCafe";
import ManageReservation from "./pages/ManageReservation";
import ManageReview from "./pages/ManageReview";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cafes" element={<Cafes />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/manage-user" element={<ManageUser />} />
                <Route path="/manage-cafe" element={<ManageCafe />} />
                <Route path="/manage-reservation" element={<ManageReservation />} />
                <Route path="/manage-review" element={<ManageReview />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

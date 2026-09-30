import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../utils/api";
import "../styles/manage.css";

const ManageCafe = () => {
    // 1. Properly parse user. Keep it null if it doesn't exist.
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const isAdmin = user?.role === "admin";
    const navigate = useNavigate();

    // 2. Safely kick out non-users using useEffect
    useEffect(() => {
        if (!isAdmin) {
            navigate("/");
        }
    }, [user, navigate]);

    // 3. Prevent rendering anything if there is no user (avoids visual glitch before redirect)
    if (!user) {
        return null;
    }
    const [cafes, setCafes] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Selected user for modal actions
    const [selectedCafe, setSelectedCafe] = useState(null);

    // Modal Visibility States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form Inputs for Modals
    const [editFormData, setEditFormData] = useState({ name: "", email: "", role: "user" });

    useEffect(() => {
        fetchCafes();
    }, []);

    const fetchCafes = async () => {
        try {
            const res = await api.get("/cafes");
            setCafes(res.data.data || res.data);
        } catch (err) {
            console.error("Failed to fetch cafes:", err);
        } finally {
            setLoading(false);
        }
    };

    // Filter users by search term
    const filteredCafes = cafes.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

    // --- Modal Handlers ---
    const handleOpenAddModal = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post("/cafes");
            setSelectedCafe(...cafe, data);
            setAddFormData({ name: "", email: "", role: "" });
            setShowAddModal(true);
        } catch (error) {
            console.error("Error adding cafe : ", error);
        }
    };

    const handleOpenPasswordModal = (cafe) => {
        setSelectedCafe(cafe);
        setNewPassword("");
        setShowPasswordModal(true);
    };

    const handleOpenEditModal = (cafe) => {
        setSelectedCafe(cafe);
        setEditFormData({ name: cafe.name, email: cafe.email, role: cafe.role });
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (cafe) => {
        setSelectedCafe(cafe);
        setShowDeleteModal(true);
    };

    // --- API Action Submit Functions ---
    const handleUpdateCafe = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/cafes/${selectedCafe._id}`, editFormData);
            setCafes(cafes.map((c) => (c._id === selectedCafe._id ? { ...c, ...editFormData } : c)));
            alert("Cafe updated successfully!");
            setShowEditModal(false);
        } catch (err) {
            console.error("Failed to update cafe:", err);
            alert("Error updating cafe info.");
        }
    };

    const handleDeleteCafe = async () => {
        try {
            await api.delete(`/cafes/${selectedCafe._id}`);
            setCafes(cafes.filter((c) => c._id !== selectedCafe._id));
            alert("Cafe deleted successfully!");
            setShowDeleteModal(false);
        } catch (err) {
            console.error("Failed to delete cafe:", err);
            alert("Error deleting cafe.");
        }
    };

    return (
        <div className="manage-body">
            <div className="top-section-container">
                <Link to="/dashboard" className="manage-back-btn">
                    <i className="bi bi-arrow-left"></i>
                    <p className="mange-back-text">Back to dashboard</p>
                </Link>
                <h3 className="manage-title">Manage Cafe</h3>
                <div className="search-bar-container">
                    <i className="bi bi-search"></i>
                    <input className="search-bar-input" type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cafe Meow Meow :)" />
                </div>
                <Button className="manage-add-btn">Add New Cafe</Button>
            </div>

            <div>
                <table className="table-container">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Cafe Name</th>
                            <th>Address</th>
                            <th>City</th>
                            <th>Opening Hours</th>
                            <th>Is Open</th>
                            <th>Current Capacity</th>
                            <th>Max Capacity</th>
                            <th>Description</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cafes && cafes.length > 0 ? (
                            cafes.map((cafe, index) => (
                                <tr className="border" key={cafe.id}>
                                    <td>{index + 1}</td>
                                    <td>{cafe.name}</td>
                                    <td>{cafe.address}</td>
                                    <td>{cafe.city}</td>
                                    <td>{cafe.openingHours}</td>
                                    <td>{cafe.isOpen}</td>
                                    <td>{cafe.currentCapacity}</td>
                                    <td>{cafe.maxCapacityPerSlot}</td>
                                    <td>{cafe.description}</td>
                                    <td>
                                        <button className="btn-key">
                                            <i className="bi bi-key"></i>
                                        </button>
                                        <button className="btn-pencil">
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button className="btn-trash">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td>No Cafe Found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageCafe;

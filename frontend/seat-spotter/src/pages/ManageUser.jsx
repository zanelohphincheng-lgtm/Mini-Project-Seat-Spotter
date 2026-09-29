import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Navbar from "../components/navbar";
import api from "../utils/api";
import "../styles/manage.css";

const ManageUser = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Selected user for modal actions
    const [selectedUser, setSelectedUser] = useState(null);

    // Modal Visibility States
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form Inputs for Modals
    const [newPassword, setNewPassword] = useState("");
    const [editFormData, setEditFormData] = useState({ name: "", email: "", role: "user" });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/users");
            setUsers(res.data.data || res.data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    // Filter users by search term
    const filteredUsers = users.filter((u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    // --- Modal Handlers ---
    const handleOpenPasswordModal = (user) => {
        setSelectedUser(user);
        setNewPassword("");
        setShowPasswordModal(true);
    };

    const handleOpenEditModal = (user) => {
        setSelectedUser(user);
        setEditFormData({ name: user.name, email: user.email, role: user.role });
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    // --- API Action Submit Functions ---
    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/users/${selectedUser._id}/reset-password`, { password: newPassword });
            alert(`Password updated successfully for ${selectedUser.name}!`);
            setShowPasswordModal(false);
        } catch (err) {
            console.error("Failed to reset password:", err);
            alert("Error updating password.");
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/users/${selectedUser._id}`, editFormData);
            setUsers(users.map((u) => (u._id === selectedUser._id ? { ...u, ...editFormData } : u)));
            alert("User updated successfully!");
            setShowEditModal(false);
        } catch (err) {
            console.error("Failed to update user:", err);
            alert("Error updating user info.");
        }
    };

    const handleDeleteUser = async () => {
        try {
            await api.delete(`/users/${selectedUser._id}`);
            setUsers(users.filter((u) => u._id !== selectedUser._id));
            alert("User deleted successfully!");
            setShowDeleteModal(false);
        } catch (err) {
            console.error("Failed to delete user:", err);
            alert("Error deleting user.");
        }
    };

    return (
        <div className="manage-body">
            <h3>Manage User</h3>
            <input className="input-control" type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="name, name@example.com" />
        </div>
    )}

export default ManageUser;
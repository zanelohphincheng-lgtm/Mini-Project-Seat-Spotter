import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../utils/api";
import "../styles/manage.css";

const ManageUser = () => {
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
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Modal Visibility States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form Inputs for Modals
    const [newPassword, setNewPassword] = useState("");
    const [newUser, setNewUser] = useState({ name: "", email: "", password:"", role: "" });
    const [selectedUser, setSelectedUser] = useState({ name: "", email: "", role: "user" });

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
    const filteredUsers = users.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

    // --- Modal Handlers ---
    const handleOpenAddModal = () => {
        setNewUser({ name: "", email: "", password: "", role: "" });
        setShowAddModal(true);
    };

    const handleOpenPasswordModal = (user) => {
        setSelectedUser(user);
        setNewPassword("");
        setShowPasswordModal(true);
    };

    const handleOpenEditModal = (user) => {
        setSelectedUser(user);
        setSelectedUser({ name: user.name, email: user.email, role: user.role });
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    // Handle close
    const handleCloseAdd = () => setShowAddModal(false);
    const handleCloseEdit = () => setShowEditModal(false);
    const handleClosePassword = () => setShowPasswordModal(false);
    const handleCloseDelete = () => setShowDeleteModal(false);

    // --- API Action Submit Functions ---
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`/users`, newUser);
            const createdUser = res.data.data || res.data;
            setUsers([...users, createdUser])
            alert(`New user has been added!`);
            setShowAddModal(false);
        } catch (err) {
            console.error("Failed to add user:", err);
            alert("Error adding new user.");
        }
    };

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
            const res = await api.patch(`/users/${selectedUser._id}`, selectedUser);
            setUsers(users.map((u) => (u._id === selectedUser._id ? { ...u, ...selectedUser } : u)));
            alert("User updated successfully!");
            setShowEditModal(false);
        } catch (err) {
            console.error("Failed to update user:", err);
            alert("Error updating user info.");
        }
    };

    const handleDeleteUser = async (e) => {
        e.preventDefault();
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
            <div className="top-section-container">
                <Link to="/dashboard" className="manage-back-btn">
                    <i className="bi bi-arrow-left"></i>
                    <p className="manage-back-text">Back to dashboard</p>
                </Link>
                <Button onClick={() => handleOpenAddModal(newUser)} className="manage-add-btn">
                    <i className="bi bi-plus-circle"></i>
                    <p className="manage-add-text">Add New User</p>
                </Button>
            </div>

            <h3 className="manage-title">Manage User</h3>
            <div className="search-bar-container">
                <i className="bi bi-search search-icon"></i>
                <input className="search-input" type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="name, name@example.com" />
            </div>

            <div className="manage-table-card">
                <table className="manage-table">
                    <thead>
                        <tr>
                            <th className="first-column">No.</th>
                            <th className="second-column">Username</th>
                            <th className="thrid-column">Email</th>
                            <th className="forth-column">Role</th>
                            <th className="final-column">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users && users.length > 0 ? (
                            users.map((user, index) => (
                                <tr className="border-bottom border-dark" key={user._id}>
                                    <td className="first-column">{index + 1}.</td>
                                    <td className="second-column">{user.name}</td>
                                    <td className="thrid-column">{user.email}</td>
                                    <td className="forth-column">{user.role}</td>
                                    <td className="final-column">
                                        <Button onClick={() => handleOpenPasswordModal(user)} className="action-icon-btn btn-key">
                                            <i className="bi bi-key"></i>
                                        </Button>
                                        <Button onClick={() => handleOpenEditModal(user)} className="action-icon-btn btn-pencil">
                                            <i className="bi bi-pencil"></i>
                                        </Button>
                                        <Button onClick={() => handleOpenDeleteModal(user)} className="action-icon-btn btn-trash">
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td>No User Found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Add User Modal */}
            <div className="modal-container">
                <Modal show={showAddModal} onHide={handleCloseAdd}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleAddUser}>
                            <div className="modal-form-input">
                                <label>Name :</label>
                                <input type="text" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Email :</label>
                                <input type="text" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Password :</label>
                                <input type="text" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Role :</label>
                                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                                    <option value="" disabled>
                                        Select Role
                                    </option>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button className="submit-btn" type="submit">Add User</button>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>

            {/* Change Password Modal */}
            <div className="modal-container">
                <Modal show={showPasswordModal} onHide={handleClosePassword}>
                    <Modal.Header closeButton>
                        <Modal.Title>Change User Password</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleResetPassword}>
                            <div className="modal-form-input">
                                <label>New Password :</label>
                                <input type="text" placeholder="New Password" value={""} onChange={(e) => setNewPassword(e.target.value)} />
                            </div>
                            <button className="submit-btn" type="submit">Update Password</button>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>

            {/* Edit User Modal */}
            <div className="modal-container">
                <Modal show={showEditModal} onHide={handleCloseEdit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Update User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleUpdateUser}>
                            <div className="modal-form-input">
                                <label>Name :</label>
                                <input type="text" placeholder="Name" value={selectedUser.name || ""} onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Email :</label>
                                <input type="text" placeholder="Email" value={selectedUser.email || ""} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Role :</label>
                                <select value={selectedUser.role} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}>
                                    <option value="" disabled>
                                        Select Role
                                    </option>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button className="submit-btn" type="submit">Update User</button>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>

            {/* Delete User Modal */}
            <div className="modal-container">
                <Modal show={showDeleteModal} onHide={handleCloseDelete}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete {selectedUser.name}?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleDeleteUser}>
                            <div className="delete-form">
                                <h3>Are you sure you want to delete {selectedUser.name}?</h3>
                                <p>Once deleted all data related to {selectedUser.name} will be gone forever.</p>
                                <button className="delete-btn" type="submit">
                                    Delete
                                </button>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    );
};

export default ManageUser;

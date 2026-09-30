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
    const [newUser, setNewUser] = useState({ name: "", email: "", role: "user" });
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
        setNewUser({ name: "", email: "", role: "" });
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
            await api.post(`/users`, newUser);
            setUsers([...users, res.data.data || res.data])
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
            const res = await api.put(`/users/${selectedUser._id}`, selectedUser);
            setUsers(users.map((u) => (u._id === selectedUser._id ? { ...u, ...selectedUser } : u)));
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
            <div className="top-section-container">
                <Link to="/dashboard" className="manage-back-btn">
                    <i className="bi bi-arrow-left"></i>
                    <p className="mange-back-text">Back to dashboard</p>
                </Link>
                <h3 className="manage-title">Manage User</h3>
                <div className="search-bar-container">
                    <i className="bi bi-search search-icon"></i>
                    <input className="search-input" type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="name, name@example.com" />
                </div>
                <Button onClick={() => handleOpenAddModal(newUser)} className="add-user-btn">
                    Add New User
                </Button>
            </div>

            <div>
                <table className="table-container">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users && users.length > 0 ? (
                            users.map((user, index) => (
                                <tr className="border" key={user._id}>
                                    <td>{index + 1}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <Button onClick={() => handleOpenPasswordModal(user)} className="btn-key">
                                            <i className="bi bi-key"></i>
                                        </Button>
                                        <Button onClick={() => handleOpenEditModal(user)} className="btn-pencil">
                                            <i className="bi bi-pencil"></i>
                                        </Button>
                                        <Button onClick={() => handleOpenDeleteModal(user._id)} className="btn-trash">
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
                            <input type="text" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                            <input type="text" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                                <option value="" disabled>
                                    Select Role
                                </option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button type="submit">Add User</button>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>

            {/* Change Password Modal */}
            <div className="modal-container">
                <Modal show={showPasswordModal} onHide={handleClosePassword}>
                    <Modal.Header closeButton>
                        <Modal.Title>Update User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleResetPassword}>
                            <input type="text" placeholder="New Password" value={""} onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })} />
                            <button type="submit">Update User</button>
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
                            <input type="text" placeholder="Name" value={selectedUser.name || ""} onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })} />
                            <input type="text" placeholder="Email" value={selectedUser.email || ""} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />
                            <select value={selectedUser.role} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}>
                                <option value="" disabled>
                                    Select Role
                                </option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button type="submit">Update User</button>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>

            {/* Delete User Modal */}
            <div className="modal-container">
                <Modal show={showDeleteModal} onHide={handleCloseDelete}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete {user.name}?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleDeleteUser}>
                            <div>
                                <h3>Are you sure you want to delete {user.name}?</h3>
                                <p>Once deleted all data related to {user.name} will be gone forever.</p>
                                <button type="submit">Delete</button>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    );
};

export default ManageUser;

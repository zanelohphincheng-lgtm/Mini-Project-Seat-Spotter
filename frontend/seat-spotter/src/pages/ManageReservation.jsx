import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../utils/api";
import "../styles/manage.css";

const ManageReservation = () => {
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
    const [reservations, setReservations] = useState([]);
    const [search, setSearch] = useState("");

    // Modal Visibility States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form Inputs for Modals
    const [newPassword, setNewPassword] = useState("");
    const [newReservation, setNewReservation] = useState({ name: "", email: "", password: "", role: "" });
    const [selectedReservation, setSelectedReservation] = useState({ name: "", email: "", role: "reservation" });

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const res = await api.get("/reservations");
            setReservations(res.data);
        } catch (err) {
            console.error("Failed to fetch reservations:", err);
        }
    };

    // Filter reservations by search term
    const filteredReservations = reservations.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

    // --- Modal Handlers ---
    const handleOpenAddModal = () => {
        setNewReservation({ name: "", email: "", password: "", role: "" });
        setShowAddModal(true);
    };

    const handleOpenPasswordModal = (reservation) => {
        setSelectedReservation(reservation);
        setNewPassword("");
        setShowPasswordModal(true);
    };

    const handleOpenEditModal = (reservation) => {
        setSelectedReservation(reservation);
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (reservation) => {
        setSelectedReservation(reservation);
        setShowDeleteModal(true);
    };

    // Handle close
    const handleCloseAdd = () => setShowAddModal(false);
    const handleCloseEdit = () => setShowEditModal(false);
    const handleClosePassword = () => setShowPasswordModal(false);
    const handleCloseDelete = () => setShowDeleteModal(false);

    // --- API Action Submit Functions ---
    const handleAddReservation = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/reservations`, newReservation);
            await fetchReservations();
            alert(`New reservation has been added!`);
            setShowAddModal(false);
        } catch (err) {
            console.error("Failed to add reservation:", err);
            alert("Error adding new reservation.");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!selectedReservation._id) {
            alert("Error: Cafe ID is missing!");
            return;
        }
        try {
            await api.patch(`/reservations/${selectedReservation._id}/reset-password`, { password: newPassword });
            await fetchReservations();
            setNewPassword("");
            alert(`Password updated successfully for ${selectedReservation.name}!`);
            setShowPasswordModal(false);
        } catch (err) {
            console.error("Failed to reset password:", err);
            alert("Error updating password.");
        }
    };

    const handleUpdateReservation = async (e) => {
        e.preventDefault();
        if (!selectedReservation._id) {
            alert("Error: Cafe ID is missing!");
            return;
        }
        try {
            await api.patch(`/reservations/${selectedReservation._id}`, selectedReservation);
            await fetchReservations();
            alert("Reservation updated successfully!");
            setShowEditModal(false);
        } catch (err) {
            console.error("Failed to update reservation:", err);
            alert("Error updating reservation info.");
        }
    };

    const handleDeleteReservation = async (e) => {
        e.preventDefault();
        if (!selectedReservation._id) {
            alert("Error: Cafe ID is missing!");
            return;
        }
        try {
            await api.delete(`/reservations/${selectedReservation._id}`);
            const updatedList = reservations.filter((u) => u._id !== selectedReservation._id)
            setReservations(updatedList);
            alert("Reservation deleted successfully!");
            setShowDeleteModal(false);
        } catch (err) {
            console.error("Failed to delete reservation:", err);
            alert("Error deleting reservation.");
        }
    };

    return (
        <div className="manage-body">
            <div className="top-section-container">
                <Link to="/dashboard" className="manage-back-btn">
                    <i className="bi bi-arrow-left"></i>
                    <p className="manage-back-text">Back to dashboard</p>
                </Link>
                <Button onClick={() => handleOpenAddModal(newReservation)} className="manage-add-btn">
                    <i className="bi bi-plus-circle"></i>
                    <p className="manage-add-text">Add New Reservation</p>
                </Button>
            </div>

            <h3 className="manage-title">Manage Reservation</h3>
            <div className="search-bar-container">
                <i className="bi bi-search search-icon"></i>
                <input required className="search-input" type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="name, name@example.com" />
            </div>

            <div className="manage-table-card">
                <table className="manage-table">
                    <thead>
                        <tr>
                            <th className="first-column">No.</th>
                            <th className="second-column">Cafe</th>
                            <th className="thrid-column">User</th>
                            <th className="forth-column">Booking Date</th>
                            <th className="fifth-column">Time Slot</th>
                            <th className="sixth-column">Party Size</th>
                            <th className="seventh-column">Status</th>
                            <th className="final-column">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReservations && filteredReservations.length > 0 ? (
                            filteredReservations.map((reservation, index) => (
                                <tr className="border-bottom border-dark" key={reservation._id}>
                                    <td className="first-column">{index + 1}.</td>
                                    <td className="second-column">{reservation.cafe}</td>
                                    <td className="thrid-column">{reservation.user}</td>
                                    <td className="forth-column">{reservation.bookingDate}</td>
                                    <td className="fifth-column">{reservation.timeSlot}</td>
                                    <td className="sixth-column">{reservation.partySize}</td>
                                    <td className="seventh-column status-pill">{reservation.status}</td>
                                    <td className="final-column">
                                        <Button onClick={() => handleOpenPasswordModal(reservation)} className="action-icon-btn btn-view">
                                            <i className="bi bi-eye"></i>
                                        </Button>
                                        <Button onClick={() => handleOpenEditModal(reservation)} className="action-icon-btn btn-pencil">
                                            <i className="bi bi-pencil"></i>
                                        </Button>
                                        <Button onClick={() => handleOpenDeleteModal(reservation)} className="action-icon-btn btn-trash">
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td></td>
                                <td></td>
                                <td>
                                    <p className="no-result">No Reservation Found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Add Reservation Modal */}
            <div className="modal-container">
                <Modal show={showAddModal} onHide={handleCloseAdd}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Reservation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleAddReservation}>
                            <div className="modal-form-input">
                                <label>Name :</label>
                                <input required type="text" placeholder="Name" value={newReservation.name} onChange={(e) => setNewReservation({ ...newReservation, name: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Email :</label>
                                <input required type="text" placeholder="Email" value={newReservation.email} onChange={(e) => setNewReservation({ ...newReservation, email: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Password :</label>
                                <input required type="text" placeholder="Password" value={newReservation.password} onChange={(e) => setNewReservation({ ...newReservation, password: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Role :</label>
                                <select required value={newReservation.role} onChange={(e) => setNewReservation({ ...newReservation, role: e.target.value })}>
                                    <option value="" disabled>
                                        Select Role
                                    </option>
                                    <option value="reservation">Reservation</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button className="submit-btn" type="submit">
                                Add Reservation
                            </button>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>

            {/* Change Password Modal */}
            <div className="modal-container">
                <Modal show={showPasswordModal} onHide={handleClosePassword}>
                    <Modal.Header closeButton>
                        <Modal.Title>Change Reservation Password</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleResetPassword}>
                            <div className="modal-form-input">
                                <label>New Password :</label>
                                <input required type="text" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </div>
                            <button className="submit-btn" type="submit">
                                Update Password
                            </button>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>

            {/* Edit Reservation Modal */}
            <div className="modal-container">
                <Modal show={showEditModal} onHide={handleCloseEdit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Update Reservation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleUpdateReservation}>
                            <div className="modal-form-input">
                                <label>Name :</label>
                                <input required type="text" placeholder="Name" value={selectedReservation.name || ""} onChange={(e) => setSelectedReservation({ ...selectedReservation, name: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Email :</label>
                                <input required type="text" placeholder="Email" value={selectedReservation.email || ""} onChange={(e) => setSelectedReservation({ ...selectedReservation, email: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Role :</label>
                                <select required value={selectedReservation.role} onChange={(e) => setSelectedReservation({ ...selectedReservation, role: e.target.value })}>
                                    <option value="" disabled>
                                        Select Role
                                    </option>
                                    <option value="reservation">Reservation</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button className="submit-btn" type="submit">
                                Update Reservation
                            </button>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>

            {/* Delete Reservation Modal */}
            <div className="modal-container">
                <Modal show={showDeleteModal} onHide={handleCloseDelete}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete {selectedReservation.name}?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleDeleteReservation}>
                            <div className="delete-form">
                                <h3>Are you sure you want to delete {selectedReservation.name}?</h3>
                                <p>Once deleted all data related to {selectedReservation.name} will be gone forever.</p>
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

export default ManageReservation;

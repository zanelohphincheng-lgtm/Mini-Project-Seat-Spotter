import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../utils/api";
import "../styles/manage.css";

const ManageReview = () => {
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
    const [reviews, setReviews] = useState([]);
    const [search, setSearch] = useState("");

    // Modal Visibility States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form Inputs for Modals
    const [newReview, setNewReview] = useState({ _id: "", rating: 5, comment: "", crowdReport: "moderate" });
    const [selectedReview, setSelectedReview] = useState({ _id: "", rating: 5, comment: "", crowdReport: "moderate" });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await api.get("/reviews");
            setReviews(res.data);
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
        }
    };

    // Filter reviews by search term
    const filteredReviews = reviews.filter((r) => 
        (r.cafe?.name || r.cafe || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.user?.name || r.user || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.comment || "").toLowerCase().includes(search.toLowerCase())
    );

    // --- Modal Handlers ---
    const handleOpenAddModal = () => {
        setNewReview({ _id: "", rating: 5, comment: "", crowdReport: "moderate" });
        setShowAddModal(true);
    };

    const handleNavigateToReview = (review) => {
        setSelectedReview(review);
        setShowPasswordModal(true);
    };

    const handleOpenEditModal = (review) => {
        setSelectedReview(review);
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (review) => {
        setSelectedReview(review);
        setShowDeleteModal(true);
    };

    // Handle close
    const handleCloseAdd = () => setShowAddModal(false);
    const handleCloseEdit = () => setShowEditModal(false);
    const handleClosePassword = () => setShowPasswordModal(false);
    const handleCloseDelete = () => setShowDeleteModal(false);

    // --- API Action Submit Functions ---
    const handleAddReview = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/reviews`, newReview);
            await fetchReviews();
            alert(`New review has been added!`);
            setShowAddModal(false);
        } catch (err) {
            console.error("Failed to add review:", err);
            alert("Error adding new review.");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!selectedReview._id) {
            alert("Error: Cafe ID is missing!");
            return;
        }
        try {
            await api.patch(`/reviews/${selectedReview._id}/reset-password`, { password: newPassword });
            await fetchReviews();
            setNewPassword("");
            alert(`Password updated successfully for ${selectedReview.name}!`);
            setShowPasswordModal(false);
        } catch (err) {
            console.error("Failed to reset password:", err);
            alert("Error updating password.");
        }
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        if (!selectedReview._id) {
            alert("Error: Cafe ID is missing!");
            return;
        }
        try {
            await api.patch(`/reviews/${selectedReview._id}`, selectedReview);
            await fetchReviews();
            alert("Review updated successfully!");
            setShowEditModal(false);
        } catch (err) {
            console.error("Failed to update review:", err);
            alert("Error updating review info.");
        }
    };

    const handleDeleteReview = async (e) => {
        e.preventDefault();
        if (!selectedReview._id) {
            alert("Error: Cafe ID is missing!");
            return;
        }
        try {
            await api.delete(`/reviews/${selectedReview._id}`);
            const updatedList = reviews.filter((u) => u._id !== selectedReview._id);
            setReviews(updatedList);
            alert("Review deleted successfully!");
            setShowDeleteModal(false);
        } catch (err) {
            console.error("Failed to delete review:", err);
            alert("Error deleting review.");
        }
    };

    return (
        <div className="manage-body">
            <div className="top-section-container">
                <Link to="/dashboard" className="manage-back-btn">
                    <i className="bi bi-arrow-left"></i>
                    <p className="manage-back-text">Back to dashboard</p>
                </Link>
                <Button onClick={() => handleOpenAddModal(newReview)} className="manage-add-btn">
                    <i className="bi bi-plus-circle"></i>
                    <p className="manage-add-text">Add New Review</p>
                </Button>
            </div>

            <h3 className="manage-title">Manage Review</h3>
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
                            <th className="forth-column">Rating</th>
                            <th className="fifth-column">Comment</th>
                            <th className="sixth-column">Crowd Report</th>
                            <th className="final-column">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReviews && filteredReviews.length > 0 ? (
                            filteredReviews.map((review, index) => (
                                <tr className="border-bottom border-dark" key={review._id}>
                                    <td className="first-column">{index + 1}.</td>
                                    <td className="second-column">{review.cafe}</td>
                                    <td className="thrid-column">{review.user}</td>
                                    <td className="forth-column">{review.rating}</td>
                                    <td className="fifth-column">{review.comment}</td>
                                    <td className="sixth-column">{review.crowdReport}</td>
                                    <td className="final-column">
                                        <Button onClick={() => handleOpenPasswordModal(review)} className="action-icon-btn btn-view">
                                            <i className="bi bi-eye"></i>
                                        </Button>
                                        <Button onClick={() => handleOpenEditModal(review)} className="action-icon-btn btn-pencil">
                                            <i className="bi bi-pencil"></i>
                                        </Button>
                                        <Button onClick={() => handleOpenDeleteModal(review)} className="action-icon-btn btn-trash">
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
                                    <p className="no-result">No Review Found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Add Review Modal */}
            <div className="modal-container">
                <Modal show={showAddModal} onHide={handleCloseAdd}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Review</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleAddReview}>
                            <div className="modal-form-input">
                                <label>Name :</label>
                                <input required type="text" placeholder="Name" value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Email :</label>
                                <input required type="text" placeholder="Email" value={newReview.email} onChange={(e) => setNewReview({ ...newReview, email: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Password :</label>
                                <input required type="text" placeholder="Password" value={newReview.password} onChange={(e) => setNewReview({ ...newReview, password: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Role :</label>
                                <select required value={newReview.role} onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}>
                                    <option value="" disabled>
                                        Select Role
                                    </option>
                                    <option value="review">Review</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button className="submit-btn" type="submit">
                                Add Review
                            </button>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>

            {/* Change Password Modal */}
            <div className="modal-container">
                <Modal show={showPasswordModal} onHide={handleClosePassword}>
                    <Modal.Header closeButton>
                        <Modal.Title>Change Review Password</Modal.Title>
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

            {/* Edit Review Modal */}
            <div className="modal-container">
                <Modal show={showEditModal} onHide={handleCloseEdit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Update Review</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleUpdateReview}>
                            <div className="modal-form-input">
                                <label>Name :</label>
                                <input required type="text" placeholder="Name" value={selectedReview.name || ""} onChange={(e) => setSelectedReview({ ...selectedReview, name: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Email :</label>
                                <input required type="text" placeholder="Email" value={selectedReview.email || ""} onChange={(e) => setSelectedReview({ ...selectedReview, email: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Role :</label>
                                <select required value={selectedReview.role} onChange={(e) => setSelectedReview({ ...selectedReview, role: e.target.value })}>
                                    <option value="" disabled>
                                        Select Role
                                    </option>
                                    <option value="review">Review</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button className="submit-btn" type="submit">
                                Update Review
                            </button>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>

            {/* Delete Review Modal */}
            <div className="modal-container">
                <Modal show={showDeleteModal} onHide={handleCloseDelete}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete {selectedReview.name}?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleDeleteReview}>
                            <div className="delete-form">
                                <h3>Are you sure you want to delete {selectedReview.name}?</h3>
                                <p>Once deleted all data related to {selectedReview.name} will be gone forever.</p>
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

export default ManageReview;

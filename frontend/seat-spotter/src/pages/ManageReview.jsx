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
    const [showViewModal, setShowViewModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Add options states at the top of ManageReservation component
    const [cafesList, setCafesList] = useState([]);
    const [usersList, setUsersList] = useState([]);

    // Initial state structures for review forms
    const [newReview, setNewReview] = useState({
        cafe: "",
        user: "",
        rating: 5,
        comment: "",
        crowdReport: "moderate",
    });

    const [selectedReview, setSelectedReview] = useState({
        _id: "",
        cafe: "",
        user: "",
        rating: 5,
        comment: "",
        crowdReport: "moderate",
    });

    // Fetching existing cafes and users as option for add and edit
    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const [cafesRes, usersRes] = await Promise.all([api.get("/cafes"), api.get("/users")]);
            setCafesList(cafesRes.data);
            setUsersList(usersRes.data);
        } catch (err) {
            console.error("Failed to fetch cafes or users:", err);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await api.get("/reviews");
            setReviews(res.data.data);
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
        }
    };

    // Filter reviews by search term
    const filteredReviews = Array.isArray(reviews)
        ? reviews.filter((r) => {
              const query = search.toLowerCase();
              const cafeName = (r.cafe?.name || r.cafe || "").toString().toLowerCase();
              const userName = (r.user?.name || r.user || "").toString().toLowerCase();

              return cafeName.includes(query) || userName.includes(query);
          })
        : [];

    // --- Modal Handlers ---
    const handleOpenViewModal = (review) => {
        setSelectedReview(review);
        setShowViewModal(true);
    };

    const handleOpenAddModal = () => {
        setNewReview({
            cafe: cafesList[0]?._id || "",
            user: usersList[0]?._id || "",
            bookingDate: "",
            timeSlot: "12:00",
            partySize: 1,
            status: "pending",
        });
        setShowAddModal(true);
    };

    const handleOpenEditModal = (review) => {
        setSelectedReview({
            ...review,
            cafe: review.cafe?._id || review.cafe || "",
            user: review.user?._id || review.user || "",
        });
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (review) => {
        setSelectedReview(review);
        setShowDeleteModal(true);
    };

    // Handle close
    const handleCloseView = () => setShowViewModal(false);
    const handleCloseAdd = () => setShowAddModal(false);
    const handleCloseEdit = () => setShowEditModal(false);
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

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        if (!selectedReview._id) {
            alert("Error: Review ID is missing!");
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
            const updatedList = reviews.filter((r) => r._id !== selectedReview._id);
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
                            <th className="thrid-column-v2">User</th>
                            <th className="forth-column-v3">Rating</th>
                            <th className="fifth-column-v3">Comment</th>
                            <th className="sixth-column-v3">Crowd Report</th>
                            <th className="final-column">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReviews && filteredReviews.length > 0 ? (
                            filteredReviews.map((review, index) => (
                                <tr className="border-bottom border-dark" key={review._id}>
                                    <td className="first-column">{index + 1}.</td>
                                    <td className="second-column">{review.cafe?.name || review.cafe || "N/A"}</td>
                                    <td className="thrid-column-v2">{review.user?.name || review.user || "N/A"}</td>
                                    <td className="forth-column-v3">{review.rating}⭐</td>
                                    <td className="fifth-column-v3">{review.comment}</td>
                                    <td className="sixth-column-v3 status-pill">{review.crowdReport}</td>
                                    <td className="final-column">
                                        <Button onClick={() => handleOpenViewModal(review)} className="action-icon-btn btn-view">
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

            {/* View Review Detail Modal */}
            <Modal show={showViewModal} onHide={handleCloseView} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Review Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="review-details">
                        <p>
                            <strong>Review ID:</strong> {selectedReview._id}
                        </p>
                        <p>
                            <strong>Cafe:</strong> {selectedReview.cafe?.name || selectedReview.cafe}
                        </p>
                        <p>
                            <strong>User:</strong> {selectedReview.user?.name || selectedReview.user}
                        </p>
                        <p>
                            <strong>Email:</strong> {selectedReview.user?.email || "N/A"}
                        </p>
                        <p>
                            <strong>Rating:</strong> {selectedReview.rating}
                        </p>
                        <p>
                            <strong>Comment:</strong> {selectedReview.comment}
                        </p>
                        <p>
                            <strong>Crowd Report:</strong> <span className="status-pill">{selectedReview.crowdReport}</span>
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseView}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Review Modal */}
            <Modal show={showAddModal} onHide={handleCloseAdd} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Review</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddReview}>
                        <Form.Group className="mb-3">
                            <Form.Label>Cafe :</Form.Label>
                            <Form.Select required value={newReview.cafe} onChange={(e) => setNewReview({ ...newReview, cafe: e.target.value })}>
                                <option value="" disabled>
                                    Select Cafe
                                </option>
                                {cafesList.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>User :</Form.Label>
                            <Form.Select required value={newReview.user} onChange={(e) => setNewReview({ ...newReview, user: e.target.value })}>
                                <option value="" disabled>
                                    Select User
                                </option>
                                {usersList.map((u) => (
                                    <option key={u._id} value={u._id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Rating (1 to 5) :</Form.Label>
                            <Form.Select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}>
                                <option value={1}>1 - Poor</option>
                                <option value={2}>2 - Fair</option>
                                <option value={3}>3 - Good</option>
                                <option value={4}>4 - Very Good</option>
                                <option value={5}>5 - Excellent</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Comment :</Form.Label>
                            <Form.Control required as="textarea" rows={3} placeholder="Write your review..." value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Crowd Level :</Form.Label>
                            <Form.Select value={newReview.crowdReport} onChange={(e) => setNewReview({ ...newReview, crowdReport: e.target.value })}>
                                <option value="quiet">Quiet</option>
                                <option value="moderate">Moderate</option>
                                <option value="busy">Busy</option>
                                <option value="packed">Packed</option>
                            </Form.Select>
                        </Form.Group>

                        <Button className="submit-btn w-100 mt-2" type="submit">
                            Add Review
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Edit Review Modal */}
            <Modal show={showEditModal} onHide={handleCloseEdit} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Update Review</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpdateReview}>
                        <Form.Group className="mb-3">
                            <Form.Select required value={selectedReview.cafe || ""} onChange={(e) => setSelectedReview({ ...selectedReview, cafe: e.target.value })}>
                                <option value="" disabled>
                                    Select Cafe
                                </option>
                                {cafesList.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>User :</Form.Label>
                            <Form.Select required value={selectedReview.user || ""} onChange={(e) => setSelectedReview({ ...selectedReview, user: e.target.value })}>
                                <option value="" disabled>
                                    Select User
                                </option>
                                {usersList.map((u) => (
                                    <option key={u._id} value={u._id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Rating (1 to 5) :</Form.Label>
                            <Form.Select value={selectedReview.rating || 5} onChange={(e) => setSelectedReview({ ...selectedReview, rating: Number(e.target.value) })}>
                                <option value={1}>1 - Poor</option>
                                <option value={2}>2 - Fair</option>
                                <option value={3}>3 - Good</option>
                                <option value={4}>4 - Very Good</option>
                                <option value={5}>5 - Excellent</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Comment :</Form.Label>
                            <Form.Control required as="textarea" rows={3} value={selectedReview.comment || ""} onChange={(e) => setSelectedReview({ ...selectedReview, comment: e.target.value })} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Crowd Level :</Form.Label>
                            <Form.Select value={selectedReview.crowdReport || "moderate"} onChange={(e) => setSelectedReview({ ...selectedReview, crowdReport: e.target.value })}>
                                <option value="quiet">Quiet</option>
                                <option value="moderate">Moderate</option>
                                <option value="busy">Busy</option>
                                <option value="packed">Packed</option>
                            </Form.Select>
                        </Form.Group>

                        <Button className="submit-btn w-100 mt-2" type="submit">
                            Update Review
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Review Modal */}
            <div className="modal-container">
                <Modal show={showDeleteModal} onHide={handleCloseDelete}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete Review by {selectedReview.user}?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleDeleteReview}>
                            <div className="delete-form">
                                <h3>Are you sure you want to delete this review?</h3>
                                <p>Once deleted, this review will be gone forever.</p>
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

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../utils/api";
import Navbar from "../components/navbar";
import "../styles/cafes.css";

const Cafes = () => {
    const [cafes, setCafes] = useState([]);
    const [selectedCafe, setSelectedCafe] = useState(null);
    const [cafeReviews, setCafeReviews] = useState([]);
    const [showCafeDetailModal, setShowCafeDetailModal] = useState();
    const [userBookmarks, setUserBookmarks] = useState([]);

    // Check if user is logged in
    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;

    // Form states
    const [newReservation, setNewReservation] = useState({ date: "", time: "", guests: 1 });
    const [newReview, setNewReview] = useState({ rating: 5, comment: "", crowdReport: "moderate" });
    const [isBookmarked, setIsBookmarked] = useState(false);

    const handleOpenCafeDetailModal = (cafe) => {
        setSelectedCafe(cafe);
        setNewReservation({ date: "", time: "", guests: 1 });
        setNewReview({ rating: 5, comment: "", crowdReport: "moderate" });
        setShowCafeDetailModal(true);
        // Fetch reviews for the clicked cafe
        fetchCafeReviews(cafe._id);
        // Check if this cafe is bookmarked by the user
        setIsBookmarked(userBookmarks.includes(cafe._id));
    };

    const fetchCafeReviews = async (cafeId) => {
        try {
            const res = await api.get(`/reviews/${cafeId}`);
            setCafeReviews(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch cafe reviews:", err);
            setCafeReviews([]);
        }
    };

    const handleCloseCafeDetail = () => {
        setShowCafeDetailModal(false);
        setSelectedCafe(null);
    };

    // Toggle Bookmark
    const handleToggleBookmark = async () => {
        if (!selectedCafe || !selectedCafe._id) return;

        const cafeId = selectedCafe._id;
        const nextState = !isBookmarked;

        // Optimistic UI Update
        setIsBookmarked(nextState);
        if (nextState) {
            setUserBookmarks((prev) => [...prev, cafeId]);
        } else {
            setUserBookmarks((prev) => prev.filter((id) => id !== cafeId));
        }

        try {
            // Pass empty object {} as body to satisfy Axios/Express
            await api.post(`/cafes/${cafeId}/bookmark`, {});
        } catch (err) {
            console.error("Failed to update bookmark:", err);
            // Revert UI if API call fails
            setIsBookmarked(!nextState);
            if (!nextState) {
                setUserBookmarks((prev) => [...prev, cafeId]);
            } else {
                setUserBookmarks((prev) => prev.filter((id) => id !== cafeId));
            }
        }
    };

    // Submit Reservation
    const handleReservationSubmit = async (e) => {
        e.preventDefault();
        try {
            const partyCount = Number(newReservation.guests);

            await api.post("/reservations", {
                cafeId: selectedCafe._id,
                bookingDate: newReservation.date,
                timeSlot: newReservation.time,
                partySize: partyCount,
                status: "pending",
            });
            alert("Reservation Submitted Successfully! Awaiting confirmation.");
            setNewReservation({ date: "", time: "", guests: 1 });
            setShowCafeDetailModal(false);
        } catch (err) {
            console.error("Failed to create reservation:", err);
            alert("Failed to create reservation.");
        }
    };

    // Submit Review
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/reviews", {
                cafeId: selectedCafe._id,
                rating: newReview.rating,
                crowdReport: newReview.crowdReport,
                comment: newReview.comment,
            });
            alert("Review submitted successfully!");
            setNewReview({ rating: 5, crowdReport: "moderate", comment: "" });
            // Refresh reviews list
            fetchCafeReviews(selectedCafe._id);
        } catch (err) {
            console.error("Failed to submit review:", err);
            alert("Failed to submit review.");
        }
    };

    useEffect(() => {
        fetchCafes();
        if (isLoggedIn) {
            fetchUserBookmarks();
        }
    }, []);

    const fetchCafes = async () => {
        try {
            const res = await api.get("/cafes");
            setCafes(res.data);
        } catch (err) {
            console.error("Error fetching cafes:", err);
        }
    };

    const fetchUserBookmarks = async () => {
        try {
            const res = await api.get("/users/bookmarks"); // Adjust to match your backend bookmark route
            const bookmarksArray = Array.isArray(res.data) ? res.data : [];
            const bookmarkIds = bookmarksArray.map((b) => b._id || b);
            setUserBookmarks(bookmarkIds);
        } catch (err) {
            console.error("Failed to fetch bookmarks:", err);
        }
    };

    return (
        <div className="cafes-body">
            <Navbar />

            {/* Main Cafe Grid */}
            <main className="card-container">
                <div className="card-grid">
                    {cafes.map((cafe) => (
                        <div onClick={() => handleOpenCafeDetailModal(cafe)} key={cafe._id} className="cafe-card" style={{ cursor: "pointer" }}>
                            {/* Cafe Image */}
                            <div className="cafe-image-container">
                                <img src={cafe.imageUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24"} alt={cafe.name} className="cafe-image" />
                            </div>

                            {/* Cafe Details */}
                            <div className="card-detail-container">
                                <div className="card-detail">
                                    <h2 className="cafe-title">{cafe.name}</h2>

                                    {/* Opening Hours */}
                                    <div className="cafe-detail-item">
                                        <i className="bi bi-clock detail-icon"></i>
                                        <span>{cafe.openingHours || "08:00 - 22:00"}</span>
                                    </div>

                                    {/* Location */}
                                    <div className="cafe-detail-item">
                                        <i className="bi bi-geo-alt-fill detail-icon"></i>
                                        <span>
                                            {cafe.city}, {cafe.address || "Armanian Street Batu Lanchang Pulau Pinang"}
                                        </span>
                                    </div>
                                </div>

                                {/* Status Badge: OPEN vs CLOSE */}
                                {cafe.isOpen ? <div className="status-banner bg-open">OPEN</div> : <div className="status-banner bg-closed">CLOSE</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            {/* Cafe Detail Modal */}
            {selectedCafe && (
                <Modal show={showCafeDetailModal} onHide={handleCloseCafeDetail} size="lg" centered>
                    <Modal.Header closeButton>
                        <div className="d-flex align-items-center justify-content-between w-100 pe-3">
                            <Modal.Title>{selectedCafe.name}</Modal.Title>

                            {/* Bookmark Icon */}
                            {isLoggedIn && <i className={`bi ${isBookmarked ? "bi-bookmark-fill text-warning" : "bi-bookmark"}`} style={{ fontSize: "1.5rem", cursor: "pointer" }} onClick={handleToggleBookmark} title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}></i>}
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                        {/* Cafe Overview */}
                        <div className="mb-4">
                            <div className="cafe-image-container mb-3" style={{ maxHeight: "300px", overflow: "hidden" }}>
                                <img src={selectedCafe.imageUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24"} alt={selectedCafe.name} className="cafe-image w-100" style={{ objectFit: "cover", height: "100%" }} />
                            </div>
                            {selectedCafe.isOpen ? <div className="status-banner bg-open">OPEN</div> : <div className="status-banner bg-closed">CLOSE</div>}
                            <p className="mt-3">
                                <strong>Opening Hours:</strong> {selectedCafe.openingHours || "08:00 - 22:00"}
                            </p>
                            <p>
                                <strong>Location:</strong> {selectedCafe.address}, {selectedCafe.city}
                            </p>
                            <p>
                                <strong>Description:</strong> {selectedCafe.description || "No description available."}
                            </p>
                            <p>
                                <strong>Current Capacity:</strong> {selectedCafe.currentCapacity || "0"} / {selectedCafe.maxCapacityPerSlot}
                            </p>
                        </div>

                        <hr />

                        <div className="mb-4">
                            <h4>Reviews :</h4>
                            <div>
                                {cafeReviews && cafeReviews.length > 0 ? (
                                    cafeReviews.map((rev) => (
                                        <div className="review-box" key={rev._id}>
                                            <p className="review-text">
                                                <strong>User : </strong>
                                                {rev.user?.name || rev.user || "Anonymous"}
                                            </p>
                                            <p className="review-text">
                                                <strong>Rating : </strong>
                                                {rev.rating}⭐
                                            </p>
                                            <p className="review-text">
                                                <strong>Comment : </strong>
                                                {rev.comment}
                                            </p>
                                            <p className="review-text">
                                                <strong>Crowd Report : </strong>
                                                {rev.crowdReport}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="review-box">
                                        <p className="no-review-text">
                                            <strong>No reviews yet. Be the first to leave one!</strong>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <hr />

                        <div>
                            {!isLoggedIn ? (
                                <div className="warning-sign">
                                    <p>Login first to make Reservation or Leave a Review</p>
                                </div>
                            ) : selectedCafe.isOpen ? (
                                <>
                                    {/* Reservation Form */}
                                    <div className="mb-4">
                                        <h4>Make a Reservation</h4>
                                        <Form onSubmit={handleReservationSubmit}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Date</Form.Label>
                                                <Form.Control type="date" value={newReservation.date} onChange={(e) => setNewReservation({ ...newReservation, date: e.target.value })} required />
                                            </Form.Group>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Time</Form.Label>
                                                <Form.Control type="time" value={newReservation.time} onChange={(e) => setNewReservation({ ...newReservation, time: e.target.value })} required />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Number of Guests</Form.Label>
                                                <Form.Control type="number" min="1" max="10" value={newReservation.guests} onChange={(e) => setNewReservation({ ...newReservation, guests: e.target.value })} required />
                                            </Form.Group>
                                            <Button type="submit" variant="primary">
                                                Book Table
                                            </Button>
                                        </Form>
                                    </div>
                                    <hr />
                                    {/* Review Form */}
                                    <div className="mb-3">
                                        <h4>Leave a Review</h4>
                                        <Form onSubmit={handleReviewSubmit}>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Rating</Form.Label>
                                                <Form.Select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}>
                                                    <option value="5">5 Stars</option>
                                                    <option value="4">4 Stars</option>
                                                    <option value="3">3 Stars</option>
                                                    <option value="2">2 Stars</option>
                                                    <option value="1">1 Star</option>
                                                </Form.Select>
                                            </Form.Group>
                                            <Form.Group className="mb-2">
                                                <Form.Label>Crowd Report</Form.Label>
                                                <Form.Select value={newReview.crowdReport} onChange={(e) => setNewReview({ ...newReview, crowdReport: e.target.value })}>
                                                    <option value="quiet">Quiet</option>
                                                    <option value="moderate">Moderate</option>
                                                    <option value="packed">Packed</option>
                                                </Form.Select>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Comment</Form.Label>
                                                <Form.Control as="textarea" rows={3} value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} required />
                                            </Form.Group>
                                            <Button type="submit" variant="success">
                                                Submit Review
                                            </Button>
                                        </Form>
                                    </div>
                                </>
                            ) : (
                                <div className="warning-sign">
                                    <p>Sorry!</p>
                                    <p>Cafe currently closed please try again tomorrow!</p>
                                </div>
                            )}
                        </div>
                    </Modal.Body>
                </Modal>
            )}
        </div>
    );
};

export default Cafes;

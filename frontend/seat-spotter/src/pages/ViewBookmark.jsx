import React, { useState, useEffect } from "react";
import api from "../utils/api";
import Navbar from "../components/navbar";
import "../styles/manage.css";

const ViewBookmarks = () => {
    const [bookmarkedCafes, setBookmarkedCafes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookmarkedCafes();
    }, []);

    const fetchBookmarkedCafes = async () => {
        try {
            const res = await api.get("/users/bookmarks");
            setBookmarkedCafes(res.data || []);
        } catch (err) {
            console.error("Failed to fetch bookmarks:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBookmark = async (e, cafeId) => {
        e.stopPropagation(); // Prevents click bubbling
        try {
            // Optimistic UI Update
            setBookmarkedCafes((prev) => prev.filter((cafe) => cafe._id !== cafeId));

            // Sync with backend bookmark toggle endpoint
            await api.post(`/cafes/${cafeId}/bookmark`);
        } catch (err) {
            console.error("Failed to remove bookmark:", err);
            // Refetch on error to sync back
            fetchBookmarkedCafes();
        }
    };

    if (loading) return <div className="text-center mt-5">Loading bookmarks...</div>;

    return (
        <>
            <Navbar />
            <div className="manage-body">
                <h3 className="manage-title text-center my-4">My Bookmarked Cafes</h3>

                {bookmarkedCafes.length > 0 ? (
                    <main className="card-container">
                        <div className="card-grid">
                            {bookmarkedCafes.map((cafe) => (
                                <div key={cafe._id} className="cafe-card position-relative">
                                    {/* Cafe Image */}
                                    <div className="cafe-image-container">
                                        <img src={cafe.imageUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24"} alt={cafe.name} className="cafe-image" />
                                    </div>

                                    {/* Cafe Details */}
                                    <div className="card-detail-container">
                                        <div className="card-detail">
                                            <h2 className="cafe-title">{cafe.name}</h2>

                                            <div className="cafe-detail-item">
                                                <i className="bi bi-clock detail-icon"></i>
                                                <span>{cafe.openingHours || "08:00 - 22:00"}</span>
                                            </div>

                                            <div className="cafe-detail-item">
                                                <i className="bi bi-geo-alt-fill detail-icon"></i>
                                                <span>
                                                    {cafe.city}, {cafe.address || "Armanian Street Batu Lanchang Pulau Pinang"}
                                                </span>
                                            </div>
                                        </div>

                                        {cafe.isOpen ? <div className="status-banner bg-open">OPEN</div> : <div className="status-banner bg-closed">CLOSE</div>}
                                    </div>

                                    {/* Remove Bookmark Button */}
                                    <div className="p-3">
                                        <button className="btn btn-outline-danger w-100" onClick={(e) => handleRemoveBookmark(e, cafe._id)}>
                                            Remove Bookmark
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
                ) : (
                    <div className="no-result-container text-center mt-5">
                        <p className="no-result">You haven't bookmarked any cafes yet.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default ViewBookmarks;

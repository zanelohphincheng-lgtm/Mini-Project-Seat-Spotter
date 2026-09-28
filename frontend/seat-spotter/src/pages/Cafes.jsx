import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router"
import api from "../utils/api";
import Navbar from "../components/navbar";
import "../styles/cafes.css";

const Cafes = () => {
    const [cafes, setCafes] = useState([]);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchCafes();
    }, []);

    const fetchCafes = async () => {
        try {
            const res = await api.get("http://localhost:5000/cafes");
            setCafes(res.data.data || res.data);
        } catch (err) {
            console.error("Error fetching cafes:", err);
        } finally {
            setLoading(false);
        }
    };

    const cafeDetail = (e) => {
      e.preventDefault()
      navigate(`/cafes/${id}`)
    }

    const initialCafes = [
        {
            id: 1,
            name: "Cafe 1",
            hours: "00:00 - 00:00",
            location: "Location",
            isOpen: true,
            image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80",
            bookmarked: false,
        },
        {
            id: 2,
            name: "Cafe 2",
            hours: "00:00 - 00:00",
            location: "Location",
            isOpen: false,
            image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
            bookmarked: false,
        },
        {
            id: 3,
            name: "Cafe 3",
            hours: "00:00 - 00:00",
            location: "Location",
            isOpen: true,
            image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=600&q=80",
            bookmarked: false,
        },
        {
            id: 4,
            name: "Cafe 4",
            hours: "00:00 - 00:00",
            location: "Location",
            isOpen: true,
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80",
            bookmarked: false,
        },
    ];

    return (
        <div className="cafes-body">
            <Navbar />

            {/* Main Cafe Grid */}
            <main className="card-container">
                {loading ? (
                    <div className="loading-text">Loading cafes...</div>
                ) : (
                    <div className="card-grid">
                        {cafes.map((cafe) => (
                            <div onClick={cafeDetail} key={cafe.id} className="cafe-card">
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
                                            <span>{cafe.city}, {cafe.address || "Armanian Street Batu Lanchang Pulau Pinang"}</span>
                                        </div>
                                    </div>

                                    {/* Status Badge: OPEN vs CLOSE */}
                                    {cafe.isOpen ? (
                                        <div className="status-banner bg-open">
                                            OPEN
                                        </div>
                                    ) : (
                                        <div className="status-banner bg-closed">
                                            CLOSE
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Cafes;

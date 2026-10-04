import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Navbar from "../components/navbar";
import "../styles/cafeDetail.css";
import api from "../utils/api";

const CafeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [cafe, setCafe] = useState(null);

    const [activeTab, setActiveTab] = useState("reviews");
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [seatsLeft, setSeatsLeft] = useState(8);

    useEffect(() => {
        fetchCafeDetail();
    }, []);

    const fetchCafeDetail = async () => {
        try {
            const res = await api.get(`/cafes/${cafe.id}`);
            setCafe(res.data);
        } catch (err) {
            console.error("Error fetching cafe:", err);
        }
    };

    const handleReserve = () => {
        if (seatsLeft > 0) {
            setSeatsLeft((prev) => prev - 1);
            alert("Reservation submitted successfully!");
        }
    };

    if (loading) {
        return "Loading cafe detail";
    }
    return (
        <div className="cafe-detail-body">
            <Navbar />
            <button className="back-btn">
                <i className="bi bi-arrow-left"> Back to cafes</i>
            </button>

            <div className="detail-hero-card">
                <div>
                    <div className="detail-image-container">
                        <img src={cafe.imageUrl} alt="Cafe Image" className="detail-image" />
                    </div>
                    <div>
                        <h1 className="detail-cafe-tile">{cafe.name}</h1>
                        <i className="bi bi-clock "></i>
                        <span>{cafe.openingHours}</span>
                        <i className="bi bi-geo-alt-fill detail-icon"></i>
                        <span>
                            {cafe.city}, {cafe.address || "Armanian Street Batu Lanchang Pulau Pinang"}
                        </span>
                        <div className="status-pill">{cafe.isOpen}</div>
                        <div className="seat-counter-box">Seat Avaible : 0 / {cafe.maxCapacityPerSlot}</div>
                        <div className="display-flex">
                            <button>Reserve A Table</button>
                            <button>
                                <i className="bi bi-bookmark"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <hr />
                <div>
                    <h1>Description : </h1>
                    <p>{cafe.description}</p>
                </div>
                <div>
                    <h1>Reviews : </h1>
                    <p>review placeholder</p>
                </div>
            </div>
        </div>
    );
};

export default CafeDetail;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Navbar from "../components/navbar";
import "../styles/cafeDetail.css";
import api from "../utils/api";

const CafeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [cafe, setCafe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("reviews");
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [seatsLeft, setSeatsLeft] = useState(8);

    useEffect(() => {
        fetchCafeDetail();
    }, []);

    const fetchCafeDetail = async () => {
        try {
            const res = await api.get(`/cafes/${id}`);
            setCafe(res.data.data || res.data);
        } catch (err) {
            console.error("Error fetching cafe:", err);
        } finally {
            setLoading(false);
        }
    };

        const mockCafe = {
            _id: id || "1",
            name: "Cafe 1",
            openingHours: "08:00 - 22:00",
            address: "123 Coffee Street, Downtown",
            isOpen: true,
            imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80",
            description: "A cozy workspace cafe with artisanal roast coffee, fast high-speed Wi-Fi, and abundant power outlets for remote work.",
            amenities: ["High-speed Wi-Fi", "Power Outlets", "Outdoor Seating", "Air Conditioned"],
            reviews: [
                { id: 1, user: "Alex M.", rating: 5, comment: "Great atmosphere and super fast Wi-Fi for remote work!" },
                { id: 2, user: "Sarah T.", rating: 4, comment: "Loved the matcha latte. Gets crowded around 2 PM." },
            ],
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

            {cafe.map((cafeInfo) => (
                <div className="detail-hero-card" key={cafeInfo.id}>
                    <div>
                        <div className="detail-image-container">
                            <img src={cafeInfo.imageUrl} alt="Cafe Image" className="detail-image" />
                        </div>
                        <div>
                            <h1 className="detail-cafe-tile">{cafeInfo.name}</h1>
                            <i className="bi bi-clock "></i>
                            <span>{cafeInfo.openingHours}</span>
                            <i className="bi bi-geo-alt-fill detail-icon"></i>
                            <span>
                                {cafeInfo.city}, {cafeInfo.address || "Armanian Street Batu Lanchang Pulau Pinang"}
                            </span>
                            <div className="status-pill">{cafeInfo.isOpen}</div>
                            <div className="seat-counter-box">
                                Seat Avaible : 0 / {cafeInfo.maxCapacityPerSlot}
                            </div>
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
                        <p>{cafeInfo.description}</p>
                    </div>
                    <div>
                        <h1>Reviews : </h1>
                        <p>review placeholder</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CafeDetail;

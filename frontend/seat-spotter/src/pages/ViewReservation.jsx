import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Modal, Button } from "react-bootstrap";
import api from "../utils/api";
import "../styles/manage.css";

const ViewReservation = () => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const navigate = useNavigate();

    // Kick out unauthenticated users
    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    if (!user) {
        return null;
    }

    const [reservations, setReservations] = useState([]);
    const [search, setSearch] = useState("");
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState({});

    useEffect(() => {
        fetchUserReservations();
    }, []);

    const fetchUserReservations = async () => {
        try {
            const res = await api.get("/reservations");
            setReservations(res.data.data);
        } catch (err) {
            console.error("Failed to fetch reservations:", err);
        }
    };

    // Filter reservations by search term
    const filteredReservations = Array.isArray(reservations)
        ? reservations.filter((r) => {
              const query = search.toLowerCase();
              const cafeName = (r.cafe?.name || r.cafe || "").toString().toLowerCase();
              const bookingDate = (r.bookingDate || "").toString().toLowerCase();
              const timeSlot = (r.timeSlot || "").toString().toLowerCase();
              const partySize = (r.partySize || "").toString().toLowerCase();
              const status = (r.status || "").toString().toLowerCase();

              return cafeName.includes(query) || bookingDate.includes(query) || timeSlot.includes(query) || partySize.includes(query) || status.includes(query);
          })
        : [];

    const handleOpenViewModal = (reservation) => {
        setSelectedReservation(reservation);
        setShowViewModal(true);
    };

    const handleCloseView = () => setShowViewModal(false);

    return (
        <div className="manage-body">
            <div className="top-section-container">
                <h3 className="manage-title">My Reservations</h3>
                <Link to="/dashboard" className="manage-back-btn">
                    <i className="bi bi-arrow-left"></i>
                    <p className="manage-back-text">Back to dashboard</p>
                </Link>
            </div>

            <div className="search-bar-container">
                <i className="bi bi-search search-icon"></i>
                <input required className="search-input" type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cafe, date, status..." />
            </div>

            <div className="manage-table-card">
                <table className="manage-table">
                    <thead>
                        <tr>
                            <th className="first-column">No.</th>
                            <th className="second-column">Cafe</th>
                            <th className="forth-column-v2">Booking Date</th>
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
                                    <td className="second-column">{reservation.cafe?.name || reservation.cafe || "N/A"}</td>
                                    <td className="forth-column-v2">{reservation.bookingDate?.split("T")[0] || ""}</td>
                                    <td className="fifth-column">{reservation.timeSlot}</td>
                                    <td className="sixth-column">{reservation.partySize}</td>
                                    <td className="seventh-column">
                                        <span className={reservation.status === "confirmed" ? "status-pill-confirmed" : reservation.status === "pending" ? "status-pill-pending" : "status-pill-cancelled"}>{reservation.status}</span>
                                    </td>
                                    <td className="final-column">
                                        <Button onClick={() => handleOpenViewModal(reservation)} className="action-icon-btn btn-view" title="View Details">
                                            <i className="bi bi-eye"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    <p className="no-result">No Reservations Found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
                <h3 colSpan="7" className="text-center py-4 hint-text">Browse through the cafe and make reservation!</h3>

            {/* View Reservation Detail Modal */}
            <Modal show={showViewModal} onHide={handleCloseView} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reservation Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="reservation-details">
                        <p>
                            <strong>Reservation ID:</strong> {selectedReservation._id}
                        </p>
                        <p>
                            <strong>Cafe:</strong> {selectedReservation.cafe?.name || selectedReservation.cafe}
                        </p>
                        <p>
                            <strong>Booking Date:</strong> {selectedReservation.bookingDate?.split("T")[0]}
                        </p>
                        <p>
                            <strong>Time Slot:</strong> {selectedReservation.timeSlot}
                        </p>
                        <p>
                            <strong>Party Size:</strong> {selectedReservation.partySize} people
                        </p>
                        <p>
                            <strong>Status:</strong> <span className={selectedReservation.status === "confirmed" ? "status-confirmed" : selectedReservation.status === "pending" ? "status-pending" : "status-cancelled"}>{selectedReservation.status}</span>
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseView}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ViewReservation;

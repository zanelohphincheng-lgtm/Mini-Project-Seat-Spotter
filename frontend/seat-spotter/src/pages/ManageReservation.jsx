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
    const [showViewModal, setShowViewModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Add options states at the top of ManageReservation component
    const [cafesList, setCafesList] = useState([]);
    const [usersList, setUsersList] = useState([]);

    // Initial state structures for reservation forms
    const [newReservation, setNewReservation] = useState({
        cafe: "",
        user: "",
        bookingDate: "",
        timeSlot: "",
        partySize: 1,
        status: "pending",
    });

    const [selectedReservation, setSelectedReservation] = useState({
        _id: "",
        cafe: "",
        user: "",
        bookingDate: "",
        timeSlot: "",
        partySize: 1,
        status: "pending",
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
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
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
              const userName = (r.user?.name || r.user || "").toString().toLowerCase();
              const bookingDate = (r.bookingDate || "").toString().toLowerCase();
              const timeSlot = (r.timeSlot || "").toString().toLowerCase();
              const partySize = (r.partySize || "").toString().toLowerCase();
              const status = (r.status || "").toString().toLowerCase();

              return cafeName.includes(query) || userName.includes(query) || bookingDate.includes(query) || timeSlot.includes(query) || partySize.includes(query) || status.includes(query);
          })
        : [];

    // --- Modal Handlers ---
    const handleOpenViewModal = (reservation) => {
        setSelectedReservation(reservation);
        setShowViewModal(true);
    };

    const handleOpenAddModal = () => {
        setNewReservation({
            cafe: cafesList[0]?._id || "",
            user: usersList[0]?._id || "",
            bookingDate: "",
            timeSlot: "12:00",
            partySize: 1,
            status: "pending",
        });
        setShowAddModal(true);
    };

    const handleOpenEditModal = (reservation) => {
        setSelectedReservation({
            _id: reservation._id,
            cafe: reservation.cafe?._id || reservation.cafe || "",
            user: reservation.user?._id || reservation.user || "",
            bookingDate: reservation.bookingDate?.split("T")[0] || "",
            timeSlot: reservation.timeSlot || "",
            partySize: reservation.partySize || 1,
            status: reservation.status || "pending",
        });
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (reservation) => {
        setSelectedReservation(reservation);
        setShowDeleteModal(true);
    };

    // Handle close
    const handleCloseView = () => setShowViewModal(false);
    const handleCloseAdd = () => setShowAddModal(false);
    const handleCloseEdit = () => setShowEditModal(false);
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
            const updatedList = reservations.filter((r) => r._id !== selectedReservation._id);
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
                            <th className="thrid-column-v2">User</th>
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
                                    <td className="thrid-column-v2">{reservation.user?.name || reservation.user || "N/A"}</td>
                                    <td className="forth-column-v2">{reservation.bookingDate?.split("T")[0] || ""}</td>
                                    <td className="fifth-column">{reservation.timeSlot}</td>
                                    <td className="sixth-column">{reservation.partySize}</td>
                                    <td className="seventh-column">
                                        <span className={reservation.status === "confirmed" ? "status-pill-confirmed" : reservation.status === "pending" ? "status-pill-pending" : "status-pill-cancelled"}>{reservation.status}</span>
                                    </td>
                                    <td className="final-column">
                                        <Button onClick={() => handleOpenViewModal(reservation)} className="action-icon-btn btn-view">
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
                            <strong>User:</strong> {selectedReservation.user?.name || selectedReservation.user}
                        </p>
                        <p>
                            <strong>Email:</strong> {selectedReservation.user?.email || "N/A"}
                        </p>
                        <p>
                            <strong>Booking Date:</strong> {selectedReservation.bookingDate}
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

            {/* Add Reservation Modal */}
            <Modal show={showAddModal} onHide={handleCloseAdd} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Reservation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddReservation}>
                        <Form.Group className="mb-3">
                            <Form.Label>Cafe :</Form.Label>
                            <Form.Select required value={newReservation.cafe} onChange={(e) => setNewReservation({ ...newReservation, cafe: e.target.value })}>
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
                            <Form.Select required value={newReservation.user} onChange={(e) => setNewReservation({ ...newReservation, user: e.target.value })}>
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
                            <Form.Label>Booking Date :</Form.Label>
                            <Form.Control required type="date" value={newReservation.bookingDate} onChange={(e) => setNewReservation({ ...newReservation, bookingDate: e.target.value })} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Time Slot :</Form.Label>
                            <Form.Control required type="time" value={newReservation.timeSlot} onChange={(e) => setNewReservation({ ...newReservation, timeSlot: e.target.value })} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Party Size :</Form.Label>
                            <Form.Control required type="number" min="1" value={newReservation.partySize} onChange={(e) => setNewReservation({ ...newReservation, partySize: e.target.value })} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Status :</Form.Label>
                            <Form.Select value={newReservation.status} onChange={(e) => setNewReservation({ ...newReservation, status: e.target.value })}>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                            </Form.Select>
                        </Form.Group>

                        <Button className="submit-btn w-100 mt-2" type="submit">
                            Add Reservation
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Edit Reservation Modal */}
            <Modal show={showEditModal} onHide={handleCloseEdit} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Update Reservation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpdateReservation}>
                        <Form.Group className="mb-3">
                            <Form.Label>Cafe :</Form.Label>
                            <Form.Select required value={selectedReservation.cafe || ""} onChange={(e) => setSelectedReservation({ ...selectedReservation, cafe: e.target.value })}>
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
                            <Form.Select required value={selectedReservation.user || ""} onChange={(e) => setSelectedReservation({ ...selectedReservation, user: e.target.value })}>
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
                            <Form.Label>Booking Date :</Form.Label>
                            <Form.Control required type="date" value={selectedReservation.bookingDate || ""} onChange={(e) => setSelectedReservation({ ...selectedReservation, bookingDate: e.target.value })} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Time Slot :</Form.Label>
                            <Form.Control required type="time" value={selectedReservation.timeSlot || ""} onChange={(e) => setSelectedReservation({ ...selectedReservation, timeSlot: e.target.value })} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Party Size :</Form.Label>
                            <Form.Control required type="number" min="1" value={selectedReservation.partySize || 1} onChange={(e) => setSelectedReservation({ ...selectedReservation, partySize: e.target.value })} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Status :</Form.Label>
                            <Form.Select value={selectedReservation.status || "pending"} onChange={(e) => setSelectedReservation({ ...selectedReservation, status: e.target.value })}>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                            </Form.Select>
                        </Form.Group>

                        <Button className="submit-btn w-100 mt-2" type="submit">
                            Update Reservation
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Reservation Modal */}
            <div className="modal-container">
                <Modal show={showDeleteModal} onHide={handleCloseDelete}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete Reservation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleDeleteReservation}>
                            <div className="delete-form">
                                <h3>Are you sure you want to delete this reservation?</h3>
                                <p>Once deleted, this reservation will be gone forever.</p>
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

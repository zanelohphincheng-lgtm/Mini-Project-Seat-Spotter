import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../utils/api";
import "../styles/manage.css";

const ManageCafe = () => {
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
    const [cafes, setCafes] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Modal Visibility States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form Inputs for Modals
    const [newCafe, setNewCafe] = useState({ name: "", address: "", city: "", openingHours: "", isOpen: true, currentCapacity: 0, maxCapacityPerSlot: 20, description: "", imageUrl: "" });
    const [selectedCafe, setSelectedCafe] = useState({ name: "", address: "", city: "", openingHours: "", isOpen: true, currentCapacity: 0, maxCapacityPerSlot: 20, description: "", imageUrl: "" });

    useEffect(() => {
        fetchCafes();
    }, []);

    const fetchCafes = async () => {
        try {
            const res = await api.get("/cafes");
            setCafes(res.data.data || res.data);
        } catch (err) {
            console.error("Failed to fetch cafes:", err);
        } finally {
            setLoading(false);
        }
    };

    // Filter cafes by search term
    const filteredCafes = cafes.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()) || c.address?.toLowerCase().includes(search.toLowerCase()));

    // --- Modal Handlers ---
    const handleOpenAddModal = () => {
        setNewCafe({ name: "", address: "", city: "", openingHours: "", isOpen: true, currentCapacity: 0, maxCapacityPerSlot: 20, description: "", imageUrl: "" });
        setShowAddModal(true);
    };

    const handleOpenEditModal = (cafe) => {
        setSelectedCafe(cafe);
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (cafe) => {
        setSelectedCafe(cafe);
        setShowDeleteModal(true);
    };

    // Handle close
    const handleCloseAdd = () => setShowAddModal(false);
    const handleCloseEdit = () => setShowEditModal(false);
    const handleCloseDelete = () => setShowDeleteModal(false);

    // --- API Action Submit Functions ---
    const handleAddCafe = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/cafes`, newCafe);
            await fetchCafes();
            alert(`New cafe has been added!`);
            setShowAddModal(false);
        } catch (err) {
            console.error("Failed to add cafe:", err);
            alert("Error adding new cafe.");
        }
    };

    const handleUpdateCafe = async (e) => {
        e.preventDefault();
        if (!selectedCafe._id) {
            alert("Error: Cafe ID is missing!");
            return;
        }
        try {
            await api.put(`/cafes/${selectedCafe._id}`, selectedCafe);
            await fetchCafes();
            alert("Cafe updated successfully!");
            setShowEditModal(false);
        } catch (err) {
            console.error("Failed to update cafe:", err);
            alert("Error updating cafe info.");
        }
    };

    const handleDeleteCafe = async (e) => {
        e.preventDefault();
        if (!selectedCafe._id) {
            alert("Error: Cafe ID is missing!");
            return;
        }
        try {
            await api.delete(`/cafes/${selectedCafe._id}`);
            const updatedList = cafes.filter((c) => c._id !== selectedCafe._id)
            setCafes(updatedList);
            alert("Cafe deleted successfully!");
            setShowDeleteModal(false);
        } catch (err) {
            console.error("Failed to delete cafe:", err);
            alert("Error deleting cafe.");
        }
    };

    return (
        <div className="manage-body">
            <div className="top-section-container">
                <Link to="/dashboard" className="manage-back-btn">
                    <i className="bi bi-arrow-left"></i>
                    <p className="manage-back-text">Back to dashboard</p>
                </Link>
                <Button onClick={() => handleOpenAddModal(newCafe)} className="manage-add-btn">
                    <i className="bi bi-plus-circle"></i>
                    <p className="manage-add-text">Add New Cafe</p>
                </Button>
            </div>

            <h3 className="manage-title">Manage Cafe</h3>
            <div className="search-bar-container">
                <i className="bi bi-search search-icon"></i>
                <input required className="search-input" type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cafe Meow Meow :)" />
            </div>

            <div className="manage-table-card">
                <table className="manage-table-v2">
                    <thead>
                        <tr>
                            <th className="column-1">No.</th>
                            <th className="column-2">Cafe Name</th>
                            <th className="column-3">Address</th>
                            <th className="column-4">City</th>
                            <th className="column-5">Opening Hours</th>
                            <th className="column-6">Status</th>
                            <th className="column-7">Current Capacity</th>
                            <th className="column-8">Max Capacity</th>
                            <th className="column-9">Description</th>
                            <th className="column-10">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCafes && filteredCafes.length > 0 ? (
                            filteredCafes.map((cafe, index) => (
                                <tr className="border-bottom border-dark" key={cafe._id}>
                                    <td className="column-1">{index + 1}.</td>
                                    <td className="column-2">{cafe.name}</td>
                                    <td className="column-3">{cafe.address}</td>
                                    <td className="column-4">{cafe.city}</td>
                                    <td className="column-5">{cafe.openingHours}</td>
                                    <td className="column-6">
                                        <div className={cafe.isOpen ? "status-open" : "status-close"}>
                                            {cafe.isOpen ? "Open" : "Close"}
                                        </div>
                                    </td>
                                    <td className="column-7">{cafe.currentCapacity}</td>
                                    <td className="column-8">{cafe.maxCapacityPerSlot}</td>
                                    <td className="column-9">{cafe.description}</td>
                                    <td className="column-10">
                                        <Button onClick={() => handleOpenEditModal(cafe)} className="action-icon-btn btn-pencil">
                                            <i className="bi bi-pencil"></i>
                                        </Button>
                                        <Button onClick={() => handleOpenDeleteModal(cafe)} className="action-icon-btn btn-trash">
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>
                                    <p className="no-result">No Cafe Found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Add Cafe Modal */}
            <div className="modal-container">
                <Modal show={showAddModal} onHide={handleCloseAdd}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Cafe</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleAddCafe}>
                            <div className="modal-form-input">
                                <label>Name :</label>
                                <input required type="text" placeholder="Name" value={newCafe.name} onChange={(e) => setNewCafe({ ...newCafe, name: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Address :</label>
                                <input required type="text" placeholder="Address" value={newCafe.address} onChange={(e) => setNewCafe({ ...newCafe, address: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>City :</label>
                                <input required type="text" placeholder="City" value={newCafe.city} onChange={(e) => setNewCafe({ ...newCafe, city: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Opening Hour :</label>
                                <input required type="text" placeholder="00:00 - 00:00" value={newCafe.openingHours} onChange={(e) => setNewCafe({ ...newCafe, openingHours: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Status :</label>
                                <select required value={newCafe.isOpen} onChange={(e) => setNewCafe({ ...newCafe, isOpen: e.target.value === "true" })}>
                                    <option value="" disabled>
                                        Select Status
                                    </option>
                                    <option value="true">OPEN</option>
                                    <option value="false">CLOSE</option>
                                </select>
                            </div>
                            <div className="modal-form-input">
                                <label>Current Capacity :</label>
                                <input required min={0} type="text" placeholder="Current Capacity" value={newCafe.currentCapacity} onChange={(e) => setNewCafe({ ...newCafe, currentCapacity: Number(e.target.value) })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Max Capacity :</label>
                                <input required min={5} type="text" placeholder="Max Capacity" value={newCafe.maxCapacityPerSlot} onChange={(e) => setNewCafe({ ...newCafe, maxCapacityPerSlot: Number(e.target.value) })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Description :</label>
                                <input required type="text" placeholder="Description" value={newCafe.description} onChange={(e) => setNewCafe({ ...newCafe, description: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Image URL :</label>
                                <input type="url" placeholder="Image URL" value={newCafe.imageUrl} onChange={(e) => setNewCafe({ ...newCafe, imageUrl: e.target.value })} />
                            </div>
                            <button className="submit-btn" type="submit">
                                Add Cafe
                            </button>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>

            {/* Edit Cafe Modal */}
            <div className="modal-container">
                <Modal show={showEditModal} onHide={handleCloseEdit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Update Cafe</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleUpdateCafe}>
                            <div className="modal-form-input">
                                <label>Name</label>
                                <input required type="text" placeholder="Name" value={selectedCafe.name || ""} onChange={(e) => setSelectedCafe({ ...selectedCafe, name: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Address</label>
                                <input required type="text" placeholder="Address" value={selectedCafe.address || ""} onChange={(e) => setSelectedCafe({ ...selectedCafe, address: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>City</label>
                                <input required type="text" placeholder="City" value={selectedCafe.city || ""} onChange={(e) => setSelectedCafe({ ...selectedCafe, city: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Opening Hours</label>
                                <input required type="text" placeholder="00:00 - 00:00" value={selectedCafe.openingHours || ""} onChange={(e) => setSelectedCafe({ ...selectedCafe, openingHours: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Status</label>
                                <select required value={selectedCafe.isOpen} onChange={(e) => setSelectedCafe({ ...selectedCafe, isOpen: e.target.value === "true" })}>
                                    <option value="" disabled>
                                        Select Status
                                    </option>
                                    <option value="true">OPEN</option>
                                    <option value="false">CLOSE</option>
                                </select>
                            </div>
                            <div className="modal-form-input">
                                <label>Current Capacity</label>
                                <input required min={0} type="number" placeholder="Current Capacity" value={selectedCafe.currentCapacity || ""} onChange={(e) => setSelectedCafe({ ...selectedCafe, currentCapacity: Number(e.target.value) })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Max Capacity</label>
                                <input required min={5} type="number" placeholder="Max Capacity" value={selectedCafe.maxCapacityPerSlot || ""} onChange={(e) => setSelectedCafe({ ...selectedCafe, maxCapacityPerSlot: Number(e.target.value) })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Description</label>
                                <input required type="text" placeholder="Description" value={selectedCafe.description || ""} onChange={(e) => setSelectedCafe({ ...selectedCafe, description: e.target.value })} />
                            </div>
                            <div className="modal-form-input">
                                <label>Image URL</label>
                                <input type="url" placeholder="Image URL" value={selectedCafe.imageUrl || ""} onChange={(e) => setSelectedCafe({ ...selectedCafe, imageUrl: e.target.value })} />
                            </div>
                            <button className="submit-btn" type="submit">
                                Update Cafe
                            </button>
                        </form>
                    </Modal.Body>
                </Modal>
            </div>

            {/* Delete Cafe Modal */}
            <div className="modal-container">
                <Modal show={showDeleteModal} onHide={handleCloseDelete}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete {selectedCafe.name}?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleDeleteCafe}>
                            <div className="delete-form">
                                <h3>Are you sure you want to delete {selectedCafe.name}?</h3>
                                <p>Once deleted all data related to {selectedCafe.name} will be gone forever.</p>
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

export default ManageCafe;

import { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import "./UserDashboard.css";
import Cart from "./extra/Cart";
import MyOrder from "./extra/MyOrder";
import Categories from "./extra/Categories";

function UserDashboard() {
    const [currentView, setCurrentView] = useState("home");
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState("");
    const [listOfCategories, setListOfCategories] = useState([]);
    const [cartNotification, setCartNotification] = useState("");

    const addToCart = (product) => {
        const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingProductIndex = existingCart.findIndex((item) => item._id === product._id);
        if (existingProductIndex > -1) {
            existingCart[existingProductIndex].quantity = (existingCart[existingProductIndex].quantity || 1) + 1;
        } else {
            existingCart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem("cart", JSON.stringify(existingCart));
        setCartNotification("Product Added To Cart!");
        setTimeout(() => setCartNotification(""), 3000);
    };

    // Modals visibility state
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleCloseEdit = () => setShowEditModal(false);
    const handleCloseAdd = () => setShowAddModal(false);

    // Form states
    const [currentProduct, setCurrentProduct] = useState({ name: "", description: "", price: "", category: "" });
    const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", category: "" });

    const fetchProducts = async () => {
        const params = new URLSearchParams();
        if (category !== "") params.append("category", category);

        const result = await fetch(`http://localhost:5000/product?${params.toString()}`);
        const products = await result.json();
        setProducts(products);
    };

    const fetchAllCategories = async () => {
        const result = await fetch(`http://localhost:5000/product/category`);
        const categories = await result.json();
        setListOfCategories(categories);
    };

    // Add Product Handler
    const addProduct = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProduct),
            });
            const data = await response.json();
            setProducts([...products, data]);
            setNewProduct({ name: "", description: "", price: "", category: "" });
            setShowAddModal(false);
        } catch (err) {
            console.error("Error adding product:", err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchAllCategories();
    }, [category]);

    // Update Product Handler
    const updateProduct = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/product/${currentProduct._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentProduct),
            });
            const data = await response.json();
            setProducts(products.map((prod) => (prod._id === currentProduct._id ? data : prod)));
            setShowEditModal(false);
        } catch (err) {
            console.error("Error updating product:", err);
        }
    };

    // Delete Product Handler
    const deleteProduct = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/product/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setProducts(products.filter((prod) => prod._id !== id));
            }
        } catch (err) {
            console.error("Error deleting product:", err);
        }
    };

    // Open Edit Modal
    const handleShowEdit = (product) => {
        setCurrentProduct(product);
        setShowEditModal(true);
    };

    const handleCategoryChange = (e) => {
        const categorySelected = e.target.value;
        setCategory(categorySelected);
    };

    // Render helper function keeps JSX clean
    const renderView = () => {
        if (currentView === "cart") {
            return <Cart onNavigateHome={() => setCurrentView("home")} onNavigateCart={() => setCurrentView("cart")} onNavigateMyOrder={() => setCurrentView("my-order")} onNavigateCategories={() => setCurrentView("categories")} />;
        }

        if (currentView === "my-order") {
            return <MyOrder onNavigateHome={() => setCurrentView("home")} onNavigateCart={() => setCurrentView("cart")} onNavigateMyOrder={() => setCurrentView("my-order")} onNavigateCategories={() => setCurrentView("categories")} />;
        }

        if (currentView === "categories") {
            return <Categories onNavigateHome={() => setCurrentView("home")} onNavigateCart={() => setCurrentView("cart")} onNavigateMyOrder={() => setCurrentView("my-order")} onNavigateCategories={() => setCurrentView("categories")} />
        }

        return (
            <div>
                <div className="container">
                    <h1 className="title">Welcome to My Store</h1>
                    <hr />
                    <br />

                    {/* Navigation Bar */}
                    <div className="top-button">
                        <Button className={`home-button ${currentView === "home" ? "active" : ""}`} onClick={() => setCurrentView("home")}>
                            Home
                        </Button>
                        <Button className={`cart-button ${currentView === "cart" ? "active" : ""}`} onClick={() => setCurrentView("cart")}>
                            Cart
                        </Button>
                        <Button className={`my-order-button ${currentView === "my-order" ? "active" : ""}`} onClick={() => setCurrentView("my-order")}>
                            My Order
                        </Button>
                        <Button className={`categories-button ${currentView === "categories" ? "active" : ""}`} onClick={() => setCurrentView("categories")}>
                            Categories
                        </Button>
                    </div>

                    <div className="controls">
                        <div className="filter-group">
                            <label htmlFor="category" className="product-title">
                                Products{" "}
                            </label>
                            <br />
                            <select id="category" value={category} onChange={(e) => handleCategoryChange(e)}>
                                <option value="">All Categories</option>
                                {listOfCategories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className="btn-add" onClick={() => setShowAddModal(true)}>
                            Add New
                        </button>
                    </div>

                    <div className="product-grid">
                        {products.map((product) => (
                            <div key={product._id} className="card">
                                <h3 className="card-title">{product.title || product.name}</h3>

                                <div className="card-details">
                                    <span className="price">${product.price}</span>
                                    <span className={`badge ${product.category ? product.category.toLowerCase() : ""}`}>{product.category ? product.category.toUpperCase() : ""}</span>
                                </div>

                                <button className="btn-cart" onClick={() => addToCart(product)}>
                                    Add To Cart
                                </button>

                                <div className="card-actions">
                                    <Button className="btn-edit" onClick={() => handleShowEdit(product)}>
                                        Edit
                                    </Button>
                                    <Button className="btn-delete" onClick={() => deleteProduct(product._id)}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {cartNotification && (
                        <div className="alert alert-success mt-3" style={{ position: "fixed", bottom: "20px", right: "20px" }}>
                            {cartNotification}
                        </div>
                    )}
                </div>

                {/* Edit Product Modal */}
                <div className="container">
                    <Modal show={showEditModal} onHide={handleCloseEdit}>
                        <Modal.Header closeButton>
                            <Modal.Title>Update Product</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form onSubmit={updateProduct}>
                                <input type="text" placeholder="Name" value={currentProduct.name || ""} onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })} />
                                <input type="text" placeholder="Description" value={currentProduct.description || ""} onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })} />
                                <input type="number" placeholder="Price" value={currentProduct.price || ""} onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })} />
                                <select value={currentProduct.category} onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}>
                                    <option value="" disabled>
                                        Select Category
                                    </option>
                                    {listOfCategories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <button type="submit">Update Product</button>
                            </form>
                        </Modal.Body>
                    </Modal>
                </div>

                {/* Add Product Modal */}
                <div className="container">
                    <Modal show={showAddModal} onHide={handleCloseAdd}>
                        <Modal.Header closeButton>
                            <Modal.Title>Add New Product</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form onSubmit={addProduct}>
                                <input type="text" placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                                <input type="text" placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
                                <input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                                <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>
                                    <option value="" disabled>
                                        Select Category
                                    </option>
                                    {listOfCategories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <button type="submit">Add Product</button>
                            </form>
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        );
    };

    return <>{renderView()}</>;
}

export default UserDashboard;

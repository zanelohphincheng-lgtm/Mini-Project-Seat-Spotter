const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require('./routes/userRoutes')
const cafeRoutes = require('./routes/cafeRoutes')
const reservationRoutes = require('./routes/reservationRoutes')
const reviewRoutes = require('./routes/reviewRoutes')

require("dotenv").config();

const corsHandler = cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
    preflightContinue: true,
});

app.use(corsHandler);

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => console.log(err));

app.use("/users", userRoutes);
app.use("/cafes", cafeRoutes);
app.use("/reviews", reviewRoutes);
app.use("/reservations", reservationRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

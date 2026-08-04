require("dotenv").config()
const { connectDB } = require('./config/db');
const express = require('express');
const cors = require("cors")

const auth = require("./routes/auth")
const products = require("./routes/products")
const orders = require("./routes/orders")

// ye MongoDB ka server k liye ha jb connect na ho different Locations py to ye code 2 lines use krna ha.
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"])

const app = express();


app.use(cors())
app.use(express.json())

connectDB()

app.use("/api/auth", auth)
app.use("/api/products", products)
app.use("/api/orders", orders)

const { PORT = 8000 } = process.env

app.get("/", (req, res) => {
  res.send("Server is running")
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
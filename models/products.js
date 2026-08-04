const mongoose = require("mongoose")
const { Schema, model } = mongoose

const schema = new Schema({
    id: { type: String, required: true, unique: true },
    uid: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    imageURL: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { timestamps: true })

const Products = new model("products", schema)

module.exports = Products

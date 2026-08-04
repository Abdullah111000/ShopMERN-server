const mongoose = require("mongoose")
const { Schema, model } = mongoose

const schema = new Schema({
    id: { type: String, required: true, unique: true },
    uid: { type: String, required: true },
    products: [{
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        imageURL: { type: String, required: true }
    }],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    status: { type: String, enum: ["pending", "shipped", "delivered", "cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
}, { timestamps: true })

const Orders = new model("orders", schema)

module.exports = Orders
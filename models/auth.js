const mongoose = require("mongoose")
const { Schema, model } = mongoose

const schema = new Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true })

const Users = new model("users", schema)

module.exports = Users
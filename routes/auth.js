const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const Users = require("../models/auth")
const { verifyToken } = require("../middlewares/auth")
const { getRandomId } = require("../config/global")

const router = express.Router()

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body

        const user = await Users.findOne({ email })
        if (user) { return res.status(401).json({ message: "Email is already in use.", isError: true }) }

        const hashedPassword = await bcrypt.hash(password, 10)

        const userData = { uid: getRandomId(), name, email, password: hashedPassword }
        const newUser = new Users(userData)
        await newUser.save()

        res.status(201).json({ message: "A new user has been successfully created", user: newUser })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", isError: true })

    }
})


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await Users.findOne({ email })
        if (!user) { return res.status(401).json({ message: "Invalid email or password", isError: true }) }

        if (user.status === "inactive") { return res.status(401).json({ message: "Your account is inactive", isError: true }) }

        const match = await bcrypt.compare(password, user.password)
        if (match) {
            const { uid, role } = user

            const token = jwt.sign({ uid, role }, process.env.JWT_SECRET, { expiresIn: "1d" })
            res.status(200).json({ message: "Login successful", token, user })
        } else {
            return res.status(401).json({ message: "Invalid email or password", isError: true })
        }

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})

// get single user for user dashboard
router.get("/user", verifyToken, async (req, res) => {
    try {
        const { uid } = req
        const user = await Users.findOne({ uid })
        if (!user) { return res.status(401).json({ message: "User not found", isError: true }) }

        res.status(200).json({ message: "User found", user })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})

// all users show on admin dashboard if role is admin only 
router.get("/all-users", verifyToken, async (req, res) => {
    try {
        const { uid } = req
        const user = await Users.findOne({ uid })
        if (!user || user.role !== "admin") { return res.status(401).json({ message: "You are not authorized to perform this action", isError: true }) }

        const users = await Users.find({})
        res.status(200).json({ message: "Users found", users })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})

// get single user if role is admin only for update user
router.get("/user/:id", verifyToken, async (req, res) => {
    try {
        const { uid } = req;

        const admin = await Users.findOne({ uid });

        if (!admin || admin.role !== "admin") { return res.status(401).json({ message: "You are not authorized", isError: true, }); }

        const { id } = req.params;

        const user = await Users.findOne({ uid: id });
        if (!user) { return res.status(404).json({ message: "User not found", isError: true, }); }

        res.status(200).json({ message: "User found", user, });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", isError: true, });
    }
});


router.patch("/update-user/:id", verifyToken, async (req, res) => {
    try {
        const { uid } = req;

        const admin = await Users.findOne({ uid });

        if (!admin || admin.role !== "admin") { return res.status(401).json({ message: "You are not authorized", isError: true, }); }

        const { role, status } = req.body;
        const { id } = req.params;
        const updatedUser = await Users.findOneAndUpdate({ uid: id }, { role, status }, { returnDocument: "after" });

        if (!updatedUser) { return res.status(404).json({ message: "User not found", isError: true, }); }

        res.status(200).json({ message: "User updated successfully", updatedUser, });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", isError: true, });
    }
});

// delete user
router.delete("/delete-user/:id", verifyToken, async (req, res) => {
    try {
        const { uid } = req
        const user = await Users.findOne({ uid })
        if (!user || user.role !== "admin") { return res.status(401).json({ message: "You are not authorized to perform this action", isError: true }) }

        const { id } = req.params
        const deletedUser = await Users.findOneAndDelete({ uid: id })
        res.status(200).json({ message: "User deleted successfully", deletedUser })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})

module.exports = router


























const express = require("express")
const Products = require("../models/products")
const router = express.Router()
const cloudinary = require("../config/cloudinary")
const { verifyToken } = require("../middlewares/auth")
const { getRandomId } = require("../config/global")
const multer = require("multer")

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post("/create", verifyToken, upload.fields([{ name: "image" }]), async (req, res) => {
    try {
        const formData = req.body

        let imageURL = "", imagePublicId = ""

        if (req.files["image"] && req.files["image"][0]) {
            await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "ShopMERN/products/images/" },
                    (error, result) => {
                        if (error) {
                            return reject(error)
                        }

                        imageURL = result.secure_url
                        imagePublicId = result.public_id
                        resolve()
                    }
                )

                uploadStream.end(req.files["image"][0].buffer)
            })
        }

        const { name, price, stock, category, description } = formData
        const { uid } = req
        const id = getRandomId()

        const productData = { id, uid, name, price, stock, category, description, imageURL, imagePublicId }

        const product = new Products(productData)
        await product.save()

        res.status(201).json({ message: "A new product has been successfully created", product })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})



router.get("/all", verifyToken, async (req, res) => {
    try {
        const { role } = req
        if (role !== "admin") { return res.status(401).json({ message: "Unauthorized to access this feature.", isError: true }) }

        const products = await Products.find()
        res.status(200).json({ message: "Products fetched successfully", products })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})
 

router.get("/public-all", async (req, res) => {
    try {
        const products = await Products.find()
        res.status(200).json({ message: "Products fetched successfully", products })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})



router.get("/single/:id", verifyToken, async (req, res) => {
    try {
        const { role } = req
        if (role !== "admin") { return res.status(401).json({ message: "Unauthorized to access this feature.", isError: true }) }

        const { id } = req.params
        const product = await Products.findOne({ id })
        if (!product) { return res.status(404).json({ message: "Product not found", isError: true }) }

        res.status(200).json({ message: "Product fetched successfully", product })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})



router.patch("/update/:id", verifyToken, async (req, res) => {
    try {
        const { role } = req
        if (role !== "admin") { return res.status(401).json({ message: "Unauthorized to access this feature.", isError: true }) }

        const { id } = req.params

        const { name, price, stock, category, description } = req.body
        const productData = { name, price, stock, category, description }

        const updatedProduct = await Products.findOneAndUpdate({ id }, productData, { returnDocument: "after" })
        if (!updatedProduct) { return res.status(404).json({ message: "Product not found", isError: true }) }

        res.status(200).json({ message: "Product updated successfully", product: updatedProduct })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})

router.delete("/delete/:id", verifyToken, async (req, res) => {
    try {
        const { role } = req
        if (role !== "admin") { return res.status(401).json({ message: "Unauthorized to access this feature.", isError: true }) }

        const { id } = req.params
        const product = await Products.findOne({ id })
        if (!product) { return res.status(404).json({ message: "Product not found", isError: true }) }

        await cloudinary.uploader.destroy(product.imagePublicId)
        await product.deleteOne()

        res.status(200).json({ message: "Product deleted successfully", product })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})

module.exports = router

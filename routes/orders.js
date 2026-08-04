const express = require("express")
const router = express.Router()
const Orders = require("../models/orders")
const Products = require("../models/products")
const { verifyToken } = require("../middlewares/auth")
const { getRandomId } = require("../config/global")

const decrementStockForItem = async (item) => {
    if (!item) return

    const qty = Number(item.quantity) || 0
    if (qty <= 0) return

    const rawProductId = item.productId || item.id || item._id
    if (!rawProductId) return

    const productId = String(rawProductId)
    const product = await Products.findOne({
        $or: [{ id: productId }, { _id: productId }]
    })

    if (!product) {
        throw new Error(`Product not found: ${productId}`)
    }

    const currentStock = Number(product.stock || 0)
    if (currentStock < qty) {
        throw new Error(`Insufficient stock for product ${productId}`)
    }

    await Products.updateOne({ _id: product._id }, { $inc: { stock: -qty } })
}

//Create Order
router.post("/create", verifyToken, async (req, res) => {
    try {
        const { products, totalAmount, shippingAddress } = req.body
        const { uid, role } = req
        if (role !== "user") { return res.status(401).json({ message: "Unauthorized to access this feature.", isError: true }) }

        if (!Array.isArray(products) || !products.length) {
            return res.status(400).json({ message: "At least one product is required", isError: true })
        }

        const id = getRandomId()
        const orderData = { id, uid, products, totalAmount, shippingAddress }
        const order = await Orders.create(orderData)

        try {
            for (const item of products) {
                await decrementStockForItem(item)
            }
        } catch (error) {
            await Orders.deleteOne({ id: order.id })
            console.error("Failed to decrement stock:", error)
            return res.status(400).json({ message: error.message || "Insufficient stock", isError: true })
        }

        res.status(200).json({ message: "Order created successfully", order })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})

//Get All Orders
router.get("/all", verifyToken, async (req, res) => {
    try {
        const { uid, role } = req
        let orders
        if (role === "admin") {
            orders = await Orders.find()
        } else {
            orders = await Orders.find({ uid })
        }
        res.status(200).json({ message: "Orders fetched successfully", orders })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})






//Get Single Order (also support /:id)
router.get("/get-single/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params
        const order = await Orders.findOne({ id })
        if (!order) { return res.status(404).json({ message: "Order not found", isError: true }) }
        res.status(200).json({ message: "Order found", order })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})

//tick
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params
        const order = await Orders.findOne({ id })
        if (!order) { return res.status(404).json({ message: "Order not found", isError: true }) }
        res.status(200).json({ message: "Order found", order })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})

//Update Order Status (support /update/:id and /update-status/:id)
router.patch("/update-status/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const dataToUpdate = {}
        if (status) dataToUpdate.status = status
        if (status === "shipped") dataToUpdate.paymentStatus = "paid"

        const order = await Orders.findOneAndUpdate({ id }, dataToUpdate, { returnDocument: "after" })
        if (!order) { return res.status(404).json({ message: "Order not found", isError: true }) }
        res.status(200).json({ message: "Order updated successfully", order })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const { role } = req
        if (role !== "admin") { return res.status(401).json({ message: "Unauthorized to access this feature.", isError: true }) }
        const { id } = req.params
        const order = await Orders.findOne({ id })
        if (!order) { return res.status(404).json({ message: "Order not found", isError: true }) }
        await order.deleteOne()
        res.status(200).json({ message: "Order deleted successfully" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error", isError: true })
    }
})

module.exports = router


















// router.patch("/update/:id", verifyToken, async (req, res) => {
//     try {
//         const { id } = req.params
//         const { status } = req.body

//         const dataToUpdate = {}
//         if (status) dataToUpdate.status = status
//         if (status  === "shipped") dataToUpdate.paymentStatus = "paid"

//         const order = await Orders.findOneAndUpdate({ id }, dataToUpdate, { returnDocument: "after" })
//         if (!order) { return res.status(404).json({ message: "Order not found", isError: true }) }
//         res.status(200).json({ message: "Order updated successfully", order })
//     } catch (error) {
//         console.error(error)
//         res.status(500).json({ message: "Internal server error", isError: true })
//     }
// })
//Delete Order (support /delete/:id and /:id)
// router.delete("/delete/:id", verifyToken, async (req, res) => {
//     try {
//         const { role } = req
//         if (role !== "admin") { return res.status(401).json({ message: "Unauthorized to access this feature.", isError: true }) }
//         const { id } = req.params
//         const order = await Orders.findOne({ id })
//         if (!order) { return res.status(404).json({ message: "Order not found", isError: true }) }
//         await order.deleteOne()
//         res.status(200).json({ message: "Order deleted successfully" })
//     } catch (error) {
//         console.error(error)
//         res.status(500).json({ message: "Internal server error", isError: true })
//     }
// })
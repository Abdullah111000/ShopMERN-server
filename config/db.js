const mongoose = require("mongoose")


const { MONGODB_USERNAME, MONGODB_PASSWORD } = process.env

const connectDB = () =>{
mongoose.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@cluster0.bvocuwb.mongodb.net`)
.then(()=>{
     console.log("Database connected successfully")  
}).catch((error)=>{
    console.log("Database connection failed")
    console.log(error)
})

}

module.exports = {connectDB}

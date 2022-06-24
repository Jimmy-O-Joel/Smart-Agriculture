const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")

const app = express()

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-jimmy:SAWA12120@cluster0.hrd38.mongodb.net/SmartAgriculture")

const moistureSchema = new mongoose.Schema({
    value: Number
})

const Moisture = mongoose.model("Moisture", moistureSchema)

const moisture = new Moisture({
    value: 20
})

moisture.save()


app.get("/", function (req, res) {

    Moisture.find(function (err, moistures) {
        if (err) {
            console.log(err)
        } else {
            let getMoisture = moistures[moistures.length - 1].value
            let moistureComment;

            if (getMoisture < 10) {
                moistureComment = "Extremely Low"
            } else if (getMoisture < 30) {
                moistureComment = "Just Fine"
            } else {
                moistureComment = "Very Good"
            }
            res.render("index", { moisture: getMoisture, comment: moistureComment })
        }
    })

})

app.listen(3000, function () {
    console.log("Server started successfully on port 3000")
})
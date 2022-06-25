const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const Pusher = require("pusher");

const app = express()

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({ extended: true }))

//set public folder
app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-jimmy:SAWA12120@cluster0.hrd38.mongodb.net/SmartAgriculture")

const pusher = new Pusher({
  appId: "1428509",
  key: "4d4f0d0cf3b7fc4b6e60",
  secret: "a7dbb63c021e9d95f5b4",
  cluster: "mt1",
  useTLS: true
});

const db = mongoose.connection;
db.once("open", ()=>{
    const moistureCollection = db.collection("moistures")
    const changeStream = moistureCollection.watch()
    changeStream.on("change", (change)=>{
        if (change.operationType === "insert") {
            const moisture = change.fullDocument
            pusher.trigger("newValue", "newValue", moisture.value)
        }

    })
})

const moistureSchema = new mongoose.Schema({
    value: Number
})

const Moisture = mongoose.model("Moisture", moistureSchema)

const moisture = new Moisture({
    value: 20
})

//moisture.save()

app.get("/", function (req, res) {
    Moisture.find((err, moistures)=>{
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

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000
}

app.listen(port, ()=>{
    console.log(`Server started successfully on port ${port}`)
})
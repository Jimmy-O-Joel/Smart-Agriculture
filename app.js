const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const Pusher = require("pusher")

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express()

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

//set public folder
app.use(express.static("public"))

mongoose.connect(process.env.MONGO_DB_SERVER)

const pusher = new Pusher({
  appId: "1428509",
  key: "4d4f0d0cf3b7fc4b6e60",
  secret: "a7dbb63c021e9d95f5b4",
  cluster: "mt1",
  useTLS: true
});

const db = mongoose.connection;
db.once("open",async ()=>{
    const moistureCollection = db.collection("moistures")
    const changeStream1 = moistureCollection.watch()
    changeStream1.on("change", async (change)=>{
        if (change.operationType === "insert") {
            const moisture = change.fullDocument
            pusher.trigger("newValue", "newValue", moisture.value)
        }

    })
})

const moistureSchema = new mongoose.Schema({
    value: Number
})

const pumpSchema = new mongoose.Schema({
    pumpState: Boolean
})


const Moisture = mongoose.model("Moisture", moistureSchema)
const Pump = mongoose.model("Pump", pumpSchema)

const moisture = new Moisture({
    value: 20
})

//moisture.save()



app.post("/switch", async (req, res)=>{
    const pumpState = req.body
    console.log(pumpState)

    Pump.deleteMany({}, async (err)=>{
        if (err) {
            console.log(err)
        } else {
            console.log('success');
        }
    }
    );
    const pump = new Pump(pumpState)
    pump.save()
})

app.get("/", (req, res)=>{
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
            res.render("index", { moisture: getMoisture, comment: moistureComment})
            
        }
    })

})

app.get("/pump", (req, res)=>{
    Pump.find((err, pump)=>{
        if (err){
            console.log(err)
        }else{
            res.status(200).json(pump[0])
        }
    })
})

let port = process.env.PORT || 3000

app.listen(port, async()=>{
    console.log(`Server started successfully on port ${port}`)
})
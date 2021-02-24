require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const client = require("./util/discord");

const users = require("./routes/api/users");

const app = express();

app.get("/", (req, res) => {
    res.send("tora was here.")
})

app.use(cors());
app.use(bodyParser.json()); 
app.use("/api/users", users);

client.login(process.env.TOKEN);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server started on port ${port}\nhttp://localhost:${port}`);
});
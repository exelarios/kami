require('dotenv').config();
const express = require("express");
const cors = require("cors");
const client = require("./client/index");

const users = require("./server/routes/api/users");

const app = express();

app.get("/", (req, res) => {
    res.send("tora was here.")
});

app.use(express.urlencoded({
    extended: true
}));

app.use("/api/users", users);

client.login(process.env.TOKEN);

const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log(`Server started on port ${port}\nhttp://localhost:${port}`);
});
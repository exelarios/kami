require('dotenv').config();
const express = require("express");
const cors = require("cors");
const client = require("./client/index");

const users = require("./server/routes/api/users");
const discord = require("./server/routes/api/discord");

const app = express();

app.get("/", (req, res) => {
    res.send("tora was here.")
});

app.use(cors());
app.use(express.json());

app.use("/api/users", users);
app.use("/api/discord", discord);

client.login(process.env.TOKEN);

const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log(`Server started on port ${port}\nhttp://localhost:${port}`);
});
const PREFIX = "!";
const GROUP_ID = 7887814;

const Discord = require("discord.js");
const express = require("express");
const { groupAPI } = require("./utils/axios");
const fs = require("fs");
const firebase = require("firebase-admin");
const blacklist = require("./utils/blacklist");
require('dotenv').config();

firebase.initializeApp({
    credential: firebase.credential.cert({
        "project_id": process.env.PROJECT_ID,
        "client_email": process.env.CLIENT_EMAIL,
        "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: "https://kami-34807-default-rtdb.firebaseio.com/"
});

const app = express();
const client = new Discord.Client();
const db = firebase.database();

client.version = "0.1.19";
client.SERVER_ID = 755140348753215488;
client.TEST_ID = 803455843143385098;

client.commands = [];
client.functions = [];
client.clanList = [];
client.clanIds = [];

app.get("/", (req, res) => {
    res.send("tora was here");
});

app.use(bodyParser.json()); 

// https://groups.roblox.com/v1/groups/7887814/relationships/allies?startRowIndex=0&maxRows=500
groupAPI.get(`/v1/groups/${GROUP_ID}/relationships/allies?startRowIndex=0&maxRows=500`)
    .then(res => {
        const groups = res.data.relatedGroups;
        client.clanList = groups;
        groups.map(group => {
            client.clanIds.push(group.id);
        })
    })
    .catch(error => {
        console.log(error);
    })

const modules = fs.readdirSync("./src/modules")
    .filter(file => file.endsWith('.js'));

for (const file of modules) {
    const module = require(`./modules/${file}`);
    const fileName = file.split(".")[0];
    client.functions[fileName] = module.actions;
    module.commands.map(command => {
        const keyword = command.usage.split(" ")[0].replace(/[^[A-Za-z\s]/, "");
        client.commands[keyword] = command;
    })
}

client.on("ready", () => {
    console.log("Kami is Online.");
    client.user.setActivity("with shogun", {type: "PLAYING"});
    client.functions["punish"].releaseOffenders(client, db);
});

client.on("guildMemberAdd", member => {
    const users = db.ref("/users");
    const authorId = member.user.id;
    users.child(authorId).once("value", async (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        const currentTime = new Date().getTime() / 1000;
        if (data.punish > Math.floor(currentTime)) {
            const getPunishedRole = member.guild.roles.cache.find(role => role.name == "Punished");
            if (getPunishedRole) {
                member.roles.add(getPunishedRole);
            }
        }
    });
});

client.on("message", message => {
    if (message.author.bot) {
        return;
    }

    blacklist.map(word => {
        if (message.content.toLowerCase().includes(word)) {
            const args = [message.author, "24", `Ethnic Slur(s):\n "${message.content}"`];
            client.commands["punish"].execute(client, message, db, args, true);
            return;
        }
    })

    if (message.content.startsWith(PREFIX)) {
        const args = message.content.slice(PREFIX.length).split(/ +/);
        const key = args.shift().toLowerCase();
        client.commands[key]?.execute(client, message, db, args);
    }
});

client.login(process.env.TOKEN);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}\nhttp://localhost:${port}`));

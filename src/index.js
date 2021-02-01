const PREFIX = "!";
const GROUP_ID = 7887814;

const Discord = require("discord.js");
const { groupAPI } = require("./util/axios");
const fs = require("fs");
const firebase = require("firebase-admin");
const blacklist = require("./util/blacklist");
const punish = require("./modules/punish").punish;
require('dotenv').config();

firebase.initializeApp({
    credential: firebase.credential.cert({
        "project_id": process.env.PROJECT_ID,
        "client_email": process.env.CLIENT_EMAIL,
        "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: "https://kami-34807-default-rtdb.firebaseio.com/"
});

const client = new Discord.Client();
const db = firebase.database();

client.commands = [];
client.clanList = [];
client.clanIds = [];

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
    const commands = require(`./modules/${file}`);
    const listOfCommands = Object.keys(commands);
    listOfCommands.forEach(phase => {
        client.commands[phase] = commands[phase];
    });
}

client.on("ready", () => {
    console.log("Kami is Online.");
    client.user.setActivity("with shogun", {type: "PLAYING"});
});

client.on("message", message => {
    if (message.author.bot) {
        return;
    }

    blacklist.map(word => {
        if (message.content.toLowerCase().includes(word)) {
            const args = [message.author, "24", `Ethnic Slur(s):\n "${message.content}"`];
            punish.execute(client, message, db, args, true);
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

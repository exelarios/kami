const PREFIX = "!";

const Discord = require("discord.js");
const fs = require("fs");
const firebase = require("firebase-admin");
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
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).split(/ +/);
    const key = args.shift().toLowerCase();

    client.commands[key]?.execute(client, message, db, args);
});

client.login(process.env.TOKEN);
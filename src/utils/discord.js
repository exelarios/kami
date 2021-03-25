const PREFIX = "!";
const GROUP_ID = process.env.COMMUNITY_GROUP;

const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client();

client.version = "0.3.0";
client.commands = {};
client.recentlyInvoked = {};

function parseCommands(source) {
    const entires = fs.readdirSync(source, { withFileTypes: true })
        .filter(entry => entry.name != "Command.js");

    const files = entires.filter(file => !file.isDirectory())
        .map(file => {
            const relativePath = source.replace("./src", "..");
            const Command = require(relativePath + file.name);
            client.commands[file.name.replace(".js", "")] = new Command(client);
        });

    entires.filter(folder => folder.isDirectory())
        .map(folder => files.push(...parseCommands(`${source}${folder.name}/`)));

    return files;
}

function onStart() {
    console.log("Kami is Online.");
    client.user.setActivity("with shogun", {type: "PLAYING"});
}

function message(message) {
    if (message.content.startsWith(PREFIX)) {
        const args = message.content.slice(PREFIX.length).split(/ +/);
        const key = args.shift().toLowerCase();
        client.commands[key]?.execute(message, args);
    }
}

parseCommands("./src/commands/");
client.on("ready", onStart);
client.on("message", message);

module.exports = client;
const PREFIX = "!";
const GROUP_ID = 7887814;

const Discord = require("discord.js");
const db = require("../utils/firebase");
const fs = require("fs");

const { groupAPI } = require("../utils/axios");

const client = new Discord.Client();

client.version = "0.2.0";
client.SERVER_ID = 755140348753215488;
client.TEST_ID = 803455843143385098;

client.commands = [];
client.functions = [];
client.clanList = [];
client.clanIds = [];

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
    const module = require(`../modules/${file}`);
    const fileName = file.split(".")[0];
    client.functions[fileName] = module.actions;
    module.commands.map(command => {
        const keyword = command.usage.split(" ")[0].replace(/[^[A-Za-z\s]/, "");
        client.commands[keyword] = command;
    })
}

/*
const userData = require("../data.json");

async function importData() {

    const users = db.collection("users");

    const usersId = Object.keys(userData.users);

    usersId.map(async (id) => {
        const data = userData.users[id];
        try {
            await users.doc(id).set(data)
        } catch(error) {
            console.log(id)
        }
    })

    // const doc = await users.doc()
}
*/

client.on("ready", () => {
    console.log("Kami is Online.");
    client.user.setActivity("with shogun", {type: "PLAYING"});
    client.functions["punish"].releaseOffenders(client, db);

    // importData();
});

client.on("guildMemberAdd", (member) => {
    client.functions["punish"].onMemberAdded(client, member, db);
});

client.on("message", message => {
    if (message.author.bot) {
        return;
    }

    client.functions["punish"].checkBlacklistedWords(client, message, db);
    if (message.content.startsWith(PREFIX)) {
        const args = message.content.slice(PREFIX.length).split(/ +/);
        const key = args.shift().toLowerCase();
        client.commands[key]?.execute(client, message, db, args);
    }
});

module.exports = client;
const PREFIX = "!";
const GROUP_ID = 7887814;
const SERVER_ID = 755140348753215488;
const TEST_ID = 803455843143385098;
const INTERVAL = 1 * 60 * 1000;

const Discord = require("discord.js");
const { groupAPI } = require("./util/axios");
const fs = require("fs");
const firebase = require("firebase-admin");
const blacklist = require("./util/blacklist");
const punish = require("./modules/punish").punish;
const util = require("./util/shared");
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
client.version = "0.1.10";

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
    const server = client.guilds.cache.find(guild => guild.id == SERVER_ID || guild.id == TEST_ID);
    if (server) {
        const users = db.ref("/users");
        const punishRole = server.roles.cache.find(role => role.name == "Punished");
        if (punishRole) {
            const modLogChannel = server.channels.cache.find(channel => channel.name.toLowerCase() === "punish-log");
            if (!modLogChannel) {
                message.reply("Failed to find punish-log");
            }
            setInterval(function() {
                punishRole.members.map(member => {
                    const memberId = member.user.id;
                    users.child(memberId).once("value", async snapshot => {
                        let data = snapshot.val();
                        if (!data) return;
                        const currentTime = new Date().getTime() / 1000;
                        if (data.punish <= Math.floor(currentTime)) {
                            const embed = new Discord.MessageEmbed()
                                .setAuthor("Release Report")
                                .setThumbnail(member.user.displayAvatarURL())
                                .setDescription(`${member.user.nickname || member.user.username}(${member.user.username}#${member.user.discriminator}) has been released from punished at ${util.getReadableTime(currentTime)}.`)
                            modLogChannel.send(embed);
                            member.roles.remove(punishRole);
                            users.child(memberId).update({
                                punish: null,
                            });
                        }
                    });
                });
            }, INTERVAL);
        }
    }
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

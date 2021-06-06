const fs = require("fs");
const { client } = require("./utils/discord");
const Slash = require("../client/models/Slash");
const Collection = require("../shared/collection");

client.version = "0.3.0";
client.commands = {};
client.groups = {};
client.bannedWords = null;

async function loadCommands() {
    const slash = new Slash(process.env.TOKEN, client.user.id);
    const registeredCommands = await slash.getCommands();
    // console.log(registeredCommands);
    const commands = fs.readdirSync("./src/client/commands").filter(file => file.endsWith(".js"));

    for (const file of commands) {
        const Command = require(`../client/commands/${file}`);
        const key = file.split(".")[0];
        client.commands[key] = new Command(client);
        const doesExist = registeredCommands.some(command => command.name == key);
        if (!doesExist) {
            await slash.createCommand({
                name: key,
                description: client.commands[key].description,
                options: client.commands[key]?.args,
                default_permission: client.commands[key]?.public,
            });
        }
    }
}

async function loadBlacklistedWords() {
    // Caching the blacklisted words so it doesn't have to 
    // fetch from the database each time a person sends a message.
    const words = new Collection("blacklisted", "words");
    const snapshot = await words.data();
    client.bannedWords = snapshot.banned;
}

async function onStart() {
    await loadBlacklistedWords();
    await loadCommands();
    client.commands["unmute"].release();
    client.user.setActivity("with shogun", {type: "PLAYING"});
    console.log("Kami is Online.");
}

async function onMessage(message) {
    if (message.author.bot) return;
    client.commands["mute"].onBlacklisted(message);
}

async function onInteraction(interaction) {
    const key = interaction.data.name.toLowerCase();
    const options = interaction.data.options;
    let args = {};

    options && options.forEach(option => {
        args[option.name] = option.value;
    });

    await client.commands[key].execute(interaction, args);
}

async function onMemberAdded(member) {
    client.commands["mute"].memberAdded(member);
}

client.on("ready", onStart);
client.on("message", onMessage);
client.on("guildMemberAdd", onMemberAdded);
client.ws.on("INTERACTION_CREATE", onInteraction);

module.exports = client;

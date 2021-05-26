const GROUP_ID = process.env.COMMUNITY_GROUP;

const fs = require("fs");
const { client } = require("./utils/discord");
const Slash = require("./models/slash.js");

client.version = "0.3.0";
client.commands = {};

/*
TODO:
- Implement mute, unmute, censor, uncensor
*/

async function loadCommands() {
    const slash = new Slash(process.env.TOKEN, client.user.id);
    const registeredCommands = await slash.getCommands();
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

async function onStart() {
    await loadCommands();
    client.user.setActivity("with shogun", {type: "PLAYING"});
    console.log("Kami is Online.");
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

client.on("ready", onStart);
client.ws.on("INTERACTION_CREATE", onInteraction);

module.exports = client;

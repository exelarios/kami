const PREFIX = "!";
const GROUP_ID = process.env.COMMUNITY_GROUP;

const fs = require("fs");
const Discord = require("discord.js");
const Slash = require("./models/Slash.js");

const client = new Discord.Client();

client.version = "0.3.0";
client.commands = {};

async function onStart() {

    const slash = new Slash(process.env.TOKEN, client.user.id);

    const registeredCommands = await slash.getCommands();

    const commands = fs.readdirSync("./src/client/commands").filter(file => file.endsWith(".js"));

    try {
        for (const file of commands) {
            const Command = require(`../client/commands/${file}`);
            const key = file.split(".")[0];
            client.commands[key] = new Command(client);
            const doesExist = registeredCommands.some(command => command.name == key);
            if (!doesExist) {
                await slash.createCommand({
                    name: key,
                    description: client.commands[key].description,
                    options: client.commands[key]?.args
                })
            }
        }
    } catch(error) {
        console.error(error);
    }

    // client.ws.on('INTERACTION_CREATE', async (interaction) => {

        // if(command == "echo") {
        //     const description = args.find(arg => arg.name.toLowerCase() == "content").value;
        //     const embed = new Discord.MessageEmbed()
        //         .setTitle("Echo!")
        //         .setDescription(description)
        //         .setAuthor(interaction.member.user.username);

        //     client.api.interactions(interaction.id, interaction.token).callback.post({
        //         data: {
        //             type: 4,
        //             data: await createAPIMessage(interaction, embed)
        //         }
        //     });
        // }
    // });

    console.log("Kami is Online.");
    client.user.setActivity("with shogun", {type: "PLAYING"});
}

/*

SUB_COMMAND: 1
SUB_COMMAND_GROUP: 2
STRING: 3
INTEGER: 4
BOOLEAN: 5
USER: 6
CHANNEL: 7
ROLE: 8
MENTIONABLE: 9

*/

async function createAPIMessage(interaction, content) {
    const apiMessage = await Discord.APIMessage.create(client.channels.resolve(interaction.channel_id), content)
        .resolveData()
        .resolveFiles();
    
    return { ...apiMessage.data, files: apiMessage.files };
}

async function onInteraction(interaction) {
    // console.log(interaction);
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options;

    console.log(args);

    if(command == "verify") {
        const description = args.find(arg => arg.name.toLowerCase() == "username").value;
        const embed = new Discord.MessageEmbed()
            .setTitle("Echo!")
            .setDescription(description)
            .setAuthor(interaction.member.user.username);

        client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: await createAPIMessage(interaction, embed)
            }
        });
    }
}


client.on("ready", onStart);
client.ws.on("INTERACTION_CREATE", onInteraction);
// client.on("message", message);

module.exports = client;
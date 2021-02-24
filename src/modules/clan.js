const { clans, roles } = require("../util/titles");
const Discord = require('discord.js');

const clanEmbed = (clan) => {
   const embed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(clan.name)
    .setAuthor("Clan Information")
    .addFields(
        {name: "Leader", value: clan.owner.username},
        {name: "Description", value: clan.description}
    );
    return embed;
}

const commands = [
    {
        usage: "!claninfo <groupId/groupName>",
        description: "View the latest metadata about a specific clan.",
        execute: (client, message, db, args) => {
            if (args[0] != undefined) {
                if (args[0].match(/^\d+$/)) {
                    const getGroup = client.clanList.find(clan => clan.id == args[0]);
                    if (getGroup) {
                        message.channel.send(clanEmbed(getGroup));
                    }
                } else {
                    const getGroup = client.clanList.find(clan => clan.name === args[0]);
                    if (getGroup) {
                        message.channel.send(clanEmbed(getGroup));
                    }
                }
            }
        }
    },
    
    {
        usage: "!clanlist",
        description: "Displays all the current clans enrolled in the community.",
        execute: (client, message, db, args) => {
            let result = [];
            client.clanList.map((clan) => {
                let formattedName = clan.name;
                result.push(clans[formattedName] || formattedName);
            })
            message.channel.send(result);
        }
    }
]

const actions = [

]

module.exports = {
    commands,
    actions
}
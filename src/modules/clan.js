const { clans, roles } = require("../util/titles");
const Discord = require('discord.js');

const clanEmbed = (clan) => {
   const embed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(clan.Name)
    .setAuthor("Clan Information")
    .addFields(
        {name: "Leader", value: clan.Owner.Name},
        {name: "Description", value: clan.Description}
    );
    return embed;
}

module.exports = {

    claninfo: {
        usage: "!claninfo <groupId/groupName>",
        description: "View the latest metadata about a specific clan.",
        execute: (client, message, db, args) => {
            if (args[0] != undefined) {
                if (args[0].match(/^\d+$/)) {
                    const getGroup = client.clanList.find(clan => clan.Id == args[0]);
                    if (getGroup) {
                        message.channel.send(clanEmbed(getGroup));
                    }
                } else {
                    const getGroup = client.clanList.find(clan => clan.Name === args[0]);
                    if (getGroup) {
                        message.channel.send(clanEmbed(getGroup));
                    }
                }
            }
        }
    },
    
    clanlist: {
        usage: "!clanlist",
        description: "Displays all the current clans enrolled in the community.",
        execute: (client, message, db, args) => {
            let result = [];
            client.clanList.map((clan) => {
                let formattedName = clan.Name;
                result.push(clans[formattedName] || formattedName);
            })
            message.channel.send(result);
        }
    }
}
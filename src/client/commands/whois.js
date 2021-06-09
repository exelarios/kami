const Command = require("../models/command");
const Collection = require("../../shared/collection");
const clearance = require("../utils/clearance");
const Message = require("../models/message");
const { Discord } = require("../utils/discord");
const rbxAPI = require("../utils/robloxAPI");

class Whois extends Command {
    constructor(client) {
        super(client, {
            channelOnly: true,
            description: "Check what's their roblox account.",
            permissions: clearance.admin,
            verifyRequired: false,
            public: false,
            args: [
                {
                    "name": "user",
                    "description": "User you want to check.",
                    "required": true,
                    "type": 6
                }
            ]
        });
    }

    async run(interaction, args) {
        const { user: targetId } = args;

        const guild = await this.client.guilds.fetch(process.env.GUILD_ID);
        const target = await guild.members.fetch(targetId);
        const document = new Collection("users", targetId);
        const snapshot = await document.data();
        const userId = snapshot?.userId;
        if (!userId)
            throw new Message("System Message", "Failed to find userId in User's document.");

        const username = await rbxAPI.getUsernameByUserId(userId);
        if (!username)
            throw new Error("Failed to fetch Roblox's username by userId.");

        const groups = await rbxAPI.getGroupsByUserId(userId);
        const clanList = await rbxAPI.getAlliesGroupId();
        let userClans = groups.filter(clan => clanList.some(groupId => groupId === clan.group.id));

        let factions = "";
        for (let i = 0; i < userClans.length; i++) {
            const factionDocument = new Collection("groups", userClans[i].group.id);
            const doesExist = await factionDocument.exists();
            const data = await factionDocument.data();
            const groupName = doesExist ? data?.displayName : Discord.parseText(userClans[i].group.name);
            const roleName = Discord.parseText(userClans[i].role.name);
            factions += `[${groupName}] ${roleName}\n`;
        }

        const output = new Discord.MessageEmbed()
            .setAuthor(`${target.user.username} Summary`, "https://i.imgur.com/lyyexpK.gif")
            .addFields(
                { name: "Username", value: username },
                { name: "Profile", value: `https://roblox.com/users/${userId}/profile` },
                { name: "Faction(s)", value: factions },
            )
            .setTimestamp();
        
        this.reply(interaction, {
            type: 4,
            data: await Discord.createAPIMessage(interaction, output)
        })
    }

}

module.exports = Whois;
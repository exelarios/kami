const Discord = require("discord.js");
const Collection = require("../../shared/collection");
const clearance = require("./clearance");

const client = new Discord.Client();

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

Discord.createAPIMessage = async function(interaction, content) {
    const apiMessage = await Discord.APIMessage.create(client.channels.resolve(interaction.channel_id), content)
        .resolveData()
        .resolveFiles();
    return { ...apiMessage.data, files: apiMessage.files };
}

Discord.getRoleByName = async function(name) {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const role = guild.roles.cache.find(role => role.name == name);
    if (!role) throw new Error(`Failed to find \`${name}\` within roles.`);
    return role.id;
}

Discord.addUserRoleByName = async function(authorId, roleName) {
    const hasRole = await this.hasRole(authorId, roleName);
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(authorId);

    // Remove any potential irrelevant roles.
    const roles = clearance.normal.filter(role => role != roleName);
    for (let index in roles) {
        const hasRole = await this.hasRole(authorId, roles[index]);
        if (hasRole) {
            await Discord.removeUserRoleByName(authorId, roles[index]);
        }
    }
    
    if (!hasRole) {
        const roleId = await Discord.getRoleByName(roleName);
        await member.roles.add(roleId);
    }
    return roleName;
}

Discord.removeUserRoleByName = async function(authorId, roleName) {
    const hasRole = await this.hasRole(authorId, roleName);
    if (!hasRole) return false;

    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(authorId);
    const roleId = await this.getRoleByName(roleName);
    await member.roles.remove(roleId);
    return true;
}

Discord.setDisplayName = async function(authorId, username, clan) {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(authorId);

    let content = null;
    const hasCommoner = await this.hasRole(authorId, clearance.normal[0]);
    if (hasCommoner) {
        content = `[Commoner] ${username}`;
        await member.setNickname(content.slice(0, 32));
    } else {
        const document = new Collection("groups", clan.group.id)
        const doesExist = await document.exists();
        const snapshot = await document.data();
        const groupName = doesExist ? snapshot?.displayName : this.parseText(clan.group.name);
        const groupRole = this.parseText(clan.role.name);
        content = `[${groupName}] ${groupRole} | ${username}`;
        await member.setNickname(content.slice(0, 32));
    }
    return content;
}

Discord.hasRole = async function(authorId, roleName) {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(authorId);
    return member.roles.cache.some(role => role.name == roleName);
}

const blacklistWords = ["The", "Lord"];
const blacklistsuffix = ["-shi", "-Ka", "-kai"];
Discord.parseText = function(text) {
    let regex  = new RegExp("( |^)" + blacklistWords.join("|") + "( |$)", "g");
    let filtered = text.replace(/[^a-zA-ZōТŌāūо-\s]/g, "").replace(regex, "").replace(/^[\s+]/, "");
    filtered = filtered.split(" ");
    let retry = 0;
    let found = false;
    while(!found && retry < filtered.length) {
        if (filtered[retry] == "" || filtered[retry] == "-") {
            retry++;
        } else {
            found = true;
            let finalWord = filtered[retry];
            blacklistsuffix.map(suffix => {
                finalWord = finalWord.replace(suffix, "");
            })
            return finalWord;
        }
    }
}

Discord.getReadableTime = function(time) {
    const date = new Date(time * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${month} ${day}, ${year} @ ${hour}:${minutes}:${seconds} UTC`
}

module.exports = {
    Discord,
    client
}
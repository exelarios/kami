const Discord = require("discord.js");
const clearance = require("./clearance");

const client = new Discord.Client();

Discord.createAPIMessage = async function(interaction, content) {
    const apiMessage = await Discord.APIMessage.create(client.channels.resolve(interaction.channel_id), content)
        .resolveData()
        .resolveFiles();
    return { ...apiMessage.data, files: apiMessage.files };
}

Discord.getRoleByName = async function(name) {
    const guild = await client.guilds.fetch(process.env.GUILDID);
    const role = guild.roles.cache.find(role => role.name == name);
    if (!role) throw new Error(`Failed to find \`${name}\` within roles.`);
    return role.id;
}

Discord.addUserRoleByName = async function(authorId, roleName) {
    const hasRole = await Discord.hasRole(authorId, roleName);
    const guild = await client.guilds.fetch(process.env.GUILDID);
    const member = await guild.members.fetch(authorId);

    // Remove any potential irrelevant roles.
    const roles = clearance.normal.filter(role => role != roleName);
    for (let index in roles) {
        const hasRole = await Discord.hasRole(authorId, roles[index]);
        if (hasRole) {
            await Discord.removeUserRoleByName(authorId, roles[index]);
        }
    }
    
    if (!hasRole) {
        const roleId = await Discord.getRoleByName(roleName);
        await member.roles.add(roleId);
        return true;
    }
    return false;
}

Discord.removeUserRoleByName = async function(authorId, roleName) {
    const hasRole = await Discord.hasRole(authorId, roleName);
    if (!hasRole) return false;

    const guild = await client.guilds.fetch(process.env.GUILDID);
    const member = await guild.members.fetch(authorId);
    const roleId = await Discord.getRoleByName(roleName);
    await member.roles.remove(roleId);
    return true;
}

Discord.setDisplayName = async function(authorId, username, clan) {
    const guild = await client.guilds.fetch(process.env.GUILDID);
    const member = await guild.members.fetch(authorId);

    const hasCommoner = await this.hasRole(authorId, clearance.normal[0]);
    if (hasCommoner) {
        const content = `[Commoner] ${username}`.slice(0, 32);
        await member.setNickname(content);
    } else {
        const groupName = clan.group.name;
        const groupRole = clan.role.name;
        const content = `[${groupName}] ${groupRole} | ${username}`.slice(0, 32);
        await member.setNickname(content);
    }
}

Discord.hasRole = async function(authorId, roleName) {
    const guild = await client.guilds.fetch(process.env.GUILDID);
    const member = await guild.members.fetch(authorId);
    return member.roles.cache.some(role => role.name == roleName);
}

module.exports = {
    Discord,
    client
}
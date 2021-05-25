const Discord = require("discord.js");

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

Discord.addUserRoleByName = async function(interaction) {

}

Discord.removeUserRoleByName = async function(interaction) {

}

Discord.setNickname = async function(interaction) {

}

module.exports = {
    Discord,
    client
}
const Discord = require("discord.js");

const client = new Discord.Client();

Discord.createAPIMessage = async function(interaction, content) {
    const apiMessage = await Discord.APIMessage.create(client.channels.resolve(interaction.channel_id), content)
        .resolveData()
        .resolveFiles();
    
    return { ...apiMessage.data, files: apiMessage.files };
}

Discord.getRoleByName = async function(interaction) {

}

Discord.addUserRoleByName = async function(interaction) {

}

Discord.removeUserRoleByName = async function(interaction) {
    
}

module.exports = {
    Discord,
    client
}
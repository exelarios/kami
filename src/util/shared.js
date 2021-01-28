const { roles } = require("../util/titles");

const removeMemberRoleByName = async (message, roleName) => {
    const clanMemberRole = await message.guild.roles.cache.find(role => role.name == roleName);
    if (clanMemberRole) {
        message.member.roles.remove(clanMemberRole);
        return true;
    } else {
        message.reply(`I couldn't find the ${roleName}.`);
    } 
    return false;
}

const setMemberRoleByName = async (message, roleName) => {
    const clanMemberRole = await message.guild.roles.cache.find(role => role.name == roleName);
    if (clanMemberRole) {
        message.member.roles.add(clanMemberRole);
        return true;
    } else {
        message.reply(`I couldn't find the ${roleName}.`);
    } 
    return false;
}

const removeAllObtainableRole = (message) => {
    const fetchAllRoles = roles.map(role => {
        removeMemberRoleByName(message, role);
    })
    return fetchAllRoles;
}

module.exports = {
    removeMemberRoleByName,
    removeAllObtainableRole,
    setMemberRoleByName
}
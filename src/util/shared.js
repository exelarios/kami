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

// const populateGroupList = async () => {
//     let isFinalPage = false;
//     let currentPage = 0;
//     while (!isFinalPage) {
//         currentPage++;
//         const response = await mainAPI.get(`/groups/${GROUP_ID}/allies?page=${currentPage}`);
//         console.log(response);
//         if (!response) {
//             console.log(`Failed to fetch ${GROUP_ID}'s allies.`);
//         }
//         const clans = response.data.Groups;
//         clans.map(clan => {
//             client.clanList.push(clan);
//             client.clanIds.push(clan.Id);
//             isFinalPage = response.data.FinalPage;
//         })
//     }
// }

module.exports = {
    removeMemberRoleByName,
    removeAllObtainableRole,
    setMemberRoleByName
}
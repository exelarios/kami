const { mainAPI, userAPI, groupAPI } = require("../../shared/axios");

async function getUserIdByUsername(username) {
    const response = await mainAPI.get(`users/get-by-username?username=${username}`);
    return response.data.Id;
}

async function getUsernameByUserId(userId) {
    const response = await userAPI.get(`/v1/users/${userId}`)
    return response.data.name;
}

async function getGroupsByUserId(userId) {
    const response = await groupAPI.get(`v2/users/${userId}/groups/roles`);
    return response.data.data;
}

async function getAlliesGroupId() {
    const response = await groupAPI.get(`/v1/groups/${process.env.COMMUNITY_GROUP}/relationships/allies?startRowIndex=0&maxRows=500`);
    const groups = response.data.relatedGroups;
    let groupIds = [];
    for (let group of groups) {
        groupIds.push(group.id);
    }
    return groupIds;
}

module.exports = {
    getUserIdByUsername,
    getUsernameByUserId,
    getGroupsByUserId,
    getAlliesGroupId
}
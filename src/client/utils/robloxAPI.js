const { mainAPI, userAPI, groupAPI } = require("./axios");

async function getUserIdByUsername(username) {
    const response = await mainAPI.get(`users/get-by-username?username=${username}`);
    return response.data.Id;
}

async function getUsernameByUserId(userId) {
    const response = await userAPI.get(`/v1/users/${userId}`)
    return response.data.name;
}

module.exports = {
    getUserIdByUsername,
    getUsernameByUserId,
}
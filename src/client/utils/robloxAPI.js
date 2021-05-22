const { mainAPI, userAPI, groupAPI } = require("./axios");

async function getUserIdByUsername(username) {
    try {
        const response = await mainAPI.get(`users/get-by-username?username=${username}`);
        return response.data.Id;
    } catch(error) {
        console.error(error);
    }
}

async function getUsernameByUserId(userId) {
    try {
        const response = await userAPI.get(`/v1/users/${userId}`)
        return response.data.name;
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    getUserIdByUsername,
    getUsernameByUserId,
}
const axios = require("axios");

const mainAPI = axios.create({
    baseURL: "https://api.roblox.com/"
})

const userAPI = axios.create({
    baseURL: "https://users.roblox.com/"

})

const groupAPI = axios.create({
    baseURL: "https://groups.roblox.com/"
})

const discordAPI = axios.create({
    baseURL: "https://discord.com/api/v8/"
})

module.exports = {
    axios,
    mainAPI,
    userAPI,
    groupAPI,
    discordAPI
}
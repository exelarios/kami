const axios = require("axios");

const mainAPI = axios.create({
    baseURL: "http://api.roblox.com/"
})

const userAPI = axios.create({
    baseURL: "https://users.roblox.com/v1/"

})

module.exports = {
    mainAPI,
    userAPI
}
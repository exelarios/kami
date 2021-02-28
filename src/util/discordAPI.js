const { roles } = require("../util/titles");

function removeAllMemberObtainableRole(member) {
    roles.map((role) => {
        const clanMemberRole = member.roles.cache.find(memberRole => memberRole.name == role);
        if (clanMemberRole) {
            member.roles.remove(clanMemberRole);
        }
    });
}

module.exports = {
    removeAllMemberObtainableRole
}
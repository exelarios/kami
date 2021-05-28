const firestore = require("./firebase");
const users = firestore.collection("users");

/*
* Creates a document within the user's collection.
* @params {string} authorId the author of the document; discord's userId.
* @params {number} userId the roblox user's id.
*/
module.create = async function(authorId, userId) {
    const doesExist = await this.exists(authorId);
    if (doesExist) throw new Error("User's document has already been created.");
    const userDoc = users.doc(authorId);
    await userDoc.set({
        verify: false,
        userId: userId,
        primary_clan: null
    });
}

/*
* Checks if the user is recorded onto the user's collection.
* @params {string} authorId the author of the document; discord's userId.
* @return {boolean}
*/
module.exists = async function(authorId) {
    const userDoc = users.doc(authorId.toString());
    const userRef = await userDoc.get();
    return userRef.exists;
}

module.update = async function(update) {

}

module.exports = module;


const firestore = require("./firebase");
const users = firestore.collection("users");

/*
* Creates a document within the user's collection.
* @param {string} authorId - the author of the document; discord's userId.
* @param {number} userId - the roblox user's id.
*/
module.create = async function(authorId, userId) {
    const doesExist = await this.exists(authorId);
    if (doesExist) throw new Error("User's document has already been created.");
    const userDoc = users.doc(authorId.toString());
    await userDoc.set({
        verify: false,
        userId: userId,
        primary_clan: null
    });
}

/*
* Checks if the user is recorded onto the user's collection.
* @param {string} - authorId the author of the document; discord's userId.
* @return {boolean}
*/
module.exists = async function(authorId) {
    const userDoc = users.doc(authorId.toString());
    const userRef = await userDoc.get();
    return userRef.exists;
}

/*
* Updates the user's document.
* @param {string} authorId - the author of the document; discord's userId.
* @param {object} update - Updates the user's document with the new values.
*/
module.update = async function(authorId, update) {
    const doesExist = await this.exists(authorId);
    if (!doesExist) throw new Error("User's document doesn't exist."); 
    const userDoc = users.doc(authorId.toString());
    return await userDoc.update(update);
}

/*
* Fetchs the document for the particular user.
* @param {string} authorId - the author of the document; discord's userId.
* @return {object}
*/
module.data = async function(authorId) {
    const userDoc = users.doc(authorId.toString());
    const userRef = await userDoc.get();
    return userRef.data();
}

module.exports = module;


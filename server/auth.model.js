const knex = require('./db'); // Get the database

module.exports = {
    checkUsername(username) {
        return knex
                .select({
                    username: "username"
                })
                .from(user)
                .where({
                    "username": username
                })
                .then((result) => {
                    return result[0] || null;
                })
                .catch((error) => {
                    console.error("Could not check whether user exists in user table", error);
                    throw new Error("Failed to check whether user exists in user table")
                })
    },

    insertNewUser(userInfo) {
        return knex
                .insert(userInfo)
                .into("user")
                .returning('id')
                .then((result) => {
                    return result[0];
                })
                .catch((error) => {
                    console.error("Could not insert user:", error);
                    throw new Error("Failed to insert new user");
                })
    },

    getUserPasswordAndSalt(username) {
        return knex
                .select({
                    password: "password",
                    salt: "salt",
                    id: "id"
                })
                .from(user)
                .where({
                    "username": username
                })
                .then((result) => {
                    return result[0] || null;
                })
                .catch((error) => {
                    console.error("Could not retrieve username from database:", error);
                    throw new Error("Failed to retrieve username from database");
                });
    }
}
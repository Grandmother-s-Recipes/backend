const express = require('express');
const bcrypt = require('bcrypt'); // https://www.npmjs.com/package/bcrypt
const authModel = require('./auth')



const router = express.Router

/**
 * REGISTRATION
 * 1. Get the username
 * 2. Salt the password
 * 3. Check the username doesn't already exist
 *      3.1 If it exists, send back invalid
 * 4. If username is unique, salt password
 * 5. Insert username into the user table along with salt and hashed password
 * 6. Send back registration complete success 
 * 7. TODO - jsonwebtoken / cookie???
 */
router.post("/register", async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {

        // Check the username exists or not in the database
        const un = await authModel.checkUsername(); // Will return null if the username does not already exist.

        if (un !== null) {
            res.status(409).json({ 
                success: false, 
                msg: "Username already exists. Please choose another one."
            }); // status 409 means mismatch.
        }

        // The user is unique, so salt and hash the password
        const salt = await bcrypt.getSalt(10); // 10 salt rounds
        const hashedPassword = await bcrypt.hash(password, salt);

        // We actually don't need to store the salt - bcrypt handles this for us in the hash.
        // May need to update database as a result of this.
        const userInfo = {
            "username": username,
            "password": hashedPassword
            "salt": salt
        };

        const userId = await authModel.insertNewUser(userInfo); // Will return the user id
        return res.status(201).json({ 
            success: true, 
            userId: userId 
        }); // Return the userId - maybe we want to return a cookie later

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error registering user'
        }); // Something went wrong, but don't tell the user what went wrong specifically
    }
});

/**
 * LOGIN
 * 1. Get username and password
 * 2. Retrieve the password, salt salt from the database
 *      2.1: If no data associated with username, return unauthorised.
 * 3. Compare user supplied password with hashed password in database
 */

router.post("/login", async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        // Get the user's password and salt
        const userPasswordAndSalt = await authModel.getUserPasswordAndSalt(username);

        if(userPasswordAndSalt === null) {
            // User was not found in the database
            return res.status(401).json({
                success: false,
                msg: 'Invalid username or password.'
            });
        }

        // compare the password stored with the user-supplied password
        // we actually don't need the salt here!
        const isMatch = await bcrypt.compare(password, userPassWordAndSalt.password); 
        
        if(!isMatch) {
            // Password did not match, so access is unauthorized
            return res.status(401).json({
                success: false,
                msg: 'Invalid username or password.'
            });
        }

        // TODO: Set up a cookie to store user login info

        // For now return the username
        return res.status(200).json({
            success: true,
            msg: "Login successful",
            username: userPasswordAndSalt.username
        });

    } catch (error) => {
        console.error("There was an error logging in:", error);
        return(res.status(500).json({
            success: false,
            msg: 'Error logging in.'
        }))
    }
});
const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router

router.post("/register", async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const salt = await bcrypt.getSalt(10); // 10 salt rounds
        const hashedUserName = await bcrypt.hash(password, salt);
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Error registering user'
        })
    }
})
const express = require('express');
//const knex = require('./knex');  
const axios = require('axios');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();

require('dotenv').config();

app.use(cors());
app.use(express.json());

let users = [];

app.get('/recipes', async (req, res) => {
    const { region } = req.query;

    if (!region) {
        return res.status(400).json({ error: 'Region parameter is required' });
    }

    const apiUrl = `https://api.api-ninjas.com/v1/recipe?query=${region}`;

    try {
        const response = await axios.get(apiUrl, {
            headers: { 'x-api-key': process.env.API_KEY },  
        });
        if (response.status === 200) {
            return res.json(response.data);
        } else {
            return res.status(response.status).json({ error: 'Error fetching recipes' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
});

app.post('/register', async (req,res) => {
    const {username, password} = req.body;

    if(!username || !password) {
        return res.status(400).json({error: 'Username and password are required'});
    }

    try {
        // here we need to understand how to hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        //await knex('users').insert({username, hashedPassword:password});
        users.push({ username, password: hashedPassword });
        return res.status(201).json({Message: 'User register succesfully', username: username,
        hashedPassword: hashedPassword });
    } catch(error) {
        console.error('Error creating user', error);
        res.status(500).json({error: 'Error creating user'});
    }
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body;

    if(!username || !password) {
        return res.status(400).json({error: "User and password are required"});
    }
    
    try {
        const user = users.find((user) => user.username === username);

        if(!user) {
            return res.status(400).json({error: "User not found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(isMatch) {
            return res.status(200).json({message: "Login succesfully"});
        } else {
            return res.status(400).json({message: "Wrong password"});
        }
    } catch (error) {{
        console.error('Error during login', error);
        res.status(500).json({error});
    }}
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});

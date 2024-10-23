const express = require('express');
const knex = require('./knex');  
const axios = require('axios');  
const cors = require('cors');
const app = express();

require('dotenv').config();

app.use(cors());
app.use(express.json());

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
        return res.stuatus(400).json({error: 'Username and password are required'});
    }

    try {
        // here we need to understand how to hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        await knex('users').where({username, hashedPassword:password});
        return res.status(201).json({Message: 'User register succesfully'});
    } catch(error) {
        console.error('Error creating user', error);
        res.status(500).json({error: 'Error creating user'});
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});

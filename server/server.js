const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const axios = require('axios'); 
const knex = require('./knex'); 
require('dotenv').config(); 

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());


function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
}


app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await knex('users').insert({
            username: username,
            password: hashedPassword
        });

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Error registering user' });
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const user = await knex('users').where({ username }).first();
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 });

        return res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        return res.status(500).json({ error: 'Error during login' });
    }
});

//GET from the API
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
            return res.status(response.status).json({ error: 'Error fetching recipes from API' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Server error fetching recipes' });
    }
});


app.post('/favorites', authenticateToken, async (req, res) => {
    const { recipe_id, region } = req.body;

    if (!recipe_id || !region) {
        return res.status(400).json({ error: 'Recipe ID and region are required' });
    }

    try {
        const user = await knex('users').where({ username: req.user.username }).first();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await knex('favorites').insert({
            user_id: user.id,
            recipe_id: recipe_id,
            region: region
        });

        return res.status(201).json({ message: 'Recipe added to favorites' });
    } catch (error) {
        return res.status(500).json({ error: 'Error adding to favorites' });
    }
});


app.get('/favorites', authenticateToken, async (req, res) => {
    try {
        const user = await knex('users').where({ username: req.user.username }).first();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const favorites = await knex('favorites').where({ user_id: user.id });
        return res.status(200).json({ favorites });
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching favorites' });
    }
});


app.put('/favorites/:recipe_id', authenticateToken, async (req, res) => {
    const { recipe_id } = req.params;
    const { region } = req.body;

    if (!region) {
        return res.status(400).json({ error: 'Region is required to update favorite' });
    }

    try {
        const user = await knex('users').where({ username: req.user.username }).first();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const favorite = await knex('favorites')
            .where({ user_id: user.id, recipe_id: recipe_id })
            .first();

        if (!favorite) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        await knex('favorites')
            .where({ user_id: user.id, recipe_id: recipe_id })
            .update({ region: region });

        return res.status(200).json({ message: 'Favorite updated successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Error updating favorite' });
    }
});


app.delete('/favorites/:recipe_id', authenticateToken, async (req, res) => {
    const { recipe_id } = req.params;

    try {
        const user = await knex('users').where({ username: req.user.username }).first();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const favorite = await knex('favorites')
            .where({ user_id: user.id, recipe_id: recipe_id })
            .first();

        if (!favorite) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        await knex('favorites')
            .where({ user_id: user.id, recipe_id: recipe_id })
            .del();

        return res.status(200).json({ message: 'Favorite removed successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Error removing favorite' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
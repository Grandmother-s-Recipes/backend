const express = require('express');
//const knex = require('./knex');  
const axios = require('axios');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();
//const jwt = require('jswtoken');

require('dotenv').config();

app.use(cors());
app.use(express.json());

let users = [];
/*I'm using the users array because i don't have any table but when there will be the table we need to delete!!*/

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
        //await knex('users').insert({username, hashedPassword:password});   This is with table
        users.push({ username, password: hashedPassword });                //This is with array
        return res.status(201).json({Message: 'User register succesfully', username: username,
        hashedPassword: hashedPassword });
    } catch(error) {
        console.error('Error creating user', error);
        res.status(500).json({error: 'Error creating user'});
    }
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // Generate token JWT
        //const token = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        // set the token
        // res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 });
        return res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        return res.status(500).json({ error: 'Error during login' });
    }
});

/*app.post('/favorites', authenticateToken, (req, res) => {
    This is with authToken*/
app.post('/favorites', async (req, res) => { 
    //const { recipeId, region } = req.body;
    const {username, recipeId, region} = req.body;

    if (!recipeId || !region) {
        return res.status(400).json({ error: 'Recipe ID and region are required' });
    }
    /* This is with autToken
    const user = users.find(u => u.username === req.user.username);
    */

    const user = users.find((user) => user.username === username);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    user.favorites.push({ recipeId, region });
    return res.status(201).json({ message: 'Recipe added to favorites' });
});

/* app.get('/favorites', authenticateToken, (req, res) => {
    This is with Authtoken */
app.get('/favorites', async (req, res) => {
    const {username} = req.body;

    /*const user = users.find(u => u.username === req.user.username);
    This is with Authtoker*/
    const user = user.find((user) => user.username === username);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ favorites: user.favorites });
});

/*app.put('/favorites/:recipeId', authenticateToken, (req, res) => {
    This is with authToken */
app.put('/favorites/:recipeId', (req,res) => {
    const { recipeId } = req.params;
    const { region } = req.body;

    if (!region) {
        return res.status(400).json({ error: 'Region is required to update favorite' });
    }

    //const user = users.find(u => u.username === req.user.username);
    const user = users.find((user) => user.username === username);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const favorite = user.favorites.find(f => f.recipeId === recipeId);
    if (!favorite) {
        return res.status(404).json({ error: 'Favorite not found' });
    }

    favorite.region = region;
    return res.status(200).json({ message: 'Favorite updated successfully' });
});


/*app.delete('/favorites/:recipeId', authenticateToken, (req, res) => {
    This is with authToken */
app.delete('/favorites/:recipeId', async (req, res) => {
    const { recipeId } = req.params;
    const { username } = req.body;

    //const user = users.find(u => u.username === req.user.username);
    const user = user.find((user) => user.username === username);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const favoriteIndex = user.favorites.findIndex(f => f.recipeId === recipeId);
    if (favoriteIndex === -1) {
        return res.status(404).json({ error: 'Favorite not found' });
    }

    user.favorites.splice(favoriteIndex, 1);
    return res.status(200).json({ message: 'Favorite removed successfully' });
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});

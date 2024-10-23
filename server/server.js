const express = require('express');
const knex = require('./knex');  
const axios = require('axios');  
const cors = require('cors');
const authRoutes = require('./auth.js');

const app = express();


require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});

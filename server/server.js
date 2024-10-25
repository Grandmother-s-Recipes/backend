const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const bcrypt = require('bcrypt');
const axios = require('axios');
const knex = require('./knex');
const cors = require('cors');
require('dotenv').config();

const app = express();
const API_URL = process.env.API_URL;
const corsOptions = {
  origin: API_URL,
  optionsSuccessStatus: 200,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.use(session({
  secret: process.env.SESSION_SECRET || 'mySecret', 
  resave: false, 
  saveUninitialized: false, 
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, 
    secure: false // Imposta su `true` se usi HTTPS in produzione
  },
  store: new MemoryStore ({
    checkPeriod: 86400000
  }),
}));

//default path
app.get("", (req, res) => {
  res.status(200).send("This is the server for Grandmother's Recipes.");
});

const authenticateSession = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};


app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const existingUser = await knex('user').where({ username }).first();
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    await knex('user').insert({
      username,
      password: hashedPassword
    });

    return res.status(201).json({ 
      message: 'User registered successfully',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error registering user' });
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await knex('user').where({ username }).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    req.session.userId = user.id;
    return res.status(200).json(user.id);
  } catch (error) {
    return res.status(500).json({ error: 'Error logging in' });
  }
});


app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.clearCookie('connect.sid'); // DELETE COOKIE
    return res.status(200).json({ message: 'Logged out successfully' });
  });
});


app.post('/favorites', async (req, res) => {
  const { user_id, recipe_id, region } = req.body;

  try {
    await knex('favorite').insert({
      recipe_id,
      region,
      user_id,
    });

    return res.status(201).json({ message: 'Favorite added successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Error adding favorite' });
  }
});


app.delete('/favorites/:id', async (req, res) => {
    const { id } = req.params; 
  
    try {
      const favorite = await knex('favorite')
        .where({ id }) 
        .first();
  
      if (!favorite) {
        return res.status(404).json({ error: 'Favorite not found' });
      }
  
      await knex('favorite')
        .where({ id }) 
        .del();
  
      return res.status(200).json({ message: 'Favorite removed successfully' });
    } catch (error) {
      console.error(error); 
      return res.status(500).json({ error: 'Error removing favorite' });
    }
  });
  

app.get('/favorites', async (req, res) => {
  try {
    const favorites = await knex('favorite')
      .where({ user_id: req.query.user_id });
    return res.status(200).json(favorites);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching favorites' });
  }
});


app.get('/recipes', async (req, res) => {
  const { region } = req.query;

  if (!region) {
    return res.status(400).json({ error: 'Region parameter is required' });
  }

  const apiUrl = `https://api.api-ninjas.com/v1/recipe?query=${region}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: { 'x-api-key': process.env.API_KEY }
    });

    if (response.status === 200) {
      return res.status(200).json(response.data);
    } else {
      return res.status(response.status).json({ error: 'Error fetching recipes from API' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server error fetching recipes' });
  }
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});




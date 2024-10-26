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
console.log(API_URL);
const corsOptions = {
  origin: API_URL,
  optionsSuccessStatus: 200,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
  secret: process.env.SESSION_SECRET || 'mySecret', 
  resave: false, 
  saveUninitialized: false, 
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, 
    secure: false, // Imposta su `true` se usi HTTPS in produzione
    sameSite: 'lax'
  },
  store: new MemoryStore ({
    checkPeriod: 86400000
  }),
}));

const authenticateSession = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

//default path
app.get("/", (req, res) => {
  res.status(200).send("This is the server for Grandmother's Recipes.");
});

app.get("/", authenticateSession, (req, res) => {
  // this is only called when there is an authenticated user due to authenticateSession
  res.status(200).json({ message: "This is the server for the Grandmother's Recipes", session: req.session.userId});
})


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

    await knex('user').insert({
      username,
      password: hashedPassword
    });

    const user = await knex('user').where({ username }).first();

    req.session.userId = user.id;
    console.log("This is the session info:", req.session);
    req.session.save(function (err) {
      if (err) next(err);
      return res.status(201).json({ 
        message: 'User registered successfully',
      });
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

    // apparently regenerating the session is good practice
    // to guard against "session fixation"
    req.session.regenerate(function (err) {
      if (err) next(err);

      req.session.userId = user.id;

      req.session.save(function (err) {
        return res.status(200).json({ 
          message: 'Logged in successfully',
        });
      });
    });
    
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


app.post('/favorites', authenticateSession, async (req, res) => {
  const { recipe_id, region } = req.body;

  try {
    await knex('favorite').insert({
      user_id: req.session.userId,
      recipe_id,
      region
    });

    return res.status(201).json({ message: 'Favorite added successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Error adding favorite' });
  }
});


app.delete('/favorites/:id', authenticateSession, async (req, res) => {
    const { id } = req.params; 
  
    try {
      const favorite = await knex('favorite')
        .where({ id, user_id: req.session.userId }) 
        .first();
  
      if (!favorite) {
        return res.status(404).json({ error: 'Favorite not found' });
      }
  
      await knex('favorite')
        .where({ id, user_id: req.session.userId }) 
        .del();
  
      return res.status(200).json({ message: 'Favorite removed successfully' });
    } catch (error) {
      console.error(error); 
      return res.status(500).json({ error: 'Error removing favorite' });
    }
  });
  

app.get('/favorites', authenticateSession, async (req, res) => {
  try {
    const favorites = await knex('favorite')
      .where({ user_id: req.session.userId });

    return res.status(200).json({ favorites });
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




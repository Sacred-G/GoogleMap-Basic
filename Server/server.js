require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');

const app = express();
const secret = process.env.JWT_SECRET;

// MongoDB Data API configuration
const MONGO_API_BASE_URL = 'https://us-east-2.aws.data.mongodb-api.com/app/data-dyfwt/endpoint/data/v1';
const MONGO_API_KEY = process.env.MONGO_API_KEY;
const MONGO_DATABASE = 'your_database_name';
const MONGO_COLLECTION_USERS = 'users';
const MONGO_COLLECTION_MARKERS = 'markers';

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// Passport configuration
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
    let user = await axios.post(`${MONGO_API_BASE_URL}/findOne`, {
        dataSource: "Cluster0",
        database: MONGO_DATABASE,
        collection: MONGO_COLLECTION_USERS,
        filter: { username: profile.username }
    }, {
        headers: {
            'Content-Type': 'application/json',
            'api-key': MONGO_API_KEY
        }
    }).then(response => response.data.document);

    if (!user) {
        user = await axios.post(`${MONGO_API_BASE_URL}/insertOne`, {
            dataSource: "Cluster0",
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            document: { username: profile.username, password: '' }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': MONGO_API_KEY
            }
        }).then(response => response.data);
    }

    const token = jwt.sign({ _id: user._id, username: user.username }, secret);
    done(null, { user, token });
}));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
    let user = await axios.post(`${MONGO_API_BASE_URL}/findOne`, {
        dataSource: "Cluster0",
        database: MONGO_DATABASE,
        collection: MONGO_COLLECTION_USERS,
        filter: { username: profile.emails[0].value }
    }, {
        headers: {
            'Content-Type': 'application/json',
            'api-key': MONGO_API_KEY
        }
    }).then(response => response.data.document);

    if (!user) {
        user = await axios.post(`${MONGO_API_BASE_URL}/insertOne`, {
            dataSource: "Cluster0",
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            document: { username: profile.emails[0].value, password: '' }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': MONGO_API_KEY
            }
        }).then(response => response.data);
    }

    const jwtToken = jwt.sign({ _id: user._id, username: user.username }, secret);
    done(null, { user, token: jwtToken });
}));

app.use(passport.initialize());

// Authentication middleware
const auth = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Access denied. No token provided.');

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(401).send('Invalid token.');
        req.user = decoded;
        next();
    });
};

// API endpoints
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const response = await axios.post(`${MONGO_API_BASE_URL}/insertOne`, {
            dataSource: "Cluster0",
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            document: { username, password: hashedPassword }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': MONGO_API_KEY
            }
        });

        res.send(response.data);
    } catch (error) {
        res.status(400).send(error.response ? error.response.data : error.message);
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const response = await axios.post(`${MONGO_API_BASE_URL}/findOne`, {
            dataSource: "Cluster0",
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_USERS,
            filter: { username }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': MONGO_API_KEY
            }
        });

        const user = response.data.document;
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send('Invalid username or password.');
        }

        const token = jwt.sign({ _id: user._id, username: user.username }, secret);
        res.send({ token });
    } catch (error) {
        res.status(400).send(error.response ? error.response.data : error.message);
    }
});

app.post('/api/markers', auth, async (req, res) => {
    try {
        const response = await axios.post(`${MONGO_API_BASE_URL}/insertOne`, {
            dataSource: "Cluster0",
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_MARKERS,
            document: req.body
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': MONGO_API_KEY
            }
        });

        res.send(response.data);
    } catch (error) {
        res.status(400).send(error.response ? error.response.data : error.message);
    }
});

app.get('/api/markers', async (req, res) => {
    try {
        const response = await axios.post(`${MONGO_API_BASE_URL}/find`, {
            dataSource: "Cluster0",
            database: MONGO_DATABASE,
            collection: MONGO_COLLECTION_MARKERS,
            filter: {}
        }, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': MONGO_API_KEY
            }
        });

        res.send(response.data.documents);
    } catch (error) {
        res.status(400).send(error.response ? error.response.data : error.message);
    }
});

// GitHub OAuth routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    res.redirect(`/?token=${req.user.token}`);
});

// Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect(`/?token=${req.user.token}`);
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors'; // Make sure cors is imported
import User from './models/User.js'
import Meals from './models/Meal.js';
import bycr from 'bcrypt';
import validateCaptcha from './middleware/captchavalidate.js';
import Feedback from './models/Feedbacks.js';

dotenv.config();

const app = express();


// Enable CORS for all origins (allow any front-end to access this server)
app.use(cors());

// Enable CORS with specific origin (if needed, uncomment the next line)
app.use(cors({
    origin: 'http://localhost:5173' // Make sure to replace this with your React app URL
}));

app.use(express.json());



mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/Cafeteria', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('MongoDB connected successfully!');
    })
    .catch((err) => {
        console.error('MongoDB connection failed:', err);
    });
// Example route
app.post('/signup', validateCaptcha, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'Un utilisateur avec cet email existe déjà',
                UserCreated: false,
            });
        }

        let role = 'client'
        const hashedPassword = await bycr.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword, role });

        // Save the user to the database
        await newUser.save();
        res.status(201).json({ message: 'Compte crée avec succès', UserCreated: true });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Erreur lors de la création du compte', error: err, UserCreated: false });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email incorrect' });
        }
        const isPasswordValid = await bycr.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }
        res.status(200).json({ message: 'Connexion réussie', UserLogged: true });
    }
    catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).json({ message: 'Erreur lors de la connexion', error: err, UserLogged: false });
    }

})

app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});

app.get('/Meals', async (req, res) => {
    try {
        const MealsList = await Meals.find().lean();

        const enrichedMeals = await Promise.all(MealsList.map(async (meal) => {
            const feedbacks = await Feedback.find({meal: meal._id}).populate('user', 'name email').lean();
            try {
                return { ...meal, feedbacks };
            } catch (err) {
                console.error(`Error fetching feedbacks for meal ${meal._id}:`, err);
                return { ...meal, feedbacks: [] };
            }
        }));


        res.status(200).json({ message: 'Liste des meals avec feedbacks', MealsList: enrichedMeals });
    } catch (err) {
        console.error('Error getting meals and feedbacks:', err);
        res.status(500).json({ message: 'Erreur lors de la récupération des meals et feedbacks', error: err });
    }
});


// Connect to MongoDB (replace with your actual Mongo URI in the .env)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

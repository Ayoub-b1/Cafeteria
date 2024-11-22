import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors'; // Make sure cors is imported
import User from './models/User.js'
import Meals from './models/Meal.js';
import bycr from 'bcrypt';
import validateCaptcha from './middleware/captchavalidate.js';
import Feedback from './models/Feedbacks.js';
import Order from './models/Order.js';
import qrcode from 'qrcode'
import Meal from './models/Meal.js';
dotenv.config();

const app = express();


// Enable CORS for all origins (allow any front-end to access this server)
app.use(cors());

// Enable CORS with specific origin (if needed, uncomment the next line)


app.use(express.json());



mongoose.connect(process.env.PRODMONGORI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout for server selection
    socketTimeoutMS: 45000,        // Timeout for socket inactivity
    bufferCommands: false,         // Disable buffering
})
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => console.error('MongoDB connection failed:', err));

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
        res.status(200).json({ message: 'Connexion réussie', UserLogged: true, username: user.name, role: user.role });
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
            const feedbacks = await Feedback.find({ meal: meal._id }).populate('user', 'name email').lean();

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


app.post('/Order', async (req, res) => {
    try {
        const { client, mealId, mealName, price, quantity, time } = req.body;

        // Format meals to match the schema structure
        const meals = [{
            meal: mealId,
            quantity: quantity,
        }];

        // Create a new Order document
        const order = new Order({
            client,
            meals,
            time,
        });

        // Save the order first to generate the _id
        await order.save();

        // Now that the order is saved and has an _id, generate the QR code using _id
        const qrCodeData = await qrcode.toDataURL(order._id.toString()); // Using _id as the unique identifier

        // Update the order with the generated QR code
        order.qrCode = qrCodeData;
        await order.save();

        // Send the response with the order and QR code
        res.status(201).json({ message: 'Commande enregistrée avec succès', order, qrCode: qrCodeData });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la commande', error: err.message });
    }
});

app.get('/Order/:email', async (req, res) => {
    try {
        // Populate the 'meal' field in the 'meals' array correctly
        const orders = await Order.find({ client: req.params.email })
            .populate('meals.meal')  // Populate 'meal' in the 'meals' array
            .exec();

        res.status(200).json({ message: 'Commandes récupérées avec succès', orders });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error: err.message });
    }
});
app.get('/Orders/:email', async (req, res) => {
    try {

        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        } else {
            if (user.role === 'admin') {
                const orders = await Order.find()
                    .populate('meals.meal')
                    .exec();

                res.status(200).json({ message: 'Commandes récupérées avec succès', orders });
            } else {
                res.status(501).json({ message: 'Vous n\'êtes pas autorisé à accéder à ces informations' })
            }
        }

    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des commandes', error: err.message });
    }
});

app.patch('/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, refusedReason } = req.body;

    try {
        const updateData = { status };
        if (status === 'refused' && refusedReason) {
            updateData.refusedReason = refusedReason;
        }

        const order = await Order.findByIdAndUpdate(id, updateData, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ order });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status' });
    }
});

app.post('/leavefeedback', async (req, res) => {
    const { orderId, client, feedback, rating ,mealId } = req.body;

    try {
        // Validate user existence
        const user = await User.findOne({ email: client });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate order existence
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        const meal = await Meal.findOne({ _id :mealId});
        if (!meal) {
            return res.status(404).json({ message: 'Meal not found'  , meal : meal , order : order});
        }

        // Check for existing feedback
        let existingFeedback = await Feedback.findOne({
            user: user._id,
            meal: meal._id,
        });

        if (existingFeedback) {
            // Update feedback if it exists
            existingFeedback.stars = rating;
            existingFeedback.feedback = feedback;
            existingFeedback.date = Date.now();

            await existingFeedback.save();
            return res.status(200).json({ message: 'Feedback updated successfully', feedback: existingFeedback });
        } else {
            const newFeedback = new Feedback({
                user: user._id,
                meal: meal._id, // Assuming order has a mealId field
                stars: rating,
                feedback: feedback,
            });

            await newFeedback.save();
            return res.status(201).json({ message: 'Feedback created successfully', feedback: newFeedback });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error processing feedback', error: error.message });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

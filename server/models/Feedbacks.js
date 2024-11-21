import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true },
    stars: {
        type: Number,
        required: true,
        min: 1, // Minimum value
        max: 5, // Maximum value
        validate: {
            validator: Number.isInteger, // Ensure it's an integer
            message: 'Stars must be an integer.',
        },
    },
    feedback: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
})

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
const validateCaptcha = async (req, res, next) => {
    const { captchaToken } = req.body;
    const SECRET_KEY = process.env.CAPTCHA_SECRET_KEY;
    if (!captchaToken) {
        return res.status(400).json({ success: false, message: "CAPTCHA token is missing" });
    }

    try {
        const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${SECRET_KEY}&response=${captchaToken}`,
        });

        const data = await response.json();

        if (!data.success) {
            return res.status(400).json({ success: false, message: "CAPTCHA verification failed" });
        }

        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        console.error("CAPTCHA validation error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export default validateCaptcha;
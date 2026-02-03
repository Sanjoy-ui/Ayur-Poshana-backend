import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId || typeof userId !== 'string') {
            return res.status(401).json({ message: "Invalid userId" });
        }

        const user = await User.findById(userId).select('-password');  // Exclude password field

        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error in getCurrentUser:', error);
        return res.status(500).json({ message: `get current user error` });
    }
};

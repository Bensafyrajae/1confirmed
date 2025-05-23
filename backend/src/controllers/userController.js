const User = require('../models/User');
const logger = require('../utils/logger');

class UserController {
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.userId);
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                companyName: user.companyName
            });
        } catch (error) {
            logger.error('Error fetching user profile:', error);
            res.status(500).json({ error: 'Failed to fetch user profile' });
        }
    }

    async updateProfile(req, res) {
        try {
            const { firstName, lastName, companyName } = req.body;
            
            const user = await User.update(req.user.userId, {
                firstName,
                lastName,
                companyName
            });
            
            res.json({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                companyName: user.companyName
            });
        } catch (error) {
            logger.error('Error updating user profile:', error);
            res.status(500).json({ error: 'Failed to update user profile' });
        }
    }
}

module.exports = new UserController();
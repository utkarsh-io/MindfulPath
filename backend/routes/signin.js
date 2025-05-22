// signin.js
import express from 'express';
import { sql } from '../config/db.js';
import { generateToken } from '../middlewares/jwt.js';

const router = express.Router();

// signin for user
router.post('/user', async (req, res) => {
    try {
        console.log('inside signin.js');

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Query and check if this email exists
        const checkUser = await sql`
            SELECT * FROM users WHERE email=${email}
        `;
        console.log(checkUser);
        
        // Use array length to check if user exists
        if (checkUser.length === 0) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        // Check if password is correct
        if (checkUser[0].password !== password) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // Create JWT token for authorization
        const payload = {
            user_id: checkUser[0].user_id,
            email: checkUser[0].email,
            role: 'user'
        };

        const token = generateToken(payload);
        const auth = "Bearer " + token;
        res.status(200).json({ success: true, token: auth });

    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// signin for expert
router.post('/expert', async (req, res) => {
    try {
        console.log('inside signin.js');

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Query and check if this email exists
        const checkExpert = await sql`
            SELECT * FROM counselling_experts WHERE email=${email}
        `;
        console.log(checkExpert);
        
        // Use array length to check if expert exists
        if (checkExpert.length === 0) {
            return res.status(400).json({ error: 'Expert does not exist' });
        }

        // Check if password is correct
        if (checkExpert[0].password !== password) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // Create JWT token for authorization
        const payload = {
            expert_id: checkExpert[0].expert_id,
            email: checkExpert[0].email,
            role: 'expert'
        };

        const token = generateToken(payload);
        const auth = "Bearer " + token;
        res.status(200).json({ success: true, token: auth });

    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

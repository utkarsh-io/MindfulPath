import express from 'express';
import { sql } from '../config/db.js';
import { generateToken } from '../middlewares/jwt.js';
const router= express.Router();

// signup for users only
router.post('/user', async (req, res) => {
    try {
        // sample
        // {
        //     "user_name": "test",
        //     "email": "test@gmail.com",
        //     "password": "test"
        // }
        const { user_name, email, password}= req.body;
        if (!user_name || !email || !password) {
            return res.status(400).json({error: 'All fields are required'});
        }
        
        // first query and check if this email is already registered
        const checkEmail= await sql`
            SELECT * FROM users WHERE email=${email}
        `;

        if (checkEmail.count>0) {
            return res.status(400).json({error: 'Email already exists'});
        }

        // second check if user_name is already taken
        const checkUserName= await sql`
            SELECT * FROM users WHERE user_name=${user_name}
        `;

        if (checkUserName.count>0) {
            return res.status(400).json({error: 'Username already taken'});
        }

        // insert the user into the database
        const newUser= await sql`
            INSERT INTO users (user_name, email, password) VALUES (${user_name}, ${email}, ${password}) RETURNING *
        `;

        // create jwt token for authorization
        // payload will be having user_id, email, role='user'
        // return this token and a success true
        const payload= {
            user_id: newUser[0].user_id,
            email: newUser[0].email,
            role: 'user'
        };
        
        const token= generateToken(payload);
        const auth= "Bearer "+token;
        res.status(200).json({success: true, token: auth});
    }
    catch(error) {
        console.log('Error: ', error);
        res.status(500).json({error: 'Internal server error'});
    }
})

export default router;
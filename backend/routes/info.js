// info.js

import express from 'express';

import { sql } from '../config/db.js';
import { verifyToken } from '../middlewares/jwt.js';

const router= express.Router();

// get all users
router.get('/users', verifyToken ,async (req, res) => {

    if(req.user.role!=='admin') {
        return res.status(401).json({error: 'Unauthorized'});
    }

    try {
        const users= await sql`
            SELECT * FROM users
        `;
        res.status(200).json(users);
    }
    catch(error) {
        console.log('Error: ', error);
        res.status(500).json({error: 'Internal server error'});
    }
})

// get all experts
router.get('/experts', verifyToken ,async (req, res) => {
    if(req.user.role!=='admin') {
        return res.status(401).json({error: 'Unauthorized'});
    }

    try {
        const experts= await sql`
            SELECT * FROM counselling_experts
        `;
        res.status(200).json(experts);
    }
    catch(error) {
        console.log('Error: ', error);
        res.status(500).json({error: 'Internal server error'});
    }
})

// get given users info

router.get('/user/:id', verifyToken ,async (req, res) => {

    try {
        const user= await sql`
            SELECT * FROM users WHERE user_id=${req.user.user_id}
        `;
        if(user.count===0) {
            return res.status(404).json({error: 'User not found'});
        }
        console.log(user[0]+" fetched from the database");
        res.status(200).json(user[0]);
    }
    catch(error) {
        console.log('Error: ', error);
        res.status(500).json({error: 'Internal server error'});
    }
})

// get given expert info

router.get('/expert/:id', verifyToken ,async (req, res) => {

    try {
        const expert= await sql`
            SELECT * FROM counselling_experts WHERE expert_id=${req.user.expert_id}
        `;
        if(expert.count===0) {
            return res.status(404).json({error: 'Expert not found'});
        }
        res.status(200).json(expert[0]);
    }
    catch(error) {
        console.log('Error: ', error);
        res.status(500).json({error: 'Internal server error'});
    }
}
)

// check whether the request is being send by user or expert and return that

router.get('/role', verifyToken ,async (req, res) => {
    if(req.user.role==='user') {
        return res.status(200).json({role: 'user'});
    }
    else if(req.user.role==='expert') {
        return res.status(200).json({role: 'expert'});
    }
    else {
        return res.status(200).json({role: 'admin'});
    }
}
)



export default router;
// api.js
import express from 'express';
import signin from './signin.js';
import signup from './signup.js';
import info from './info.js';
import connect from './connect.js';
import admin from './admin.js';

const router= express.Router();

router.use('/signin',signin);
router.use('/signup',signup);
router.use('/info',info);
router.use('/connect',connect); // this user needs to be connected to an expert
router.use('/admin', admin);

// router.use('/ml_model',ml_model) // getting predictions from ml model
// router.use('/llm',chatbot) // ai counselling feature

export default router;
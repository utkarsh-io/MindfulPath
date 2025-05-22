// connect.js
import express from 'express';
import { verifyToken } from '../middlewares/jwt.js';
import { sql } from '../config/db.js';
import axios from 'axios';
import cloudinary from '../config/cloudinaryConfig.js'; 
import dotenv from 'dotenv';
dotenv.config();

const { ADMIN_SECRET } = process.env;

const router = express.Router();

router.post('/userqueue', verifyToken, async (req, res) => {
    // Allow only user and admin to access this route
    try {
        const { user_id } = req.user;
        const { date, start_time } = req.body;

        // First, check if this user_id is already in the queue
        const checkUser = await sql`
            SELECT * FROM queue 
            WHERE user_id=${user_id} AND duration IS NULL
        `;
        if (checkUser.length > 0) {
            // User is already in the queue, so create a notification
            const notificationMsg = 'User already in the queue';
            
            return res.status(400).json({ error: notificationMsg });
        }

        // Insert the user_id into the queue if not already present
        const insertintoQueue = await sql`
            INSERT INTO queue (user_id, date, start_time)
            VALUES (${user_id}, ${date}, ${start_time})
            RETURNING *
        `;
        res.status(200).json(insertintoQueue[0]);
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/userqueue', verifyToken, async (req, res) => {
    // Allow only expert and admin to access this route
    try {
        const getQueue = await sql`
            SELECT * FROM queue
            WHERE duration IS NULL
            ORDER BY date, start_time ASC
        `;
        res.status(200).json(getQueue);
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// update the queue entry such that duration is set
router.put('/userqueue/:user_id', verifyToken, async (req, res) => {
    // Allow only expert and admin to access this route
    try {
        const { user_id } = req.params; // user_id instead of id
        const { duration } = req.body;

        const updateQueue = await sql`
        UPDATE queue
        SET duration = ${duration} * INTERVAL '1 second'
        WHERE user_id = ${user_id} AND duration IS NULL
        RETURNING *
        `;
        console.log('Queue entry updated:', updateQueue[0]);
        res.status(200).json(updateQueue[0]);
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// post to message table
router.post('/message', verifyToken, async (req,res) => {
    const {conversation_id , message, role} = req.body;
    try
    {
        const create_msg = await sql`
        INSERT INTO messages (conversation_id, message, sender)
        VALUES (${conversation_id}, ${message}, ${role})
        RETURNING *
        `;
        console.log('New message recorded:', create_msg[0]);
        res.status(200).json(create_msg[0]);
    }
    catch(error){
        console.log("Error: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
} )

// post to counselled_by table
router.post('/counselled_by', verifyToken, async (req,res) => {

    const {user_id, expert_id, date, start_time} = req.body;
    try
    {
        const create_conv= await sql`
        INSERT INTO counselled_by ( user_id, expert_id, date, start_time)
        VALUES ( ${user_id}, ${expert_id}, ${date}, ${start_time})
        RETURNING *
        `;
        console.log('counselled_by entry created: ', create_conv);
        res.status(200).json(create_conv[0]);
    }
    catch(error){
        console.log('Error: ', error);
        res.status(500).json({error: 'Internal Server error'});
    }
})

// put to counselled_by table
router.put('/counselled_by/:conv_id', verifyToken, async (req,res) => {
    //update the duration in the counselled_by table once the session is over
    const { conv_id } = req.params;
    const { duration } = req.body;
    try{
        const update= await sql`
        UPDATE counselled_by
        SET duration = ${duration} * INTERVAL '1 second'
        WHERE conversation_id = ${conv_id}
        RETURNING *
        `
        console.log('counselled_by entry updated with duration: ', update[0]);
        res.status(200).json(update[0]);
    } catch(error){
        console.log("Error ", error);
        res.status(500).json({error: 'Internal Server error'})
    }

})

// upload files to cloudinary and get its url in response
router.post('/upload', async (req, res) => {
    try {
      const { fileData, resourceType } = req.body; // fileData is a Base64 string or URL/path
      const result = await cloudinary.uploader.upload(fileData, {
        resource_type: resourceType || 'auto', // auto detects file type (PDF, image, etc.)
      });
      res.status(200).json({ url: result.secure_url });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "File upload failed", details: error.message });
    }
  });
  
 
  // submitting applications for being a counsellor
  router.post('/counsellorformsubmit', async (req, res) => {
    try {
      const {
        full_name,
        email,
        phone,
        location,
        education,
        certifications,
        years_experience,
        areas_of_expertise,
        resume_url,
        cover_letter,
        profile_image_url,
      } = req.body;
  
      await sql`
        INSERT INTO counsellor_applications (
          full_name,
          email,
          phone,
          location,
          education,
          certifications,
          years_experience,
          areas_of_expertise,
          resume_url,
          cover_letter,
          profile_image_url
        )
        VALUES (
          ${full_name},
          ${email},
          ${phone},
          ${location},
          ${education},
          ${certifications},
          ${years_experience},
          ${areas_of_expertise},
          ${resume_url},
          ${cover_letter},
          ${profile_image_url}
        )
      `;
      console.log("Application submitted successfully")
      res.status(201).json({ message: 'Application submitted successfully' });
    } catch (error) {
      console.error('Error inserting application:', error);
      res.status(500).json({ error: 'Failed to submit application', details: error.message });
    }
  });

  // Create journal entry for today's date
router.post('/journal', verifyToken, async (req, res) => {
    try {
      const { user_id } = req.user;
      const { journal_text, title} = req.body;
      // Get today's date in YYYY-MM-DD format
      const journal_date = new Date().toISOString().split('T')[0];
  
      // Attempt to insert a new journal entry for today.
      // The UNIQUE constraint on (user_id, journal_date) will prevent duplicate entries.
      await sql`
        INSERT INTO journal_entries (user_id, journal_date, title, journal_text, mood)
        VALUES (${user_id}, ${journal_date}, ${title || null}, ${journal_text}, ${null})
      `;
  
      res.status(201).json({ message: 'Journal entry created successfully for today.' });
    } catch (err) {
      console.error('Error creating journal entry: ', err);
      res.status(500).json({ error: 'Failed to create journal entry', details: err.message });
    }
  });

  // Update journal entry only for today's date (cannot update previous entries)
router.put('/journal', verifyToken, async (req, res) => {
    try {
      const { user_id } = req.user;
      const { journal_text, title} = req.body;
      // Get today's date in YYYY-MM-DD format
      const journal_date = new Date().toISOString().split('T')[0];
  
      // Update the journal entry for today's date if it exists.
      // We use RETURNING * to check if an entry was updated.
      const result = await sql`
        UPDATE journal_entries
        SET title = ${title || null},
            journal_text = ${journal_text}
        WHERE user_id = ${user_id} AND journal_date = ${journal_date}
        RETURNING *
      `;
  
      if (result.length === 0) {
        return res.status(404).json({ error: 'No journal entry found for today to update.' });
      }
  
      res.status(200).json({ message: 'Journal entry updated successfully for today.' });
    } catch (err) {
      console.error('Error updating journal entry: ', err);
      res.status(500).json({ error: 'Failed to update journal entry', details: err.message });
    }
  });

  // get journal of user
  router.get('/journal', verifyToken, async (req, res) => {
    const { user_id } = req.user;
    // Get the date from query parameter (YYYY-MM-DD); default to today's date if not provided
    const { date } = req.query;
    const journalDate = date || new Date().toISOString().split('T')[0];
  
    try {
      const entries = await sql`
        SELECT title, journal_text, mood 
        FROM journal_entries 
        WHERE user_id = ${user_id} 
          AND journal_date = ${journalDate}
      `;
  
      if (entries.length === 0) {
        return res.status(404).json({ error: 'No journal entry found for that date' });
      }
      
      // Return the found journal entry (assuming unique constraint guarantees only one entry per day)
      res.status(200).json(entries[0]);
    } catch (error) {
      console.error('Error retrieving journal entry:', error);
      res.status(500).json({ error: 'Failed to retrieve journal entry', details: error.message });
    }
  });
  


export default router;
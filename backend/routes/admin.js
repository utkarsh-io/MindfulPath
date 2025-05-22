import express from 'express';
import nodemailer from 'nodemailer';
import { sql } from '../config/db.js';
import { verifyToken, generateToken } from '../middlewares/jwt.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Create a Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mindfulpath420@gmail.com',
    pass: 'nrtm bjbd mefl notw'
  }
});

// POST endpoint to send an email
router.post('/send-mail', verifyToken, async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    
    // Validate required fields
    if (!to || !subject || !text) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, or text' });
    }
    
    // Define mail options
    const mailOptions = {
      from: 'mindfulpath420@gmail.com',
      to,
      subject,
      text,
      ...(html && { html })
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully', info });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Error sending email' });
  }
});

// GET endpoint to fetch all counsellor applications
router.get('/applications', verifyToken, async (req, res) => {
  try {
    const applications = await sql`
      SELECT *
      FROM counsellor_applications
    `;
    res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Error fetching applications' });
  }
});

// Admin login endpoint
const ADMIN_KEY = process.env.ADMIN_SECRET || 'default_admin_key';

router.get('/adminlogin', (req, res) => {
  const { key } = req.query;
  
  if (key === ADMIN_KEY) {
    // Generate a token with payload { role: 'admin' } that expires in 1 hour
    const token = generateToken({ role: 'admin' });
    const auth = "Bearer " + token;
    return res.status(200).json({ success: true, token: auth });
  } else {
    return res.status(401).json({ success: false, message: "Invalid admin key" });
  }
});

// Helper function to generate a random password
function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Create a POST endpoint to add a new expert without taking a password from the input
router.post('/experts', verifyToken, async (req, res) => {
  try {
    const { user_name, email, name, application_id } = req.body;

    // Validate required fields (password is no longer expected from the client)
    if (!user_name || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields: user_name, email, or name' });
    }

    // Generate a random password
    const generatedPassword = generateRandomPassword();

    // Insert the new expert into the counselling_experts table
    const [newExpert] = await sql`
      INSERT INTO counselling_experts (user_name, email, password, name, application_id)
      VALUES (${user_name}, ${email}, ${generatedPassword}, ${name}, ${application_id || null})
      RETURNING *;
    `;

    res.status(201).json({ expert: newExpert, generatedPassword });
  } catch (error) {
    console.error('Error creating expert:', error);
    res.status(500).json({ error: 'Error creating expert' });
  }
});

// PUT endpoint to accept an application
router.put('/applications/:id/accept', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Retrieve the application details
    const [application] = await sql`
      SELECT *
      FROM counsellor_applications
      WHERE application_id = ${id};
    `;
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Generate a random password for the new expert
    const generatedPassword = generateRandomPassword();

    // Create a new expert using applicant details; note that user_name and name are set to full_name
    const [newExpert] = await sql`
      INSERT INTO counselling_experts (user_name, email, password, name, application_id)
      VALUES (${application.full_name}, ${application.email}, ${generatedPassword}, ${application.full_name}, ${id})
      RETURNING *;
    `;

    // Update the application status to 'accepted'
    const [updatedApplication] = await sql`
      UPDATE counsellor_applications
      SET status = 'accepted'
      WHERE application_id = ${id}
      RETURNING *;
    `;

    // Define the congratulatory email options with login credentials
    const mailOptions = {
      from: 'mindfulpath420@gmail.com',
      to: application.email,
      subject: 'Congratulations! Your Counsellor Application is Accepted',
      text: `Dear ${application.full_name},

Congratulations! Your application has been accepted, and you are now a Counselling Expert on our platform.

Your login credentials are as follows:
Email: ${application.email}
Password: ${generatedPassword}

Please keep this information secure and change your password after logging in for the first time.

Best regards,
The Mindful Path Team`
    };

    // Send the congratulatory email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'Application accepted, expert created, and email sent.',
      expert: newExpert,
      application: updatedApplication 
    });
  } catch (error) {
    console.error('Error accepting application:', error);
    res.status(500).json({ error: 'Error processing acceptance' });
  }
});

// PUT endpoint to reject an application
router.put('/applications/:id/reject', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Retrieve the application details
    const [application] = await sql`
      SELECT *
      FROM counsellor_applications
      WHERE application_id = ${id};
    `;
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update the application status to 'rejected'
    const [updatedApplication] = await sql`
      UPDATE counsellor_applications
      SET status = 'rejected'
      WHERE application_id = ${id}
      RETURNING *;
    `;

    // Define the rejection email options
    const mailOptions = {
      from: 'mindfulpath420@gmail.com',
      to: application.email,
      subject: 'Update on Your Counsellor Application',
      text: `Dear ${application.full_name},

We appreciate your interest in joining our team. Unfortunately, we regret to inform you that your application has not been successful this time.

Thank you for your time and effort. We wish you the best in your future endeavors.

Best regards,
The Mindful Path Team`
    };

    // Send the rejection email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'Application rejected and email sent.',
      application: updatedApplication 
    });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ error: 'Error processing rejection' });
  }
});



export default router;

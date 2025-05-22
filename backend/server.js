// server.js

import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import api from './routes/api.js';
import { sql } from './config/db.js';
import { createServer } from 'http';
import { initSocket } from './socketServer.js'; // Import our Socket.IO module

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Mount your API routes.
app.use('/api/v1', api);

// Database initialization (your existing code).
async function initDB() {
  try {
    // Create Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        age INT,
        profession VARCHAR(255),
        name VARCHAR(255)
      );
    `;

    // Create queue table
    await sql`
      CREATE TABLE IF NOT EXISTS queue (
        user_id INT NOT NULL,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        duration INTERVAL,
        PRIMARY KEY (user_id, date, start_time),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      );
    `;

    // Create Counsellor Application table
    await sql`
      CREATE TABLE IF NOT EXISTS counsellor_applications (
        application_id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        location VARCHAR(255),
        education TEXT,
        certifications TEXT,
        years_experience INT,
        areas_of_expertise TEXT,
        resume_url VARCHAR(255),
        cover_letter TEXT,
        profile_image_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create Counselling Experts table
    await sql`
  CREATE TABLE IF NOT EXISTS counselling_experts (
    expert_id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    application_id INT,
    FOREIGN KEY (application_id) REFERENCES counsellor_applications(application_id)
  );
`;

    // Create Counselled_by table
    await sql`
      CREATE TABLE IF NOT EXISTS counselled_by (
        conversation_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        expert_id INT NOT NULL,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        duration INTERVAL,
        UNIQUE (user_id, expert_id, date, start_time),
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (expert_id) REFERENCES counselling_experts(expert_id)
      );
    `;

    // Create Messages table
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        message_id SERIAL PRIMARY KEY,
        conversation_id INT NOT NULL,
        sender VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (conversation_id) REFERENCES counselled_by(conversation_id)
      );
    `;
    
    

    //Create a journal table
    await sql`
    CREATE TABLE IF NOT EXISTS journal_entries (
      user_id INT NOT NULL,
      journal_date DATE NOT NULL,
      title VARCHAR(255),
      journal_text TEXT NOT NULL,
      mood VARCHAR(50),
      UNIQUE (user_id, journal_date),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
  `;

  

    console.log('Database initialized');
  } catch (error) {
    console.log('Error initializing database: ', error);
  }
}

await initDB();

// Create an HTTP server from the Express app.
const httpServer = createServer(app);

// Initialize Socket.IO with the HTTP server.
initSocket(httpServer);

// Start listening on the specified port.
httpServer.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});

// server/index.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
// ... (rest of the imports are the same)
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { AssemblyAI } from 'assemblyai';
import mongoose from 'mongoose';

// ... (Database connection and Mongoose Schema are the same)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));
const transcriptSchema = new mongoose.Schema({ /* ... */ });
const Transcript = mongoose.model('Transcript', transcriptSchema);


const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json()); // <-- ADD THIS LINE TO PARSE JSON BODIES
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({ /* ... */ });
const upload = multer({ storage: storage });


// --- API Routes ---

// ... (GET /api/transcripts and POST /api/upload routes are the same)
app.get('/api/transcripts', async (req, res) => { /* ... */ });
app.post('/api/upload', upload.single('audio'), async (req, res) => { /* ... */ });


// --- NEW ROUTE FOR SUMMARIZATION ---
app.post('/api/summarize', async (req, res) => {
  const { transcriptId } = req.body;

  if (!transcriptId) {
    return res.status(400).json({ error: 'Transcript ID is required.' });
  }

  try {
    console.log(`Summarizing transcript ID: ${transcriptId}`);
    const result = await client.lemur.summarize({
      transcript_id: transcriptId,
      context: "This is a meeting transcription.",
      answer_format: "A few concise bullet points." // You can customize this prompt
    });

    res.json({ summary: result.response });

  } catch (error) {
    console.error('Error during summarization:', error);
    res.status(500).json({ error: 'Summarization failed.' });
  }
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
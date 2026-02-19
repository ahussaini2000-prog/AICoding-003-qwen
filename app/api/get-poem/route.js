import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { load } from 'tesseract.js';
import cheerio from 'cheerio';

// Initialize Tesseract worker
let tesseractWorker = null;

async function getTesseractWorker() {
  if (!tesseractWorker) {
    tesseractWorker = await load({
      logger: m => console.log(m),
    });
  }
  return tesseractWorker;
}

// Function to scrape poems from a website
async function scrapePoemsFromWebsite(websiteUrl, poetName) {
  try {
    // Fetch the website content
    const response = await fetch(websiteUrl);
    const html = await response.text();
    const $ = cheerio.load(html);

    // This is a generic approach - would need to be customized per website
    // Look for common elements that might contain poems
    const poemElements = $('p, div, article').filter((i, elem) => {
      // Check if element likely contains Urdu text
      const text = $(elem).text().trim();
      // Basic check for Arabic/Persian/Urdu characters (Unicode ranges)
      return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
    });

    const poems = [];
    poemElements.each((i, elem) => {
      const text = $(elem).text().trim();
      if (text.length > 50) { // Only consider substantial text blocks
        poems.push(text);
      }
    });

    return poems;
  } catch (error) {
    console.error(`Error scraping website: ${error.message}`);
    return [];
  }
}

// Function to extract text from image using OCR
async function extractTextFromImage(imageUrl) {
  try {
    const worker = await getTesseractWorker();
    const { data: { text } } = await worker.recognize(imageUrl);
    return text;
  } catch (error) {
    console.error(`Error extracting text from image: ${error.message}`);
    return '';
  }
}

export async function POST(request) {
  try {
    const { poetName, websiteUrl } = await request.json();

    if (!poetName || !websiteUrl) {
      return NextResponse.json({ error: 'Poet name and website URL are required' }, { status: 400 });
    }

    // First, check if we already have poems stored for this poet
    let existingPoems = [];
    try {
      const result = await sql`SELECT poem FROM poems WHERE poet_name = ${poetName};`;
      existingPoems = result.rows.map(row => row.poem);
    } catch (error) {
      // Table might not exist yet, that's okay
      console.log('Database table may not exist yet:', error.message);
    }

    // Get poems from the website
    const scrapedPoems = await scrapePoemsFromWebsite(websiteUrl, poetName);
    
    // Filter out poems we already have
    const newPoems = scrapedPoems.filter(poem => 
      !existingPoems.some(existingPoem => 
        existingPoem.localeCompare(poem, undefined, { sensitivity: 'base' }) === 0
      )
    );

    // If we have new poems, select a random one and store it
    let selectedPoem = '';
    if (newPoems.length > 0) {
      // Select a random poem from new ones
      const randomIndex = Math.floor(Math.random() * newPoems.length);
      selectedPoem = newPoems[randomIndex];
      
      // Store the poem in the database
      try {
        await sql`CREATE TABLE IF NOT EXISTS poems (
          id SERIAL PRIMARY KEY,
          poet_name VARCHAR(255) NOT NULL,
          poem TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;
        
        await sql`INSERT INTO poems (poet_name, poem) VALUES (${poetName}, ${selectedPoem});`;
      } catch (dbError) {
        console.error('Error storing poem in database:', dbError.message);
      }
    } else if (existingPoems.length > 0) {
      // If no new poems, select a random one from existing ones that hasn't been recently used
      // For simplicity, just select any random existing poem
      const randomIndex = Math.floor(Math.random() * existingPoems.length);
      selectedPoem = existingPoems[randomIndex];
    } else {
      return NextResponse.json({ error: 'No poems found for this poet' }, { status: 404 });
    }

    return NextResponse.json({ poem: selectedPoem });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
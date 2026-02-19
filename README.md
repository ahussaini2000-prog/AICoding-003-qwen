# Urdu Poem Lookup App

This application allows users to search for random Urdu poems by entering a poet's name and website URL. The app scrapes poems from the provided website, stores them in a database to avoid duplicates, and displays the poem in Urdu Nastaliq font.

## Features

- Input form for poet name and website URL
- Web scraping functionality to find Urdu poems
- OCR capabilities to extract text from images
- Database storage to prevent duplicate selections
- Urdu Nastaliq font display for poems
- English user interface

## Technology Stack

- Next.js 14 with App Router
- React
- Vercel Postgres database
- Cheerio for web scraping
- Tesseract.js for OCR
- Google Fonts for Urdu Nastaliq typography

## Deployment

This app is designed to be deployed on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables for the database connection
3. Deploy the application

## Environment Variables

You'll need to set up the following environment variables for the database:

```
DATABASE_URL=your_postgres_database_url
```

## How It Works

1. User enters poet name and website URL
2. Application scrapes the website for Urdu poems
3. If poems are found in images, OCR is used to extract text
4. New poems are stored in the database
5. A random poem is selected and displayed in Urdu Nastaliq font
6. Previously selected poems are tracked to avoid repetition

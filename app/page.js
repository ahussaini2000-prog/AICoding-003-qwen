'use client';

import { useState } from 'react';

export default function Home() {
  const [poetName, setPoetName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [poem, setPoem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/get-poem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poetName, websiteUrl }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPoem(data.poem);
      } else {
        setError(data.error || 'Failed to fetch poem');
      }
    } catch (err) {
      setError('An error occurred while fetching the poem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Urdu Poem Lookup</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="poetName">Poet Name: </label>
          <input
            type="text"
            id="poetName"
            value={poetName}
            onChange={(e) => setPoetName(e.target.value)}
            required
            style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="websiteUrl">Website URL: </label>
          <input
            type="url"
            id="websiteUrl"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            required
            style={{ marginLeft: '0.5rem', padding: '0.5rem', width: '300px' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: loading ? '#ccc' : '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Get Random Poem'}
        </button>
      </form>
      
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      
      {poem && (
        <div>
          <h2>Poem:</h2>
          <div 
            style={{ 
              direction: 'rtl', 
              textAlign: 'right', 
              fontFamily: 'Noto Nastaliq Urdu, serif',
              fontSize: '1.2rem',
              lineHeight: '2',
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9'
            }}
          >
            {poem}
          </div>
        </div>
      )}
    </div>
  );
}
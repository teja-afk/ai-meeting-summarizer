// client/src/App.js

import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  // ... (existing state variables: selectedFile, status, transcript, etc.)
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState('');
  const [transcript, setTranscript] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [history, setHistory] = useState([]); // State for transcription history

  const audioPlayer = useRef(null);

  // Fetch history when the component loads
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    fetch('http://localhost:5000/api/transcripts')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error("Failed to fetch history:", err));
  };

  const handleFileChange = (event) => {
    // ... (existing code)
    setSelectedFile(event.target.files[0]);
    setStatus('');
    setTranscript(null);
    setAudioUrl('');
  };

  const handleUpload = () => {
    // ... (existing upload logic)
    if (!selectedFile) {
      setStatus('Please select a file first.');
      return;
    }
    const formData = new FormData();
    formData.append('audio', selectedFile);
    setStatus('Uploading and transcribing... This may take a moment.');
    fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setStatus(`Error: ${data.error}`);
      } else {
        setStatus('Transcription complete!');
        setTranscript(data);
        setAudioUrl(data.audio_url);
        fetchHistory(); // Refresh history after a new upload
      }
    })
    .catch(err => {
      console.error('Error:', err);
      setStatus(`Upload failed. ${err.message}`);
    });
  };

  const handleTimeUpdate = () => {
    // ... (existing code)
    if (audioPlayer.current) {
      setCurrentTime(audioPlayer.current.currentTime * 1000);
    }
  };

  const isWordHighlighted = (word) => {
    // ... (existing code)
    return currentTime >= word.start && currentTime <= word.end;
  };

  // Function to load a past transcription
  const loadFromHistory = (item) => {
      setTranscript(item);
      setAudioUrl(item.audio_url);
      setStatus('Loaded from history.');
  }

  return (
    <div className="App-container">
      <div className="history-panel">
        <h2>History</h2>
        {history.length > 0 ? (
          history.map(item => (
            <div key={item._id} className="history-item" onClick={() => loadFromHistory(item)}>
              <p>{item.text.substring(0, 50)}...</p>
              <small>{new Date(item.createdAt).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <p>No past transcriptions.</p>
        )}
      </div>
      <div className="main-panel">
        <header className="App-header">
          <h1>Otter.ai Clone</h1>
          {/* ... (rest of the JSX: upload section, status, audio player, transcription) */}
          <p>Upload an audio file to transcribe.</p>
          <div className="upload-section">
            <input type="file" onChange={handleFileChange} accept="audio/*,video/*" />
            <button onClick={handleUpload} disabled={status.includes('transcribing')}>
              {status.includes('transcribing') ? 'Processing...' : 'Upload'}
            </button>
          </div>
          {status && <p className="status-message">{status}</p>}
          {transcript && (
            <div className="transcription-area">
              <audio ref={audioPlayer} src={audioUrl} controls onTimeUpdate={handleTimeUpdate} className="audio-player" />
              <h2>Transcription</h2>
              {transcript.utterances.map((utterance, i) => (
                <div key={i} className="utterance">
                  <p>
                    <strong>Speaker {utterance.speaker}:</strong>
                    {utterance.words.map((word, j) => (
                      <span key={j} className={isWordHighlighted(word) ? 'highlight' : ''}>
                        {' '}{word.text}
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </header>
      </div>
    </div>
  );
}

export default App;
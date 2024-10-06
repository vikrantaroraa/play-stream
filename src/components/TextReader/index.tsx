import React, { useState, useRef } from "react";

const TextReaderWithSynchronizedVoice = () => {
  const [text, setText] = useState(""); // Text input or from file
  const [words, setWords] = useState([]); // Array of words with positions
  const [currentWordIndex, setCurrentWordIndex] = useState(-1); // Index of the word being highlighted
  const [isSpeaking, setIsSpeaking] = useState(false); // Is the app speaking the text
  const [isPaused, setIsPaused] = useState(false); // Is the speech paused
  const [readingSpeed, setReadingSpeed] = useState(1); // Speech speed (default 1x)

  const speechSynthesisRef = useRef(window.speechSynthesis); // Reference to speech synthesis
  const utteranceRef = useRef(null); // Reference to the speech utterance

  // Handles text input
  const handleTextInput = (e) => {
    setText(e.target.value);
  };

  // Handles file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target.result);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid text file.");
    }
  };

  // Splits text into words with start positions for accurate highlighting
  const splitTextIntoWords = (inputText) => {
    const wordRegex = /\S+/g; // Match sequences of non-whitespace characters
    const wordArray = [];
    let match;

    while ((match = wordRegex.exec(inputText)) !== null) {
      wordArray.push({ word: match[0], start: match.index });
    }

    return wordArray;
  };

  // Starts reading aloud and highlighting words
  const startReading = () => {
    if (text) {
      const wordArray = splitTextIntoWords(text);
      setWords(wordArray);
      setCurrentWordIndex(0);
      setIsSpeaking(true);
      setIsPaused(false);

      // Create and configure speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = readingSpeed; // Set speech rate

      // Synchronize the spoken word with the highlighted word
      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const charIndex = event.charIndex;
          const currentIndex = wordArray.findIndex(
            (wordObj) => wordObj.start >= charIndex
          );
          setCurrentWordIndex(
            currentIndex === -1 ? wordArray.length - 1 : currentIndex
          );
        }
      };

      // Stop highlighting when speaking is finished
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentWordIndex(-1);
      };

      utteranceRef.current = utterance;
      speechSynthesisRef.current.speak(utterance);
    }
  };

  // Pauses the speech and word highlighting
  const pauseReading = () => {
    if (isSpeaking) {
      speechSynthesisRef.current.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  // Resumes the speech and word highlighting
  const resumeReading = () => {
    if (isPaused) {
      speechSynthesisRef.current.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    }
  };

  // Stops the reading and resets everything
  const stopReading = () => {
    speechSynthesisRef.current.cancel(); // Stop the speech synthesis
    setIsSpeaking(false);
    setCurrentWordIndex(-1);
    setIsPaused(false);
  };

  // Function to highlight the current word
  const getHighlightedText = () => {
    return words.map((wordObj, index) => (
      <span
        key={index}
        style={{
          backgroundColor:
            index === currentWordIndex ? "#b2bdfd" : "transparent",
        }}
      >
        {wordObj.word}{" "}
      </span>
    ));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Text Reader with Voice</h2>

      {/* Text Input Area */}
      <textarea
        rows={5}
        cols={50}
        value={text}
        onChange={handleTextInput}
        placeholder="Enter your text here."
      />
      <br />

      {/* File Upload Input */}
      <input type="file" accept=".txt" onChange={handleFileUpload} />
      <br />

      {/* Reading Speed Control */}
      <label htmlFor="speedControl">
        Speech Speed: {readingSpeed.toFixed(1)}x
      </label>
      <input
        type="range"
        id="speedControl"
        min="0.5"
        max="2"
        step="0.1"
        value={readingSpeed}
        onChange={(e) => setReadingSpeed(Number(e.target.value))}
      />
      <br />

      {/* Control Buttons */}
      <button onClick={startReading} disabled={isSpeaking || isPaused}>
        Start Reading
      </button>
      <button onClick={pauseReading} disabled={!isSpeaking || isPaused}>
        Pause
      </button>
      <button onClick={resumeReading} disabled={!isPaused}>
        Resume
      </button>
      <button onClick={stopReading}>Stop</button>

      {/* Highlighted Text Display */}
      <div style={{ marginTop: "20px", fontSize: "18px", lineHeight: "1.5" }}>
        {getHighlightedText()}
      </div>
    </div>
  );
};

export default TextReaderWithSynchronizedVoice;

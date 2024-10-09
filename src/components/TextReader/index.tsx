// @ts-nocheck

import React, { useState, useRef, useEffect } from "react";
import styles from "./index.module.css";
import playStreamLogo from "src/assets/images/play-stream-logo-3.png";
import { FileText, Play, Pause, CircleStop, Github } from "lucide-react";
import IconButton from "src/components/IconButton";

const TextReaderWithMultipleVoices = () => {
  const [text, setText] = useState(""); // Text input or from file
  const [words, setWords] = useState([]); // Array of words with positions
  const [currentWordIndex, setCurrentWordIndex] = useState(-1); // Index of the word being highlighted
  const [isSpeaking, setIsSpeaking] = useState(false); // Is the app speaking the text
  const [isPaused, setIsPaused] = useState(false); // Is the speech paused
  const [readingSpeed, setReadingSpeed] = useState(1); // Speech speed (default 1x)
  const [voices, setVoices] = useState([]); // Available voices
  const [selectedVoice, setSelectedVoice] = useState(null); // Selected voice

  const speechSynthesisRef = useRef(window.speechSynthesis); // Reference to speech synthesis
  const utteranceRef = useRef(null); // Reference to the speech utterance
  const fileInputRef = useRef(null);

  // Fetch voices once the component mounts
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesisRef.current.getVoices();
      const filteredVoices = availableVoices.filter(
        (voice) => voice.lang === "en-US" && voice.localService === true
      );
      setVoices(filteredVoices);
      // Set default voice as the first one
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    loadVoices();

    // Some browsers may not have voices loaded immediately
    if (speechSynthesisRef.current.onvoiceschanged !== undefined) {
      speechSynthesisRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

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
  const startReading = (fromIndex = 0) => {
    if (text) {
      const wordArray = splitTextIntoWords(text);
      setWords(wordArray);
      setCurrentWordIndex(fromIndex);
      setIsSpeaking(true);
      setIsPaused(false);

      // Create and configure speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(
        text.slice(wordArray[fromIndex].start)
      );
      utterance.rate = readingSpeed; // Set speech rate
      utterance.voice = selectedVoice; // Set selected voice

      // Synchronize the spoken word with the highlighted word
      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const charIndex = event.charIndex + wordArray[fromIndex].start;
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

  // Restart speech when reading speed or voice changes
  useEffect(() => {
    if (isSpeaking && utteranceRef.current) {
      const fromIndex = currentWordIndex;
      speechSynthesisRef.current.cancel(); // Stop current speech
      startReading(fromIndex); // Restart from the current word
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingSpeed, selectedVoice]);

  // Function to highlight the current word without highlighting the space
  const getHighlightedText = () => {
    return words.map((wordObj, index) => (
      <React.Fragment key={index}>
        <span
          style={{
            backgroundColor:
              index === currentWordIndex ? "#b2bdfd" : "transparent",
            padding: "4px", // Add padding to highlighted word
            borderRadius: index === currentWordIndex ? "4px" : "0", // Smooth edges for highlighted word
          }}
        >
          {wordObj.word}
        </span>
        <span> </span>{" "}
        {/* This renders the space after the word without highlight */}
      </React.Fragment>
    ));
  };

  useEffect(() => {
    // Cleanup function to stop speech when component is unmounted or page is refreshed
    return () => {
      speechSynthesisRef.current.cancel(); // Cancel any ongoing speech
    };
  }, []); // Empty dependency array to ensure this runs only when the component is mounted/unmounted

  return (
    <div className={styles["main-container"]}>
      <div className={styles["header"]}>
        <div className={styles["logo-and-app-name"]}>
          <div className={styles["logo"]}>
            <img src={playStreamLogo} alt="play-stream-logo" />
          </div>
          <span className={styles["app-name"]}>Play Stream</span>
        </div>
        <div className={styles["links"]}>
          <a
            href="https://github.com/vikrantaroraa/play-stream"
            target="_blank"
            rel="noopener"
            title="author-github-link"
          >
            <Github color="#111827" size={22} />
          </a>
        </div>
      </div>
      <div className={styles["app-container"]}>
        <div className={styles["text-input-and-controls-container"]}>
          <div className={styles["upload-button"]}>
            {/* File Upload Input */}
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className={styles["upload-file-input"]}
            />
            <IconButton onClick={() => fileInputRef.current.click()}>
              {/* <FileText className="mr-2 h-4 w-4" /> */}
              <FileText color="white" size={16} />
              Upload File
            </IconButton>
          </div>

          {/* Text Input Area */}
          <textarea
            // rows={5}
            // cols={50}
            value={text}
            onChange={handleTextInput}
            placeholder="Or paste your text here..."
          />

          {/* Voice Selection */}
          <label htmlFor="voiceSelect" className={styles["select-label"]}>
            Select Voice:
          </label>
          <select
            id="voiceSelect"
            value={selectedVoice ? selectedVoice.name : ""}
            onChange={(e) =>
              setSelectedVoice(
                voices.find((voice) => voice.name === e.target.value)
              )
            }
          >
            {voices.map((voice, index) => (
              <option key={index} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>

          {/* Reading Speed Control */}
          <label htmlFor="speedControl" style={{ marginBottom: "8px" }}>
            Reading Speed: {readingSpeed.toFixed(1)}x
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

          {/* Control Buttons */}
          <div className={styles["control-buttons"]}>
            {/* <button
              onClick={() => startReading()}
              disabled={isSpeaking || isPaused}
            >
              Start Reading
            </button> */}
            <IconButton
              onClick={() => startReading()}
              disabled={isSpeaking || isPaused}
            >
              <Play color="white" size={16} />
              Start
            </IconButton>
            {/* <button onClick={pauseReading} disabled={!isSpeaking || isPaused}>
              Pause
            </button> */}
            <IconButton
              onClick={() => pauseReading()}
              disabled={!isSpeaking || isPaused}
            >
              <Pause color="white" size={16} />
              Pause
            </IconButton>
            {/* <button onClick={resumeReading} disabled={!isPaused}>
              Resume
            </button> */}
            <IconButton onClick={() => resumeReading()} disabled={!isPaused}>
              <Play color="white" size={16} />
              Resume
            </IconButton>
            {/* <button onClick={stopReading}>Stop</button> */}
            <IconButton onClick={() => stopReading()}>
              <CircleStop color="white" size={16} />
              Stop
            </IconButton>
          </div>
        </div>

        {/* Highlighted Text Display */}
        <div className={styles["wrapper"]}>
          <div className={styles["response-container"]}>
            {getHighlightedText()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextReaderWithMultipleVoices;

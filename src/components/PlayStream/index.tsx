// @ts-nocheck

import React, { useState, useRef, useEffect } from "react";
import styles from "./index.module.css";
import playStreamLogo from "src/assets/images/play-stream-logo-3.png";
import { FileText, Play, Pause, CircleStop, Github } from "lucide-react";
import IconButton from "src/components/IconButton";
import { defaultText } from "src/data/defaultText";

const PlayStream = () => {
  const [text, setText] = useState(defaultText); // Text input or from file
  const [words, setWords] = useState([]); // Array of words with positions
  const [currentWordIndex, setCurrentWordIndex] = useState(-1); // Index of the word being highlighted
  const [currentSentenceRange, setCurrentSentenceRange] = useState({
    start: -1,
    end: -1,
  });
  const [isSpeaking, setIsSpeaking] = useState(false); // Is the app speaking the text
  const [isPaused, setIsPaused] = useState(false); // Is the speech paused
  const [readingSpeed, setReadingSpeed] = useState(1); // Speech speed (default 1x)
  const [voices, setVoices] = useState([]); // Available voices
  const [selectedVoice, setSelectedVoice] = useState(null); // Selected voice
  const [highlightSentence, setHighlightSentence] = useState(true); // Is the sentence highlighted
  const [lastSpeed, setLastSpeed] = useState(1);
  const [lastVoice, setLastVoice] = useState(null);
  const [isInitialStart, setIsInitialStart] = useState(true);

  const speechSynthesisRef = useRef(window.speechSynthesis); // Reference to speech synthesis
  const utteranceRef = useRef(null); // Reference to the speech utterance
  const fileInputRef = useRef(null);
  const currentWordIndexRef = useRef(currentWordIndex); // Add ref to track the current word index
  const isSpeechTerminatedIntentionallyRef = useRef(false);

  // Here we are using a ref instead of storing the wordArry directly into an array so that, we can refrence the
  // same text that was enetered into the textarea before clicking on "Start" button, between all the re-renders
  // that happens due to a change in voice selection or reading speed. So that we do not reference the text of the textarea
  // if it was changed in any manner after the speech was started. Otherwise those changes will appear in the "response-container"
  // in the middle of speech. Using a ref makes surethat we always reference the same wordArray that was in the textarea
  // before user clicked on "Start" button. This wasy any changes made to text inside textarea are only reflected
  // when the users re-starts the speech after the current ongoing speech completes itself or if the users stops it.

  const wordArrayRef = useRef([]); // Contains all the words being displayed inside the "response-container"

  // Using textRef for the same reason as described for the "wordArrayRef" above. The only difference is that, while
  // wordArrayRef stores an array of words and their start positions or start-indexes inside the "text" variable, the textRef
  // contains reference to all the text inside the "text" variable i.e all the text entered into the textarea
  // before cliking on the "Start" button.
  const textRef = useRef(""); // Contains the reference to all the text that was input into the textarea before clicking "Start" button

  // Fetch voices once the component mounts
  useEffect(() => {
    // Cancel any ongoing speech when the page loads or reloads
    speechSynthesisRef.current.cancel();

    const loadVoices = () => {
      const availableVoices = speechSynthesisRef.current.getVoices();
      const filteredVoices = availableVoices.filter(
        (voice) => voice.lang === "en-US" && voice.localService === true
      );
      setVoices(filteredVoices);
      // Set default voice as the first one
      if (availableVoices.length > 0) {
        setSelectedVoice(filteredVoices[0]);
      }
    };

    loadVoices();

    // Some browsers may not have voices loaded immediately
    if (speechSynthesisRef.current.onvoiceschanged !== undefined) {
      speechSynthesisRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  // Sync currentWordIndexRef with currentWordIndex state
  useEffect(() => {
    currentWordIndexRef.current = currentWordIndex;
  }, [currentWordIndex]); // This keeps the ref up to date with the state

  // Handles text input
  const handleTextInput = (e) => {
    setText(e.target.value);

    // Commenting next line because we don't want the word array to be calculated until the user clicks on "Start"
    // button, because if the app is reading and user starts entering text in the middle of speech, then if the
    // following line is not commented, that newly entered text will start appearing in the highlighted text div
    // as the user continues to type and will disturb the sentence and word highlight sync.

    // setWords(splitTextIntoWords(e.target.value));
  };

  // Handles file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setText(content);

        // to understand why the following line of code has been commented, please read the comment inside the
        // "handleTextInput" function

        // setWords(splitTextIntoWords(content));
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

  const findSentenceRange = (wordIndex, wordArray) => {
    let start = wordIndex;
    let end = wordIndex;

    // Find the start of the sentence
    while (start > 0 && !wordArray[start - 1].word.match(/[.!?]$/)) {
      start--;
    }

    // Find the end of the sentence
    while (end < wordArray.length - 1 && !wordArray[end].word.match(/[.!?]$/)) {
      end++;
    }

    return { start, end };
  };

  // Starts reading aloud and highlighting words
  const startReading = (fromIndex = 0) => {
    if (text) {
      if (isInitialStart) {
        wordArrayRef.current = splitTextIntoWords(text);
        setWords(wordArrayRef.current);
        setIsInitialStart(false);
        textRef.current = text;
      }

      setCurrentWordIndex(fromIndex);
      setCurrentSentenceRange(
        findSentenceRange(fromIndex, wordArrayRef.current)
      );
      setIsSpeaking(true);
      setIsPaused(false);

      // Create and configure speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(
        textRef.current.slice(wordArrayRef.current[fromIndex].start)
      );
      utterance.rate = readingSpeed; // Set speech rate
      utterance.voice = selectedVoice; // Set selected voice

      // Synchronize the spoken word with the highlighted word
      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const charIndex =
            event.charIndex + wordArrayRef.current[fromIndex].start;
          const currentIndex = wordArrayRef.current.findIndex(
            (wordObj) => wordObj.start >= charIndex
          );
          const newWordIndex =
            currentIndex === -1
              ? wordArrayRef.current.length - 1
              : currentIndex;
          setCurrentWordIndex(newWordIndex);
          setCurrentSentenceRange(
            findSentenceRange(newWordIndex, wordArrayRef.current)
          );
        }
      };

      // Stop highlighting when speaking is finished and reset isInitialStart
      utterance.onend = () => {
        // Check if speech was terminated intentionally
        if (isSpeechTerminatedIntentionallyRef.current) {
          // Handle the intentional stop
          clearHighlighting();
          setIsInitialStart(true);

          // Reset the flag after handling the stop
          isSpeechTerminatedIntentionallyRef.current = false;
          return;
        }

        // Check if the browser is Firefox
        if (navigator.userAgent.toLowerCase().includes("firefox")) {
          // Check if the last spoken word is the last word of the text
          if (
            currentWordIndexRef.current === wordArrayRef.current.length - 1 ||
            (!speechSynthesis.speaking && isLastSpokenWord())
          ) {
            clearHighlighting();
            setIsInitialStart(true);
          } else {
            return; // Do nothing if it is not the last word
          }
        } else {
          clearHighlighting();
          setIsInitialStart(true);
        }
      };

      utteranceRef.current = utterance;
      speechSynthesisRef.current.speak(utterance);

      setLastSpeed(readingSpeed);
      setLastVoice(selectedVoice);
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

  // Resumes the speech and word highlighting if nothing changes. But, if the user changes either the selected
  // voice or the reading speed before resuming, then it cancels the current utterance and starts a new one
  // with the latest changes
  const resumeReading = () => {
    if (isPaused) {
      if (readingSpeed !== lastSpeed || selectedVoice !== lastVoice) {
        speechSynthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(
          textRef.current.slice(words[currentWordIndex].start)
        );
        utterance.rate = readingSpeed;
        utterance.voice = selectedVoice;

        utterance.onboundary = (event) => {
          if (event.name === "word") {
            const charIndex = event.charIndex + words[currentWordIndex].start;
            const currentIndex = words.findIndex(
              (wordObj) => wordObj.start >= charIndex
            );
            const newWordIndex =
              currentIndex === -1 ? words.length - 1 : currentIndex;
            setCurrentWordIndex(newWordIndex);
            setCurrentSentenceRange(findSentenceRange(newWordIndex, words));
          }
        };

        utterance.onend = () => {
          // Check if speech was terminated intentionally
          if (isSpeechTerminatedIntentionallyRef.current) {
            // Handle the intentional stop
            clearHighlighting();
            setIsInitialStart(true);

            // Reset the flag after handling the stop
            isSpeechTerminatedIntentionallyRef.current = false;
            return;
          }

          // Check if the browser is Firefox
          if (navigator.userAgent.toLowerCase().includes("firefox")) {
            // Check if the last spoken word is the last word of the text
            if (
              currentWordIndexRef.current === wordArrayRef.current.length - 1 ||
              (!speechSynthesis.speaking && isLastSpokenWord())
            ) {
              clearHighlighting();
              setIsInitialStart(true);
            } else {
              return; // Do nothing if it is not the last word
            }
          } else {
            clearHighlighting();
            setIsInitialStart(true);
          }
        };

        utteranceRef.current = utterance;
        speechSynthesisRef.current.speak(utterance);

        setLastSpeed(readingSpeed);
        setLastVoice(selectedVoice);
      } else {
        speechSynthesisRef.current.resume();
      }

      setIsPaused(false);
      setIsSpeaking(true);
    }
  };

  // Stops the reading and resets everything
  const stopReading = () => {
    isSpeechTerminatedIntentionallyRef.current = true;
    speechSynthesisRef.current.cancel(); // Stop the speech synthesis
    clearHighlighting();
    setIsInitialStart(true);
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

  // Function to highlight the current word and the current sentence
  const getHighlightedText = () => {
    const highlightedText = [];
    let currentSentence = [];
    let sentenceIndex = 0;

    words.forEach((wordObj, index) => {
      const isCurrentSentence =
        index >= currentSentenceRange.start &&
        index <= currentSentenceRange.end;
      const isCurrentWord = index === currentWordIndex;

      const wordSpan = (
        <span
          key={`word-${index}`}
          style={{
            backgroundColor: isCurrentWord ? "#b4bdfb" : "transparent",
            padding: "2px 4px",
            borderRadius: isCurrentWord ? "4px" : "0",
            display: "inline",
          }}
        >
          {wordObj.word}
        </span>
      );

      currentSentence.push(wordSpan);
      // Add space after the word, but only include it in the sentence highlight if it's not the last word of the sentence
      if (index < words.length - 1 && !wordObj.word.match(/[.!?]$/)) {
        currentSentence.push(" ");
      }

      if (wordObj.word.match(/[.!?]$/) || index === words.length - 1) {
        highlightedText.push(
          <span
            key={`sentence-${sentenceIndex}`}
            style={{
              backgroundColor:
                isCurrentSentence && highlightSentence
                  ? "#e8e5ff"
                  : "transparent",
              display: "inline",
              padding: "6px 4px",
              borderRadius: "4px",
            }}
          >
            {currentSentence}
          </span>
        );
        // Add space after the sentence, outside of the highlighting
        if (index < words.length - 1) {
          highlightedText.push(" ");
        }
        currentSentence = [];
        sentenceIndex++;
      }
    });

    return (
      <div style={{ marginTop: "20px", fontSize: "18px", lineHeight: "1.8" }}>
        {highlightedText}
      </div>
    );
  };

  useEffect(() => {
    // Cleanup function to stop speech when component is unmounted or page is refreshed
    return () => {
      speechSynthesisRef.current.cancel(); // Cancel any ongoing speech
    };
  }, []); // Empty dependency array to ensure this runs only when the component is mounted/unmounted

  const clearHighlighting = () => {
    setIsSpeaking(false);
    setCurrentWordIndex(-1);
    setCurrentSentenceRange({ start: -1, end: -1 });
    setIsPaused(false);
  };

  const isLastSpokenWord = () => {
    const currentWordIndex = currentWordIndexRef.current;
    const wordArray = wordArrayRef.current;

    // Regular expression to remove trailing punctuation and symbols
    const sanitizeWord = (word) =>
      word.replace(/[.,!?(){}[\]'"`<>-]+$/g, "").trim();

    // Sanitize the current word
    const currentWordCleaned = sanitizeWord(wordArray[currentWordIndex].word);

    // In the below return statement we are also checking for the indexes along with words because the last
    // word of entered text can also appear anywhere else in the text before the end as well.

    // Loop through the word array from the last word backwards
    for (let i = wordArray.length - 1; i >= 0; i--) {
      const cleanedWord = sanitizeWord(wordArray[i].word);

      // If we find a non-empty word, compare it with the current word and check the index
      if (cleanedWord !== "") {
        return currentWordCleaned === cleanedWord && currentWordIndex === i;
      }
    }

    // If no non-empty word is found, return false
    return false;
  };

  return (
    <div className={styles["main-container"]}>
      <div className={styles["header"]}>
        <div className={styles["logo-and-app-name"]}>
          <div className={styles["logo"]}>
            <img src={playStreamLogo} alt="play-stream-logo" />
          </div>
          <span className={styles["app-name"]}>PlayStream</span>
        </div>
        <div className={styles["links"]}>
          <a
            href="https://github.com/vikrantaroraa/play-stream"
            target="_blank"
            rel="noopener"
            title="github-repo-link"
          >
            <Github color="#111827" size={26} />
          </a>
        </div>
      </div>
      <div className={styles["app-container"]}>
        <div className={styles["text-input-and-controls-container"]}>
          <div
            className={styles["upload-button-and-sentence-highlight-toggle"]}
          >
            <div>
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
            <label className={styles["sentence-highlight-toggle"]}>
              <input
                type="checkbox"
                checked={highlightSentence}
                onChange={(e) => setHighlightSentence(e.target.checked)}
              />
              Highlight Sentences
            </label>
          </div>

          {/* Text Input Area */}
          <div className={styles["textarea-wrapper"]}>
            <textarea
              value={text}
              onChange={handleTextInput}
              placeholder="Or paste your text here..."
            />
          </div>

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
            {/* <IconButton
              onClick={() => pauseReading()}
              disabled={!isSpeaking || isPaused}
            >
              <Pause color="white" size={16} />
              Pause
            </IconButton> */}
            {/* <button onClick={resumeReading} disabled={!isPaused}>
              Resume
            </button> */}
            {/* <IconButton onClick={() => resumeReading()} disabled={!isPaused}>
              <Play color="white" size={16} />
              Resume
            </IconButton> */}

            <IconButton
              onClick={isPaused ? resumeReading : pauseReading}
              disabled={!isSpeaking && !isPaused}
              style={{ width: "111px" }}
            >
              {isPaused ? (
                <Play color="white" size={16} />
              ) : (
                <Pause color="white" size={16} />
              )}
              {isPaused ? "Resume" : "Pause"}
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

export default PlayStream;

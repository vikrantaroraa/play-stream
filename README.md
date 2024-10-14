<!-- # React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
``` -->

![play-stream-logo](src/assets/images/play-stream-screenshot.png)

# Play Stream

**Play Stream** is an interactive, accessible text reader application designed to read aloud content from user input or uploaded text files. Utilizing browser-based speech synthesis, it offers a smooth auditory experience while visually highlighting the spoken text, providing an excellent tool for auditory learners, individuals with visual impairments, or users looking for a multitasking solution.

## Features

### 1. Upload or Enter Text

- Users can upload `.txt` files or manually input text into the provided text area.

### 2. Custom Voice Selection

- The app fetches available system voices, filtered by language (e.g., "en-US"). Users can choose from a variety of voices to customize their listening experience.

### 3. Adjustable Reading Speed

- Speech rate is adjustable via a slider, ranging from 0.5x to 2x, giving users control over the pace of the reading.

### 4. Real-Time Word and Sentence Highlighting

- As the app reads the text aloud, both the current word and the sentence being spoken are highlighted for easy tracking.

### 5. Pause, Resume, and Stop Controls

- Users can pause, resume, or stop speech synthesis at any point without losing their place in the text.

### 6. Text Syncing and Continuity

- The app keeps the current word and sentence in sync, even after changes to voice or speed settings, ensuring uninterrupted flow.

### 7. Efficient Text Splitting

- The text is intelligently split into words and sentences, ensuring accurate synchronization between spoken and highlighted content.

### 8. Browser Compatibility

- The app is designed to function smoothly across all modern browsers with support for the `speechSynthesis` API.

## Usage

1. Open the app.
2. Upload a `.txt` file or manually input text manually into the text area.
3. Select a preferred voice from the dropdown menu.
4. Adjust the reading speed using the slider (0.5x to 2x speed).
5. Press **Play** to start reading, **Pause** to pause, **Resume** to continue, or **Stop** to end the reading.
6. Follow along as the app highlights the currently spoken word and the entire sentence being read.
7. Adjust the voice or speed anytime during playback. The app will maintain sync with the current spoken word and sentence.

## Contributing

Contributions, bug reports, and feature requests are welcome! Please feel free to open an issue or submit a pull request on the repository.

import TextReaderWithSynchronizedVoice from "src/components/TextReader";
import "./App.css";
import { Camera } from "lucide-react";

function App() {
  return (
    <>
      <TextReaderWithSynchronizedVoice />
      {/* <button className="flex items-center gap-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <Camera color="white" size={22} />
        Camera Button
      </button> */}
    </>
  );
}

export default App;

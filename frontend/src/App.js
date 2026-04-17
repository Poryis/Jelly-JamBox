import { useState, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import HomePage from "./pages/HomePage";
import FreePlayPage from "./pages/FreePlayPage";
import RhythmGamePage from "./pages/RhythmGamePage";
import SimonSaysPage from "./pages/SimonSaysPage";
import EarTrainerPage from "./pages/EarTrainerPage";
import LoopStudioPage from "./pages/LoopStudioPage";

function App() {
  const [score, setScore] = useState(0);
  const [gameStats, setGameStats] = useState({
    perfect: 0, great: 0, good: 0, miss: 0, streak: 0, maxStreak: 0
  });

  const resetGame = useCallback(() => {
    setScore(0);
    setGameStats({ perfect: 0, great: 0, good: 0, miss: 0, streak: 0, maxStreak: 0 });
  }, []);

  return (
    <div className="App min-h-screen">
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/free-play" element={<FreePlayPage />} />
            <Route path="/rhythm-game" element={
              <RhythmGamePage score={score} setScore={setScore} gameStats={gameStats} setGameStats={setGameStats} resetGame={resetGame} />
            } />
            <Route path="/simon-says" element={
              <SimonSaysPage score={score} setScore={setScore} gameStats={gameStats} setGameStats={setGameStats} resetGame={resetGame} />
            } />
            <Route path="/ear-trainer" element={<EarTrainerPage />} />
            <Route path="/loop-studio" element={<LoopStudioPage />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </div>
  );
}

export default App;

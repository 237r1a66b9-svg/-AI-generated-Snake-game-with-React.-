import React, { useState, useEffect, useRef, useCallback } from 'react';

const TRACKS = [
  {
    id: 1,
    title: "ERR_01: CORRUPTED_SECTOR",
    artist: "SYS_ADMIN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "ERR_02: BUFFER_OVERFLOW",
    artist: "SYS_ADMIN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "ERR_03: KERNEL_PANIC",
    artist: "SYS_ADMIN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 75;

export default function App() {
  // --- Music Player State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Snake Game State ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // --- Music Player Logic ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("AUDIO_FAIL:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  
  const skipBack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTrackEnded = () => {
    skipForward();
  };

  // --- Snake Game Logic ---
  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
      if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setFood(generateFood());
    setGameStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      if (!gameStarted && !gameOver && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
         setGameStarted(true);
      }

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => {
            const newScore = s + 10;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
          });
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [direction, food, gameOver, generateFood, gameStarted, highScore]);

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between p-4 md:p-8 text-white selection:bg-magenta selection:text-black relative">
      <div className="static-noise"></div>
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onEnded={handleTrackEnded}
        preload="auto"
      />

      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-end py-4 px-6 md:py-6 md:px-8 border-b-4 border-cyan z-10 screen-tear bg-black">
        <div>
          <h1 className="text-4xl md:text-6xl glitch-text" data-text="SYS.SNAKE_EXEC">
            SYS.SNAKE_EXEC
          </h1>
          <p className="text-magenta text-sm md:text-base mt-2 tracking-widest">AUDIO_VISUAL_INTERFACE_v1.0</p>
        </div>
        <div className="flex gap-8 text-right">
          <div className="flex flex-col items-end">
            <span className="text-xs text-cyan tracking-widest">DATA_COLLECTED</span>
            <span className="text-4xl md:text-6xl text-white glitch-text" data-text={score}>{score}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-magenta tracking-widest">MAX_DATA_YIELD</span>
            <span className="text-4xl md:text-6xl text-white glitch-text" data-text={highScore}>{highScore}</span>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex items-center justify-center w-full max-w-4xl relative py-8 z-10 screen-tear">
        <div className="relative p-1 bg-black border-2 border-magenta shadow-[0_0_20px_rgba(255,0,255,0.3)]">
          <div 
            className="grid bg-black overflow-hidden"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              width: 'min(85vw, 500px)',
              height: 'min(85vw, 500px)'
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              
              const snakeIndex = snake.findIndex(segment => segment.x === x && segment.y === y);
              const isSnakeHead = snakeIndex === 0;
              const isSnakeBody = snakeIndex > 0;
              const isFood = food.x === x && food.y === y;

              let cellStyle = {};
              let cellClass = "w-full h-full border-[1px] border-cyan/20 ";

              if (isSnakeHead) {
                cellClass += "bg-cyan shadow-[0_0_15px_rgba(0,255,255,1)] z-10";
              } else if (isSnakeBody) {
                const intensity = Math.max(0.2, 1 - (snakeIndex / snake.length));
                cellClass += "z-0";
                cellStyle = {
                  backgroundColor: `rgba(0, 255, 255, ${intensity})`,
                  boxShadow: `0 0 ${15 * intensity}px rgba(0, 255, 255, ${intensity})`
                };
              } else if (isFood) {
                cellClass += "bg-magenta shadow-[0_0_20px_rgba(255,0,255,1)] animate-pulse";
              }

              return <div key={i} className={cellClass} style={cellStyle} />;
            })}
          </div>

          {/* Overlays */}
          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 border-4 border-cyan">
              <h2 className="text-5xl md:text-7xl text-white mb-4 glitch-text" data-text="AWAITING_INPUT...">AWAITING_INPUT...</h2>
              <p className="text-magenta text-2xl animate-pulse tracking-widest">INITIATE_SEQUENCE: [ARROW_KEYS]</p>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 border-4 border-magenta">
              <h2 className="text-6xl md:text-8xl text-magenta mb-2 glitch-text" data-text="CRITICAL_FAILURE">CRITICAL_FAILURE</h2>
              <p className="text-white mb-8 text-2xl tracking-widest">DATA_LOST: <span className="text-cyan">{score}</span></p>
              <button 
                onClick={resetGame}
                className="px-8 py-4 bg-black border-2 border-cyan text-cyan text-3xl hover:bg-cyan hover:text-black transition-none tracking-widest"
              >
                [ REBOOT_SEQUENCE ]
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Music Player Footer */}
      <footer className="w-full max-w-4xl bg-black border-t-4 border-magenta p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 z-10 screen-tear">
        
        {/* Track Info */}
        <div className="flex items-center gap-4 w-full md:w-1/3">
          <div className="overflow-hidden">
            <h3 className="text-cyan text-xl md:text-2xl glitch-text" data-text={currentTrack.title}>{currentTrack.title}</h3>
            <p className="text-magenta text-base tracking-widest mt-1">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8 w-full md:w-1/3 justify-center text-3xl">
          <button onClick={skipBack} className="text-white hover:text-cyan hover:bg-white/10 px-2 transition-none">[&lt;&lt;]</button>
          <button onClick={togglePlay} className="text-magenta hover:text-black hover:bg-magenta px-4 py-1 border-2 border-magenta transition-none">
            {isPlaying ? '[ || ]' : '[ > ]'}
          </button>
          <button onClick={skipForward} className="text-white hover:text-cyan hover:bg-white/10 px-2 transition-none">[&gt;&gt;]</button>
        </div>

        {/* Volume / Extras */}
        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-1/3 text-2xl">
           <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-magenta transition-none">
            {isMuted ? '[ MUTED ]' : '[ VOL_ON ]'}
          </button>
          {/* Simple visualizer bars */}
          <div className="flex items-end gap-2 h-10 border-b-2 border-white/20 pb-1 px-2">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div 
                key={bar}
                className={`w-4 ${isPlaying ? 'visualizer-bar' : 'bg-cyan/30'}`}
                style={{ 
                  height: '100%', 
                  transform: isPlaying ? 'none' : 'scaleY(0.1)', 
                  transformOrigin: 'bottom'
                }}
              />
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

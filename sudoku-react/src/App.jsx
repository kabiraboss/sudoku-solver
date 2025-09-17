import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [board, setBoard] = useState(
    Array.from({ length: 9 }, () => Array(9).fill(0))
  );
  const [originalBoard, setOriginalBoard] = useState(
    Array.from({ length: 9 }, () => Array(9).fill(0))
  );
  const [solvedBoard, setSolvedBoard] = useState(
    Array.from({ length: 9 }, () => Array(9).fill(0))
  );
  const [difficulty, setDifficulty] = useState("easy");
  const [time, setTime] = useState(0);
  const [timerOn, setTimerOn] = useState(false);

  // Timer
  useEffect(() => {
    let interval = null;
    if (timerOn) {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerOn]);

  // Shuffle array helper
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

  // Generate solved board
  const generateSolvedBoard = () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

    const isSafe = (g, r, c, num) => {
      for (let x = 0; x < 9; x++)
        if (g[r][x] === num || g[x][c] === num) return false;

      const startRow = r - (r % 3);
      const startCol = c - (c % 3);
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
          if (g[startRow + i][startCol + j] === num) return false;

      return true;
    };

    const solve = (g, r = 0, c = 0) => {
      if (r === 9) return true;
      if (c === 9) return solve(g, r + 1, 0);
      if (g[r][c] !== 0) return solve(g, r, c + 1);

      const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      for (let num of numbers) {
        if (isSafe(g, r, c, num)) {
          g[r][c] = num;
          if (solve(g, r, c + 1)) return true;
          g[r][c] = 0;
        }
      }
      return false;
    };

    solve(grid);
    return grid;
  };

  // Generate puzzle from solved board
  const generatePuzzleFromSolved = (fullBoard, level) => {
    const grid = fullBoard.map((row) => [...row]);
    let cellsToRemove = level === "easy" ? 35 : level === "medium" ? 45 : 55;
    let count = 0;

    while (count < cellsToRemove) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);
      if (grid[r][c] !== 0) {
        grid[r][c] = 0;
        count++;
      }
    }
    return grid;
  };

  // Get new puzzle
  const getPuzzle = () => {
    const fullSolved = generateSolvedBoard();
    const puzzle = generatePuzzleFromSolved(fullSolved, difficulty);
    setBoard(puzzle);
    setOriginalBoard(puzzle.map((row) => [...row]));
    setSolvedBoard(fullSolved);
    setTime(0);
    setTimerOn(true);
  };

  // Solve puzzle
  const solvePuzzle = () => {
    setBoard(solvedBoard.map((row) => [...row]));
    setTimerOn(false);
  };

  // Give hint
  const giveHint = () => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const newBoard = board.map((row) => [...row]);
          newBoard[r][c] = solvedBoard[r][c];
          setBoard(newBoard);
          return;
        }
      }
    }
  };

  return (
    <div className="App">
      <h1>Sudoku Solver</h1>

      <div className="controls">
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={getPuzzle}>Get Puzzle</button>
        <button onClick={solvePuzzle}>Solve Puzzle</button>
        <button onClick={giveHint}>Hint</button>
      </div>

      <div className="timer">Time: {time}s</div>

      <div className="board">
        {board.map((row, i) => (
          <div key={i} className="row">
            {row.map((cell, j) =>
              originalBoard[i][j] !== 0 ? (
                <div key={j} className="cell fixed">
                  {cell}
                </div>
              ) : (
                <input
                  key={j}
                  className={`cell input-cell ${
                    cell !== 0 && cell !== solvedBoard[i][j] ? "wrong" : ""
                  }`}
                  type="text"
                  maxLength="1"
                  value={cell === 0 ? "" : cell}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[1-9]?$/.test(val)) {
                      const newBoard = board.map((r) => [...r]);
                      newBoard[i][j] = val === "" ? 0 : parseInt(val);
                      setBoard(newBoard);
                    }
                  }}
                />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

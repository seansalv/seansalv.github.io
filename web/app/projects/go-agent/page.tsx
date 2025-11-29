"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Github,
  RotateCcw,
  PauseCircle,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

const SIZE = 5;
const HUMAN = 1;
const BOT = 2;

type Position = { row: number; col: number };
type Board = number[][];
type Move = Position | null;

const COLUMN_LABELS = ["A", "B", "C", "D", "E"];
const ROW_LABELS = ["5", "4", "3", "2", "1"];

const API_URL = process.env.NEXT_PUBLIC_GO_AGENT_API_URL ?? "";

const emptyBoard = (): Board => Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0));

const cloneBoard = (board: Board): Board => board.map((row) => [...row]);

const boardsEqual = (a: Board | null, b: Board | null) => {
  if (!a || !b) return false;
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
};

const neighbors = (row: number, col: number): Position[] => {
  const spots: Position[] = [];
  if (row > 0) spots.push({ row: row - 1, col });
  if (row < SIZE - 1) spots.push({ row: row + 1, col });
  if (col > 0) spots.push({ row, col: col - 1 });
  if (col < SIZE - 1) spots.push({ row, col: col + 1 });
  return spots;
};

const collectGroup = (board: Board, row: number, col: number) => {
  const color = board[row][col];
  const stack: Position[] = [{ row, col }];
  const seen = new Set<string>();
  seen.add(`${row}:${col}`);
  const group: Position[] = [];

  while (stack.length) {
    const current = stack.pop()!;
    group.push(current);
    for (const spot of neighbors(current.row, current.col)) {
      if (
        board[spot.row][spot.col] === color &&
        !seen.has(`${spot.row}:${spot.col}`)
      ) {
        seen.add(`${spot.row}:${spot.col}`);
        stack.push(spot);
      }
    }
  }
  return group;
};

const groupLiberties = (board: Board, group: Position[]) => {
  const libs = new Set<string>();
  for (const stone of group) {
    for (const spot of neighbors(stone.row, stone.col)) {
      if (board[spot.row][spot.col] === 0) libs.add(`${spot.row}:${spot.col}`);
    }
  }
  return libs;
};

const removeGroup = (board: Board, group: Position[]) => {
  for (const stone of group) {
    board[stone.row][stone.col] = 0;
  }
};

const simulateMove = (
  prevBoard: Board | null,
  curBoard: Board,
  move: Move,
  color: number
): { board: Board; valid: boolean } => {
  if (move === null) {
    return { board: cloneBoard(curBoard), valid: true };
  }

  const { row, col } = move;
  if (curBoard[row][col] !== 0) return { board: curBoard, valid: false };

  const newBoard = cloneBoard(curBoard);
  newBoard[row][col] = color;

  const opponent = 3 - color;
  let capturedAny = false;

  for (const spot of neighbors(row, col)) {
    if (newBoard[spot.row][spot.col] !== opponent) continue;
    const group = collectGroup(newBoard, spot.row, spot.col);
    const liberties = groupLiberties(newBoard, group);
    if (liberties.size === 0) {
      removeGroup(newBoard, group);
      capturedAny = true;
    }
  }

  const myGroup = collectGroup(newBoard, row, col);
  if (groupLiberties(newBoard, myGroup).size === 0 && !capturedAny) {
    return { board: curBoard, valid: false };
  }

  if (prevBoard && boardsEqual(prevBoard, newBoard)) {
    return { board: curBoard, valid: false };
  }

  return { board: newBoard, valid: true };
};

type MovePayload = {
  player: number;
  previousBoard: Board | null;
  currentBoard: Board;
};

export default function GoAgentPage() {
  const [prevBoard, setPrevBoard] = useState<Board | null>(null);
  const [board, setBoard] = useState<Board>(() => emptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<number>(HUMAN);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("You are Black. Click to play.");
  const [moveLog, setMoveLog] = useState<string[]>([]);
  const [lastRequest, setLastRequest] = useState<MovePayload | null>(null);
  const [lastMove, setLastMove] = useState<Move>(null);

  const apiReady = useMemo(() => Boolean(API_URL), []);

  useEffect(() => {
    if (!apiReady) {
      setError("NEXT_PUBLIC_GO_AGENT_API_URL is not set.");
    }
  }, [apiReady]);

  const appendLog = (entry: string) =>
    setMoveLog((prev) => [`${new Date().toLocaleTimeString()} — ${entry}`, ...prev].slice(0, 12));

  const handlePlayerMove = (row: number, col: number) => {
    if (currentPlayer !== HUMAN || isLoading || error) return;

    const result = simulateMove(prevBoard, board, { row, col }, HUMAN);
    if (!result.valid) {
      setStatus("Illegal move. Try another intersection.");
      return;
    }

    setPrevBoard(board);
    setBoard(result.board);
    setLastMove({ row, col });
    appendLog(`You played ${COLUMN_LABELS[col]}${ROW_LABELS[SIZE - 1 - row]}`);
    setStatus("Waiting for Agent...");
    setCurrentPlayer(BOT);

    const payload: MovePayload = {
      player: BOT,
      previousBoard: board,
      currentBoard: result.board,
    };
    setLastRequest(payload);
    requestEngineMove(payload);
  };

  const requestEngineMove = async (payload: MovePayload) => {
    if (!apiReady) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      const data: { move: Move } = await response.json();
      if (data.move === null) {
        appendLog("Agent passed.");
        setStatus("Agent passed. Your move.");
      } else {
        const applied = simulateMove(payload.currentBoard, payload.currentBoard, data.move, BOT);
        if (!applied.valid) {
          appendLog("Agent move invalid (rare).");
          setError("Agent move invalid. Reset recommended.");
        } else {
          setPrevBoard(payload.currentBoard);
          setBoard(applied.board);
          setLastMove(data.move);
          appendLog(
            `Agent played ${COLUMN_LABELS[data.move.col]}${ROW_LABELS[SIZE - 1 - data.move.row]}`
          );
          setStatus("Your turn.");
        }
      }
      setCurrentPlayer(HUMAN);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStatus("Agent request failed. Retry?");
      appendLog(`Agent call failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForcePass = () => {
    if (isLoading) return;
    appendLog("You passed.");
    setStatus("Agent responding...");
    setCurrentPlayer(BOT);
    const payload: MovePayload = {
      player: BOT,
      previousBoard: board,
      currentBoard: board,
    };
    setLastRequest(payload);
    requestEngineMove(payload);
  };

  const handleRetry = () => {
    if (!lastRequest || isLoading) return;
    setStatus("Retrying agent call...");
    requestEngineMove(lastRequest);
  };

  const handleRestart = () => {
    setPrevBoard(null);
    setBoard(emptyBoard());
    setCurrentPlayer(HUMAN);
    setMoveLog([]);
    setError(null);
    setStatus("New game. You are Black.");
    setLastRequest(null);
    setLastMove(null);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-sky-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to portfolio
          </Link>
        </div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Live Demo
            </p>
            <h1 className="text-3xl font-semibold text-white">
              5×5 Go Alpha-Beta Agent
            </h1>
            <p className="text-slate-400">
              Interactive 5×5 searcher with transposition tables, killer moves, history heuristics, and aspiration windows.
            </p>
          </div>
          <Link
            href="https://github.com/seansalv/little_go-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-500"
          >
            <Github className="h-4 w-4" />
            Repository
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-2xl border border-slate-800 bg-[#0b1220]/80 p-6 shadow-2xl shadow-sky-900/10">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-widest text-slate-400">
                {currentPlayer === HUMAN ? "Your move" : "Agent thinking"}
              </span>
              <span className="text-sm text-slate-400">{status}</span>
              {isLoading && <span className="text-xs text-sky-400">Querying backend...</span>}
            </div>

            <div className="space-y-3">
              <div className="ml-10 flex justify-between text-xs uppercase tracking-widest text-slate-500">
                {COLUMN_LABELS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="flex">
                <div className="mr-3 flex flex-col justify-between text-xs uppercase tracking-widest text-slate-500">
                  {ROW_LABELS.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-1 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-3">
                  {board.map((row, rIdx) =>
                    row.map((value, cIdx) => {
                      const key = `${rIdx}-${cIdx}`;
                      const isLast =
                        lastMove && lastMove.row === rIdx && lastMove.col === cIdx;
                      const isHuman = value === HUMAN;
                      return (
                        <button
                          key={key}
                          onClick={() => handlePlayerMove(rIdx, cIdx)}
                          aria-label={`Cell ${COLUMN_LABELS[cIdx]}${ROW_LABELS[SIZE - 1 - rIdx]}`}
                          className={`h-12 w-12 rounded-full border border-slate-800 transition ${
                            value === 0
                              ? "bg-slate-900/70 hover:border-sky-500"
                              : isHuman
                              ? "bg-white text-slate-900 drop-shadow-[0_0_18px_rgba(255,255,255,0.6)]"
                              : "bg-gradient-to-b from-sky-400 to-sky-600 drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]"
                          } ${
                            isLast
                              ? isHuman
                                ? "ring-2 ring-white/80"
                                : "ring-2 ring-sky-300"
                              : ""
                          }`}
                          disabled={value !== 0 || currentPlayer !== HUMAN || isLoading}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
                <span className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow-lg" />
                You (Black)
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
                <span className="inline-block h-3.5 w-3.5 rounded-full bg-gradient-to-b from-sky-400 to-sky-600 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                Agent (White)
              </div>
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-500"
              >
                <RotateCcw className="h-4 w-4" />
                Restart game
              </button>
              <button
                onClick={handleForcePass}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <PauseCircle className="h-4 w-4" />
                Force pass
              </button>
              <button
                onClick={handleRetry}
                disabled={!lastRequest || isLoading}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RefreshCw className="h-4 w-4" />
                Retry last call
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1220]/80 p-6">
            <h2 className="text-sm uppercase tracking-[0.3em] text-slate-500">Move log</h2>
            <p className="text-xs text-slate-500">Newest first</p>
            <div className="mt-4 space-y-3">
              {moveLog.length === 0 ? (
                <p className="text-sm text-slate-400">No moves yet.</p>
              ) : (
                moveLog.map((entry, idx) => (
                  <div
                    key={`${entry}-${idx}`}
                    className="rounded-xl border border-slate-800/70 bg-slate-900/30 px-3 py-2 text-sm text-slate-300"
                  >
                    {entry}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


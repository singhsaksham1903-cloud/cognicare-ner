import { useEffect, useRef, useState } from 'react'
import './MemoryMatch.css'
import { savePerformanceResult } from '../utils/performanceStorage'

const CARD_VALUES = ['🍎', '🧠', '🌸', '⭐']
const HISTORY_KEY = 'cognicare-memory-match-history'

function shuffleCards() {
  const cards = [...CARD_VALUES, ...CARD_VALUES]

  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }

  return cards.map((value, index) => ({
    id: index,
    value,
  }))
}

function MemoryMatch({ onBack }) {
  const [cards, setCards] = useState(shuffleCards)
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [busy, setBusy] = useState(false)

  // Performance tracking
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [timerStarted, setTimerStarted] = useState(false)

  // Local history
  const [history, setHistory] = useState([])

  // Prevent the same completed game from being saved twice
  const hasSavedResult = useRef(false)

  // Load previous history when the game opens
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_KEY)

    if (!savedHistory) {
      return
    }

    try {
      const parsedHistory = JSON.parse(savedHistory)

      if (Array.isArray(parsedHistory)) {
        setHistory(parsedHistory)
      }
    } catch {
      localStorage.removeItem(HISTORY_KEY)
    }
  }, [])

  // Start and stop timer
  useEffect(() => {
    if (!timerStarted || matched.length === cards.length) {
      return undefined
    }

    const timer = setInterval(() => {
      setTimeElapsed((currentTime) => currentTime + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timerStarted, matched.length, cards.length])

  const matchedPairs = matched.length / 2

  const mistakes = Math.max(moves - matchedPairs, 0)

  const accuracy =
    moves === 0
      ? 0
      : Math.round((matchedPairs / moves) * 100)

  const gameCompleted = matched.length === cards.length

  // Save completed game to local history
  useEffect(() => {
    if (!gameCompleted || hasSavedResult.current) {
      return
    }

    const result = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      moves,
      matches: matchedPairs,
      mistakes,
      time: timeElapsed,
      accuracy,
    }

    savePerformanceResult({
      game: 'Memory Match',
      difficulty: 'Standard',
      moves,
      matches: matchedPairs,
      mistakes,
      time: timeElapsed,
      accuracy,
      completed: true,
    })

    const updatedHistory = [result, ...history].slice(0, 10)

    setHistory(updatedHistory)

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(updatedHistory),
    )

    hasSavedResult.current = true
  }, [
    gameCompleted,
    moves,
    matchedPairs,
    mistakes,
    timeElapsed,
    accuracy,
    history,
  ])

  const handleCardClick = (index) => {
    if (
      busy ||
      flipped.includes(index) ||
      matched.includes(index) ||
      flipped.length === 2
    ) {
      return
    }

    if (!timerStarted) {
      setTimerStarted(true)
    }

    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves((currentMoves) => currentMoves + 1)

      const firstIndex = newFlipped[0]
      const secondIndex = newFlipped[1]

      if (cards[firstIndex].value === cards[secondIndex].value) {
        setMatched((currentMatched) => [
          ...currentMatched,
          firstIndex,
          secondIndex,
        ])

        setFlipped([])
      } else {
        setBusy(true)

        setTimeout(() => {
          setFlipped([])
          setBusy(false)
        }, 1000)
      }
    }
  }

  const handleRestart = () => {
    setCards(shuffleCards())
    setFlipped([])
    setMatched([])
    setMoves(0)
    setBusy(false)
    setTimeElapsed(0)
    setTimerStarted(false)
    hasSavedResult.current = false
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`
  }

  return (
    <div className="memory-match-page">
      <header className="memory-match-header">
        <button
          type="button"
          className="memory-back-button"
          onClick={onBack}
        >
          ← Back to Games
        </button>

        <h1>🧠 Memory Match</h1>

        <p>
          Find all the matching pairs. Take your time and enjoy the game.
        </p>
      </header>

      {/* Current Game Statistics */}
      <section
        className="memory-stats"
        aria-label="Game statistics"
      >
        <div className="memory-stat">
          <strong>{moves}</strong>
          <span>Moves</span>
        </div>

        <div className="memory-stat">
          <strong>{matchedPairs}</strong>
          <span>Matches</span>
        </div>

        <div className="memory-stat">
          <strong>{mistakes}</strong>
          <span>Mistakes</span>
        </div>

        <div className="memory-stat">
          <strong>{formatTime(timeElapsed)}</strong>
          <span>Time</span>
        </div>

        <div className="memory-stat">
          <strong>{accuracy}%</strong>
          <span>Accuracy</span>
        </div>
      </section>

      {/* Game Board */}
      <main
        className="memory-board"
        aria-label="Memory match game board"
      >
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index)
          const isMatched = matched.includes(index)

          return (
            <button
              key={card.id}
              type="button"
              className={`memory-card ${isFlipped || isMatched
                  ? 'memory-card--visible'
                  : ''
                } ${isMatched
                  ? 'memory-card--matched'
                  : ''
                }`}
              onClick={() => handleCardClick(index)}
              aria-label={
                isFlipped || isMatched
                  ? `Card showing ${card.value}`
                  : 'Hidden memory card'
              }
            >
              <span>
                {isFlipped || isMatched ? card.value : '?'}
              </span>
            </button>
          )
        })}
      </main>

      {/* Completion Summary */}
      {gameCompleted && (
        <section className="memory-complete">
          <h2>🎉 Well Done!</h2>

          <p>
            You found all the pairs in {moves} moves.
          </p>

          <div className="completion-summary">
            <p>
              <strong>Time:</strong> {formatTime(timeElapsed)}
            </p>

            <p>
              <strong>Accuracy:</strong> {accuracy}%
            </p>

            <p>
              <strong>Mistakes:</strong> {mistakes}
            </p>
          </div>

          <button
            type="button"
            className="memory-restart-button"
            onClick={handleRestart}
          >
            Play Again
          </button>
        </section>
      )}

      {!gameCompleted && (
        <button
          type="button"
          className="memory-restart-button"
          onClick={handleRestart}
        >
          Restart Game
        </button>
      )}

      {/* Previous Game History */}
      {history.length > 0 && (
        <section className="memory-history">
          <div className="memory-history-header">
            <div>
              <h2>📊 Previous Sessions</h2>
              <p>Your recent Memory Match results.</p>
            </div>

            <button
              type="button"
              className="memory-clear-button"
              onClick={handleClearHistory}
            >
              Clear History
            </button>
          </div>

          <div className="memory-history-list">
            {history.map((result) => (
              <article
                className="memory-history-item"
                key={result.id}
              >
                <div>
                  <strong>{result.date}</strong>
                </div>

                <div>
                  <span>Moves: {result.moves}</span>
                  <span>Accuracy: {result.accuracy}%</span>
                  <span>Time: {formatTime(result.time)}</span>
                  <span>Mistakes: {result.mistakes}</span>
                </div>
              </article>
            ))}
          </div>

          <p className="memory-local-note">
            History is currently saved only on this device.
          </p>
        </section>
      )}
    </div>
  )
}

export default MemoryMatch
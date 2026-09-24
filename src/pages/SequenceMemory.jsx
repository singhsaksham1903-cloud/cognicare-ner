import { useEffect, useRef, useState } from 'react'
import './SequenceMemory.css'
import { savePerformanceResult } from '../utils/performanceStorage'

const SYMBOLS = ['🍎', '🧠', '🌸', '⭐', '🍀']

const LEVELS = {
  Easy: 3,
  Medium: 4,
  Hard: 5,
}

const HISTORY_KEY = 'cognicare-sequence-memory-history'

function shuffleItems(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

function getValidDifficulty(value) {
  return LEVELS[value] ? value : 'Easy'
}

function SequenceMemory({
  onBack,
  initialDifficulty = 'Easy',
}) {
  const [difficulty, setDifficulty] = useState(
    getValidDifficulty(initialDifficulty),
  )

  const [sequence, setSequence] = useState([])
  const [options, setOptions] = useState([])
  const [userSequence, setUserSequence] = useState([])

  const [phase, setPhase] = useState('idle')

  const [message, setMessage] = useState(
    'Choose a difficulty to begin.',
  )

  const [mistakes, setMistakes] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [timerStarted, setTimerStarted] = useState(false)

  const [history, setHistory] = useState([])

  const hasSavedResult = useRef(false)

  // Always guarantee a valid sequence length.
  const sequenceLength = LEVELS[difficulty] || LEVELS.Easy

  // Load previous sessions
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

  // Timer
  useEffect(() => {
    if (!timerStarted || phase !== 'answering') {
      return undefined
    }

    const timer = setInterval(() => {
      setTimeElapsed((currentTime) => currentTime + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timerStarted, phase])

  const formatTime = (seconds) => {
    const safeSeconds = Number.isFinite(Number(seconds))
      ? Number(seconds)
      : 0

    const minutes = Math.floor(safeSeconds / 60)
    const remainingSeconds = safeSeconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`
  }

  const startGame = () => {
    const newSequence = shuffleItems(SYMBOLS).slice(
      0,
      sequenceLength,
    )

    const shuffledOptions = shuffleItems(newSequence)

    setSequence(newSequence)
    setOptions(shuffledOptions)
    setUserSequence([])
    setMistakes(0)
    setTimeElapsed(0)
    setTimerStarted(false)
    setPhase('showing')
    setMessage('Remember this sequence...')

    hasSavedResult.current = false

    setTimeout(() => {
      setPhase('answering')
      setTimerStarted(true)
      setMessage(
        'Now select the objects in the same order.',
      )
    }, 2500)
  }

  const handleOptionClick = (symbol) => {
    if (phase !== 'answering') {
      return
    }

    const nextIndex = userSequence.length
    const correctSymbol = sequence[nextIndex]

    if (symbol !== correctSymbol) {
      setMistakes((currentMistakes) => currentMistakes + 1)

      setMessage(
        'Not quite. Take your time and try the next one.',
      )

      return
    }

    const updatedSequence = [...userSequence, symbol]

    setUserSequence(updatedSequence)

    if (updatedSequence.length === sequence.length) {
      setPhase('complete')
      setTimerStarted(false)
      setMessage(
        '🎉 Excellent! You remembered the sequence.',
      )
    }
  }

  /*
   * Accuracy:
   * Correct selections = sequenceLength
   * Total attempts = correct selections + mistakes
   *
   * Example:
   * 3 items, 0 mistakes = 100%
   * 3 items, 1 mistake  = 75%
   * 3 items, 2 mistakes = 60%
   */
  const totalAttempts = sequenceLength + mistakes

  const accuracy =
    Number.isFinite(totalAttempts) && totalAttempts > 0
      ? Math.round(
          (sequenceLength / totalAttempts) * 100,
        )
      : 0

  const safeAccuracy = Number.isFinite(accuracy)
    ? accuracy
    : 0

  const gameCompleted = phase === 'complete'

  // Save completed game
  useEffect(() => {
    if (!gameCompleted || hasSavedResult.current) {
      return
    }

    const result = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      difficulty,
      sequenceLength,
      mistakes,
      time: timeElapsed,
      accuracy: safeAccuracy,
    }

    savePerformanceResult({
      game: 'Sequence Memory',
      difficulty,
      sequenceLength,
      mistakes,
      time: timeElapsed,
      accuracy: safeAccuracy,
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
    difficulty,
    sequenceLength,
    mistakes,
    timeElapsed,
    safeAccuracy,
    history,
  ])

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  return (
    <div className="sequence-memory-page">
      <header className="sequence-header">
        <button
          type="button"
          className="sequence-back-button"
          onClick={onBack}
        >
          ← Back to Games
        </button>

        <h1>🔢 Sequence Memory</h1>

        <p>
          Remember the order of the objects and select them
          in the same order.
        </p>
      </header>

      {/* Difficulty */}
      <section className="sequence-controls">
        <h2>Select Difficulty</h2>

        <div className="difficulty-buttons">
          {Object.keys(LEVELS).map((level) => (
            <button
              key={level}
              type="button"
              className={`difficulty-button ${
                difficulty === level
                  ? 'difficulty-button--active'
                  : ''
              }`}
              onClick={() => setDifficulty(level)}
              disabled={
                phase === 'showing' ||
                phase === 'answering'
              }
            >
              {level}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="start-sequence-button"
          onClick={startGame}
          disabled={
            phase === 'showing' ||
            phase === 'answering'
          }
        >
          {phase === 'complete'
            ? 'Play Again'
            : 'Start Game'}
        </button>
      </section>

      {/* Current statistics */}
      <section className="sequence-stats">
        <div className="sequence-stat">
          <strong>{sequenceLength}</strong>
          <span>Items</span>
        </div>

        <div className="sequence-stat">
          <strong>{mistakes}</strong>
          <span>Mistakes</span>
        </div>

        <div className="sequence-stat">
          <strong>{formatTime(timeElapsed)}</strong>
          <span>Time</span>
        </div>

        <div className="sequence-stat">
          <strong>{safeAccuracy}%</strong>
          <span>Accuracy</span>
        </div>
      </section>

      <p className="sequence-message">{message}</p>

      {/* Sequence to remember */}
      {phase === 'showing' && (
        <section
          className="sequence-display"
          aria-label="Sequence to remember"
        >
          {sequence.map((symbol, index) => (
            <div
              className="sequence-symbol sequence-symbol--large"
              key={`${symbol}-${index}`}
            >
              {symbol}
            </div>
          ))}
        </section>
      )}

      {/* Answer buttons */}
      {phase === 'answering' && (
        <section
          className="sequence-options"
          aria-label="Sequence choices"
        >
          {options.map((symbol) => {
            const alreadySelected =
              userSequence.includes(symbol)

            return (
              <button
                key={symbol}
                type="button"
                className={`sequence-symbol ${
                  alreadySelected
                    ? 'sequence-symbol--selected'
                    : ''
                }`}
                onClick={() =>
                  handleOptionClick(symbol)
                }
                disabled={alreadySelected}
              >
                {symbol}
              </button>
            )
          })}
        </section>
      )}

      {/* Completion */}
      {gameCompleted && (
        <section className="sequence-complete">
          <h2>🎉 Well Done!</h2>

          <p>
            You remembered the complete sequence.
          </p>

          <p>
            <strong>Difficulty:</strong> {difficulty}
          </p>

          <p>
            <strong>Time:</strong>{' '}
            {formatTime(timeElapsed)}
          </p>

          <p>
            <strong>Mistakes:</strong> {mistakes}
          </p>

          <p>
            <strong>Accuracy:</strong> {safeAccuracy}%
          </p>
        </section>
      )}

      {/* History */}
      {history.length > 0 && (
        <section className="sequence-history">
          <div className="sequence-history-header">
            <div>
              <h2>📊 Previous Sessions</h2>

              <p>
                Your recent Sequence Memory results.
              </p>
            </div>

            <button
              type="button"
              className="sequence-clear-button"
              onClick={handleClearHistory}
            >
              Clear History
            </button>
          </div>

          <div className="sequence-history-list">
            {history.map((result) => (
              <article
                className="sequence-history-item"
                key={result.id}
              >
                <strong>{result.date}</strong>

                <div>
                  <span>
                    Difficulty: {result.difficulty}
                  </span>

                  <span>
                    Items: {result.sequenceLength}
                  </span>

                  <span>
                    Accuracy: {result.accuracy}%
                  </span>

                  <span>
                    Mistakes: {result.mistakes}
                  </span>

                  <span>
                    Time: {formatTime(result.time)}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <p className="sequence-local-note">
            History is currently saved only on this device.
          </p>
        </section>
      )}
    </div>
  )
}

export default SequenceMemory
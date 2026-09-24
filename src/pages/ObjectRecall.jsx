import { useEffect, useRef, useState } from 'react'
import './ObjectRecall.css'
import { savePerformanceResult } from '../utils/performanceStorage'

const OBJECTS = [
  '🍎',
  '☕',
  '📖',
  '🌸',
  '⭐',
  '🚗',
  '🎈',
  '🍀',
  '🐘',
  '⚽',
  '🎵',
  '🏠',
]

const LEVELS = {
  Easy: 4,
  Medium: 5,
  Hard: 6,
}

const HISTORY_KEY = 'cognicare-object-recall-history'

function shuffleItems(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

function ObjectRecall({
  onBack,
  initialDifficulty = 'Easy',
}) {
  const [difficulty, setDifficulty] = useState(initialDifficulty)
  const [targetObjects, setTargetObjects] = useState([])
  const [options, setOptions] = useState([])
  const [selectedObjects, setSelectedObjects] = useState([])

  const [phase, setPhase] = useState('idle')
  const [message, setMessage] = useState(
    'Choose a difficulty to begin.',
  )

  const [correctSelections, setCorrectSelections] = useState(0)
  const [wrongSelections, setWrongSelections] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [timerStarted, setTimerStarted] = useState(false)

  const [history, setHistory] = useState([])

  const hasSavedResult = useRef(false)

  const targetCount = LEVELS[difficulty]

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
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`
  }

  const startGame = () => {
    const shuffledObjects = shuffleItems(OBJECTS)

    const newTargets = shuffledObjects.slice(
      0,
      targetCount,
    )

    const distractors = shuffledObjects.slice(
      targetCount,
      targetCount + 3,
    )

    const newOptions = shuffleItems([
      ...newTargets,
      ...distractors,
    ])

    setTargetObjects(newTargets)
    setOptions(newOptions)
    setSelectedObjects([])
    setCorrectSelections(0)
    setWrongSelections(0)
    setTimeElapsed(0)
    setTimerStarted(false)
    setPhase('showing')
    setMessage('Remember these objects...')

    hasSavedResult.current = false

    setTimeout(() => {
      setPhase('answering')
      setTimerStarted(true)
      setMessage('Which objects did you see?')
    }, 3000)
  }

  const handleObjectClick = (object) => {
    if (
      phase !== 'answering' ||
      selectedObjects.includes(object)
    ) {
      return
    }

    const newSelectedObjects = [
      ...selectedObjects,
      object,
    ]

    setSelectedObjects(newSelectedObjects)

    if (targetObjects.includes(object)) {
      setCorrectSelections(
        (currentCorrect) => currentCorrect + 1,
      )

      setMessage('Good choice! Keep going.')

      // Complete when all target objects are found
      if (
        correctSelections + 1 === targetObjects.length
      ) {
        setPhase('complete')
        setTimerStarted(false)
        setMessage(
          '🎉 Excellent! You remembered all the objects.',
        )
      }
    } else {
      setWrongSelections(
        (currentWrong) => currentWrong + 1,
      )

      setMessage(
        'That was not one of the objects. Keep trying.',
      )
    }
  }

  const totalSelections =
    correctSelections + wrongSelections

  const accuracy =
    totalSelections === 0
      ? 0
      : Math.round(
        (correctSelections / totalSelections) * 100,
      )

  const gameCompleted = phase === 'complete'

  // Save completed session
  useEffect(() => {
    if (!gameCompleted || hasSavedResult.current) {
      return
    }

    const result = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      difficulty,
      targetCount,
      correct: correctSelections,
      wrong: wrongSelections,
      time: timeElapsed,
      accuracy,
    }

    savePerformanceResult({
      game: 'Object Recall',
      difficulty,
      targetCount,
      correct: correctSelections,
      wrong: wrongSelections,
      mistakes: wrongSelections,
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
    difficulty,
    targetCount,
    correctSelections,
    wrongSelections,
    timeElapsed,
    accuracy,
    history,
  ])

  const handleRestart = () => {
    setTargetObjects([])
    setOptions([])
    setSelectedObjects([])
    setCorrectSelections(0)
    setWrongSelections(0)
    setTimeElapsed(0)
    setTimerStarted(false)
    setPhase('idle')
    setMessage('Choose a difficulty to begin.')
    hasSavedResult.current = false
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  return (
    <div className="object-recall-page">
      <header className="object-recall-header">
        <button
          type="button"
          className="object-recall-back-button"
          onClick={onBack}
        >
          ← Back to Games
        </button>

        <h1>👀 Object Recall</h1>

        <p>
          Remember the objects you see, then select them from
          the choices.
        </p>
      </header>

      {/* Difficulty */}
      <section className="object-recall-controls">
        <h2>Select Difficulty</h2>

        <div className="object-difficulty-buttons">
          {Object.keys(LEVELS).map((level) => (
            <button
              key={level}
              type="button"
              className={`object-difficulty-button ${difficulty === level
                ? 'object-difficulty-button--active'
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
          className="object-start-button"
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

      {/* Statistics */}
      <section className="object-recall-stats">
        <div className="object-recall-stat">
          <strong>{targetCount}</strong>
          <span>Objects</span>
        </div>

        <div className="object-recall-stat">
          <strong>{correctSelections}</strong>
          <span>Correct</span>
        </div>

        <div className="object-recall-stat">
          <strong>{wrongSelections}</strong>
          <span>Wrong</span>
        </div>

        <div className="object-recall-stat">
          <strong>{formatTime(timeElapsed)}</strong>
          <span>Time</span>
        </div>

        <div className="object-recall-stat">
          <strong>{accuracy}%</strong>
          <span>Accuracy</span>
        </div>
      </section>

      <p className="object-recall-message">{message}</p>

      {/* Objects shown to remember */}
      {phase === 'showing' && (
        <section className="object-target-display">
          {targetObjects.map((object, index) => (
            <div
              className="object-target"
              key={`${object}-${index}`}
            >
              {object}
            </div>
          ))}
        </section>
      )}

      {/* Answer choices */}
      {phase === 'answering' && (
        <section className="object-options">
          {options.map((object) => {
            const selected =
              selectedObjects.includes(object)

            const correct =
              targetObjects.includes(object)

            return (
              <button
                key={object}
                type="button"
                className={`object-option ${selected
                  ? correct
                    ? 'object-option--correct'
                    : 'object-option--wrong'
                  : ''
                  }`}
                onClick={() =>
                  handleObjectClick(object)
                }
                disabled={selected}
              >
                {object}
              </button>
            )
          })}
        </section>
      )}

      {/* Completion */}
      {gameCompleted && (
        <section className="object-recall-complete">
          <h2>🎉 Well Done!</h2>

          <p>
            You remembered all {targetCount} objects.
          </p>

          <p>
            <strong>Difficulty:</strong> {difficulty}
          </p>

          <p>
            <strong>Correct:</strong> {correctSelections}
          </p>

          <p>
            <strong>Wrong:</strong> {wrongSelections}
          </p>

          <p>
            <strong>Time:</strong>{' '}
            {formatTime(timeElapsed)}
          </p>

          <p>
            <strong>Accuracy:</strong> {accuracy}%
          </p>

          <button
            type="button"
            className="object-start-button"
            onClick={handleRestart}
          >
            Play Again
          </button>
        </section>
      )}

      {/* Local History */}
      {history.length > 0 && (
        <section className="object-history">
          <div className="object-history-header">
            <div>
              <h2>📊 Previous Sessions</h2>
              <p>
                Your recent Object Recall results.
              </p>
            </div>

            <button
              type="button"
              className="object-clear-button"
              onClick={handleClearHistory}
            >
              Clear History
            </button>
          </div>

          <div className="object-history-list">
            {history.map((result) => (
              <article
                className="object-history-item"
                key={result.id}
              >
                <strong>{result.date}</strong>

                <div>
                  <span>
                    Difficulty: {result.difficulty}
                  </span>

                  <span>
                    Objects: {result.targetCount}
                  </span>

                  <span>
                    Correct: {result.correct}
                  </span>

                  <span>
                    Wrong: {result.wrong}
                  </span>

                  <span>
                    Accuracy: {result.accuracy}%
                  </span>

                  <span>
                    Time: {formatTime(result.time)}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <p className="object-local-note">
            History is currently saved only on this device.
          </p>
        </section>
      )}
    </div>
  )
}

export default ObjectRecall
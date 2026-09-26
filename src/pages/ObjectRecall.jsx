import { useEffect, useRef, useState } from 'react'

import './ObjectRecall.css'
import VoiceReadAloud from '../Components/VoiceReadAloud'

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


const HISTORY_KEY =
  'cognicare-object-recall-history'


function shuffleItems(items) {
  return [...items].sort(
    () => Math.random() - 0.5,
  )
}


function ObjectRecall({
  text,
  language = 'en-IN',
  readAloudLabel = 'Read Aloud',
  stopReadingLabel = 'Stop Reading',
  onBack,
  initialDifficulty = 'Easy',
}) {
  const [difficulty, setDifficulty] =
    useState(initialDifficulty)

  const [targetObjects, setTargetObjects] =
    useState([])

  const [options, setOptions] =
    useState([])

  const [selectedObjects, setSelectedObjects] =
    useState([])


  const [phase, setPhase] =
    useState('idle')

  const [message, setMessage] =
    useState(
      text.chooseDifficulty,
    )


  const [correctSelections, setCorrectSelections] =
    useState(0)

  const [wrongSelections, setWrongSelections] =
    useState(0)

  const [timeElapsed, setTimeElapsed] =
    useState(0)

  const [timerStarted, setTimerStarted] =
    useState(false)


  const [history, setHistory] =
    useState([])


  const hasSavedResult =
    useRef(false)


  const targetCount =
    LEVELS[difficulty]


  // ==========================================
  // Load previous sessions
  // ==========================================

  useEffect(() => {
    const savedHistory =
      localStorage.getItem(
        HISTORY_KEY,
      )

    if (!savedHistory) {
      return
    }

    try {
      const parsedHistory =
        JSON.parse(savedHistory)

      if (
        Array.isArray(
          parsedHistory,
        )
      ) {
        setHistory(
          parsedHistory,
        )
      }
    } catch {
      localStorage.removeItem(
        HISTORY_KEY,
      )
    }
  }, [])


  // ==========================================
  // Timer
  // ==========================================

  useEffect(() => {
    if (
      !timerStarted ||
      phase !== 'answering'
    ) {
      return undefined
    }

    const timer = setInterval(
      () => {
        setTimeElapsed(
          (currentTime) =>
            currentTime + 1,
        )
      },
      1000,
    )

    return () =>
      clearInterval(timer)
  }, [
    timerStarted,
    phase,
  ])


  // ==========================================
  // Format Time
  // ==========================================

  const formatTime = (
    seconds,
  ) => {
    const minutes =
      Math.floor(seconds / 60)

    const remainingSeconds =
      seconds % 60

    return `${String(
      minutes,
    ).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`
  }


  // ==========================================
  // Start Game
  // ==========================================

  const startGame = () => {
    const shuffledObjects =
      shuffleItems(
        OBJECTS,
      )

    const newTargets =
      shuffledObjects.slice(
        0,
        targetCount,
      )

    const distractors =
      shuffledObjects.slice(
        targetCount,
        targetCount + 3,
      )

    const newOptions =
      shuffleItems([
        ...newTargets,
        ...distractors,
      ])


    setTargetObjects(
      newTargets,
    )

    setOptions(
      newOptions,
    )

    setSelectedObjects([])

    setCorrectSelections(0)

    setWrongSelections(0)

    setTimeElapsed(0)

    setTimerStarted(false)

    setPhase('showing')

    setMessage(
      text.rememberObjects,
    )

    hasSavedResult.current = false


    setTimeout(() => {
      setPhase('answering')

      setTimerStarted(true)

      setMessage(
        text.whichObjects,
      )
    }, 3000)
  }


  // ==========================================
  // Handle Object Click
  // ==========================================

  const handleObjectClick = (
    object,
  ) => {
    if (
      phase !== 'answering' ||
      selectedObjects.includes(
        object,
      )
    ) {
      return
    }


    const newSelectedObjects = [
      ...selectedObjects,
      object,
    ]

    setSelectedObjects(
      newSelectedObjects,
    )


    if (
      targetObjects.includes(
        object,
      )
    ) {
      setCorrectSelections(
        (currentCorrect) =>
          currentCorrect + 1,
      )

      setMessage(
        text.goodChoice,
      )


      // Complete when all target
      // objects are found

      if (
        correctSelections + 1 ===
        targetObjects.length
      ) {
        setPhase('complete')

        setTimerStarted(false)

        setMessage(
          text.excellent,
        )
      }
    } else {
      setWrongSelections(
        (currentWrong) =>
          currentWrong + 1,
      )

      setMessage(
        text.wrongObject,
      )
    }
  }


  // ==========================================
  // Accuracy
  // ==========================================

  const totalSelections =
    correctSelections +
    wrongSelections


  const accuracy =
    totalSelections === 0
      ? 0
      : Math.round(
        (correctSelections /
          totalSelections) *
        100,
      )


  const gameCompleted =
    phase === 'complete'


  // ==========================================
  // Save completed session
  // ==========================================

  useEffect(() => {
    if (
      !gameCompleted ||
      hasSavedResult.current
    ) {
      return
    }


    const result = {
      id: Date.now(),
      date:
        new Date().toLocaleString(),
      difficulty,
      targetCount,
      correct:
        correctSelections,
      wrong:
        wrongSelections,
      time:
        timeElapsed,
      accuracy,
    }


    savePerformanceResult({
      game: 'Object Recall',
      difficulty,
      targetCount,
      correct:
        correctSelections,
      wrong:
        wrongSelections,
      mistakes:
        wrongSelections,
      time:
        timeElapsed,
      accuracy,
      completed: true,
    })


    const updatedHistory = [
      result,
      ...history,
    ].slice(0, 10)


    setHistory(
      updatedHistory,
    )


    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(
        updatedHistory,
      ),
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


  // ==========================================
  // Restart
  // ==========================================

  const handleRestart = () => {
    setTargetObjects([])

    setOptions([])

    setSelectedObjects([])

    setCorrectSelections(0)

    setWrongSelections(0)

    setTimeElapsed(0)

    setTimerStarted(false)

    setPhase('idle')

    setMessage(
      text.chooseDifficulty,
    )

    hasSavedResult.current = false
  }


  // ==========================================
  // Clear History
  // ==========================================

  const handleClearHistory = () => {
    setHistory([])

    localStorage.removeItem(
      HISTORY_KEY,
    )
  }


  return (
    <div className="object-recall-page">

      {/* ======================================
          Header
          ====================================== */}

      <header className="object-recall-header">

        <button
          type="button"
          className="object-recall-back-button"
          onClick={onBack}
        >
          ← {text.backToGames}
        </button>


        <h1>
          👀 {text.title}
        </h1>


        <p>
          {text.description}
        </p>
        <VoiceReadAloud
          text={`${text.title}. ${text.description}`}
          language={language}
          label={readAloudLabel}
          stopLabel={stopReadingLabel}
        />

      </header>


      {/* ======================================
          Difficulty
          ====================================== */}

      <section className="object-recall-controls">

        <h2>
          {text.selectDifficulty}
        </h2>


        <div className="object-difficulty-buttons">

          {Object.keys(LEVELS).map(
            (level) => (
              <button
                key={level}
                type="button"
                className={`object-difficulty-button ${difficulty === level
                  ? 'object-difficulty-button--active'
                  : ''
                  }`}
                onClick={() =>
                  setDifficulty(level)
                }
                disabled={
                  phase === 'showing' ||
                  phase === 'answering'
                }
              >
                {
                  text.difficulties[
                  level
                  ]
                }
              </button>
            ),
          )}

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
            ? text.playAgain
            : text.startGame}
        </button>

      </section>


      {/* ======================================
          Statistics
          ====================================== */}

      <section className="object-recall-stats">

        <div className="object-recall-stat">

          <strong>
            {targetCount}
          </strong>

          <span>
            {text.objects}
          </span>

        </div>


        <div className="object-recall-stat">

          <strong>
            {correctSelections}
          </strong>

          <span>
            {text.correct}
          </span>

        </div>


        <div className="object-recall-stat">

          <strong>
            {wrongSelections}
          </strong>

          <span>
            {text.wrong}
          </span>

        </div>


        <div className="object-recall-stat">

          <strong>
            {formatTime(
              timeElapsed,
            )}
          </strong>

          <span>
            {text.time}
          </span>

        </div>


        <div className="object-recall-stat">

          <strong>
            {accuracy}%
          </strong>

          <span>
            {text.accuracy}
          </span>

        </div>

      </section>


      {/* ======================================
          Current Message
          ====================================== */}

      <p className="object-recall-message">
        {message}
      </p>


      {/* ======================================
          Objects to Remember
          ====================================== */}

      {phase === 'showing' && (
        <section
          className="object-target-display"
          aria-label={
            text.objectsToRemember
          }
        >

          {targetObjects.map(
            (object, index) => (
              <div
                className="object-target"
                key={`${object}-${index}`}
              >
                {object}
              </div>
            ),
          )}

        </section>
      )}


      {/* ======================================
          Answer Choices
          ====================================== */}

      {phase === 'answering' && (
        <section className="object-options">

          {options.map(
            (object) => {

              const selected =
                selectedObjects.includes(
                  object,
                )

              const correct =
                targetObjects.includes(
                  object,
                )

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
                    handleObjectClick(
                      object,
                    )
                  }
                  disabled={selected}
                  aria-label={
                    text.objectChoice
                  }
                >
                  {object}
                </button>
              )
            },
          )}

        </section>
      )}


      {/* ======================================
          Completion
          ====================================== */}

      {gameCompleted && (
        <section className="object-recall-complete">

          <h2>
            🎉 {text.wellDone}
          </h2>


          <p>
            {text.completedMessage(
              targetCount,
            )}
          </p>


          <p>
            <strong>
              {text.difficulty}:
            </strong>{' '}
            {
              text.difficulties[
              difficulty
              ]
            }
          </p>


          <p>
            <strong>
              {text.correct}:
            </strong>{' '}
            {correctSelections}
          </p>


          <p>
            <strong>
              {text.wrong}:
            </strong>{' '}
            {wrongSelections}
          </p>


          <p>
            <strong>
              {text.time}:
            </strong>{' '}
            {formatTime(
              timeElapsed,
            )}
          </p>


          <p>
            <strong>
              {text.accuracy}:
            </strong>{' '}
            {accuracy}%
          </p>


          <button
            type="button"
            className="object-start-button"
            onClick={handleRestart}
          >
            {text.playAgain}
          </button>

        </section>
      )}


      {/* ======================================
          Local History
          ====================================== */}

      {history.length > 0 && (
        <section className="object-history">

          <div className="object-history-header">

            <div>

              <h2>
                📊 {text.previousSessions}
              </h2>


              <p>
                {text.recentResults}
              </p>

            </div>


            <button
              type="button"
              className="object-clear-button"
              onClick={
                handleClearHistory
              }
            >
              {text.clearHistory}
            </button>

          </div>


          <div className="object-history-list">

            {history.map(
              (result) => (
                <article
                  className="object-history-item"
                  key={result.id}
                >

                  <strong>
                    {result.date}
                  </strong>


                  <div>

                    <span>
                      {text.difficulty}:{' '}
                      {
                        text.difficulties[
                        result.difficulty
                        ] ||
                        result.difficulty
                      }
                    </span>


                    <span>
                      {text.objects}:{' '}
                      {
                        result.targetCount
                      }
                    </span>


                    <span>
                      {text.correct}:{' '}
                      {result.correct}
                    </span>


                    <span>
                      {text.wrong}:{' '}
                      {result.wrong}
                    </span>


                    <span>
                      {text.accuracy}:{' '}
                      {result.accuracy}%
                    </span>


                    <span>
                      {text.time}:{' '}
                      {formatTime(
                        result.time,
                      )}
                    </span>

                  </div>

                </article>
              ),
            )}

          </div>


          <p className="object-local-note">
            {text.localHistoryNote}
          </p>

        </section>
      )}

    </div>
  )
}


export default ObjectRecall
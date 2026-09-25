import { useEffect, useRef, useState } from 'react'

import './MemoryMatch.css'

import { savePerformanceResult } from '../utils/performanceStorage'


const CARD_VALUES = [
  '🍎',
  '🧠',
  '🌸',
  '⭐',
]

const HISTORY_KEY =
  'cognicare-memory-match-history'


function shuffleCards() {
  const cards = [
    ...CARD_VALUES,
    ...CARD_VALUES,
  ]

  for (
    let i = cards.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1),
    )

    ;[cards[i], cards[j]] = [
      cards[j],
      cards[i],
    ]
  }

  return cards.map(
    (value, index) => ({
      id: index,
      value,
    }),
  )
}


function MemoryMatch({
  onBack,
  text,
}) {
  const [cards, setCards] =
    useState(shuffleCards)

  const [flipped, setFlipped] =
    useState([])

  const [matched, setMatched] =
    useState([])

  const [moves, setMoves] =
    useState(0)

  const [busy, setBusy] =
    useState(false)


  // Performance tracking

  const [timeElapsed, setTimeElapsed] =
    useState(0)

  const [timerStarted, setTimerStarted] =
    useState(false)


  // Local history

  const [history, setHistory] =
    useState([])


  // Prevent the same completed
  // game from being saved twice

  const hasSavedResult =
    useRef(false)


  // Load previous history
  // when the game opens

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


  // Start and stop timer

  useEffect(() => {
    if (
      !timerStarted ||
      matched.length ===
        cards.length
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
    matched.length,
    cards.length,
  ])


  const matchedPairs =
    matched.length / 2

  const mistakes =
    Math.max(
      moves - matchedPairs,
      0,
    )

  const accuracy =
    moves === 0
      ? 0
      : Math.round(
          (matchedPairs / moves) *
            100,
        )

  const gameCompleted =
    matched.length ===
    cards.length


  // Save completed game
  // to local history

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
    moves,
    matchedPairs,
    mistakes,
    timeElapsed,
    accuracy,
    history,
  ])


  const handleCardClick = (
    index,
  ) => {
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

    const newFlipped = [
      ...flipped,
      index,
    ]

    setFlipped(newFlipped)

    if (
      newFlipped.length === 2
    ) {
      setMoves(
        (currentMoves) =>
          currentMoves + 1,
      )

      const firstIndex =
        newFlipped[0]

      const secondIndex =
        newFlipped[1]

      if (
        cards[firstIndex].value ===
        cards[secondIndex].value
      ) {
        setMatched(
          (currentMatched) => [
            ...currentMatched,
            firstIndex,
            secondIndex,
          ],
        )

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
    localStorage.removeItem(
      HISTORY_KEY,
    )
  }


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


  return (
    <div className="memory-match-page">

      <header className="memory-match-header">

        <button
          type="button"
          className="memory-back-button"
          onClick={onBack}
        >
          ← {text.backToGames}
        </button>


        <h1>
          🧠 {text.title}
        </h1>


        <p>
          {text.description}
        </p>

      </header>


      {/* Current Game Statistics */}

      <section
        className="memory-stats"
        aria-label={
          text.gameStatistics
        }
      >

        <div className="memory-stat">

          <strong>
            {moves}
          </strong>

          <span>
            {text.moves}
          </span>

        </div>


        <div className="memory-stat">

          <strong>
            {matchedPairs}
          </strong>

          <span>
            {text.matches}
          </span>

        </div>


        <div className="memory-stat">

          <strong>
            {mistakes}
          </strong>

          <span>
            {text.mistakes}
          </span>

        </div>


        <div className="memory-stat">

          <strong>
            {formatTime(
              timeElapsed,
            )}
          </strong>

          <span>
            {text.time}
          </span>

        </div>


        <div className="memory-stat">

          <strong>
            {accuracy}%
          </strong>

          <span>
            {text.accuracy}
          </span>

        </div>

      </section>


      {/* Game Board */}

      <main
        className="memory-board"
        aria-label={
          text.gameBoard
        }
      >

        {cards.map(
          (card, index) => {

            const isFlipped =
              flipped.includes(
                index,
              )

            const isMatched =
              matched.includes(
                index,
              )

            return (
              <button
                key={card.id}
                type="button"
                className={`memory-card ${
                  isFlipped ||
                  isMatched
                    ? 'memory-card--visible'
                    : ''
                } ${
                  isMatched
                    ? 'memory-card--matched'
                    : ''
                }`}
                onClick={() =>
                  handleCardClick(
                    index,
                  )
                }
                aria-label={
                  isFlipped ||
                  isMatched
                    ? `${text.cardShowing} ${card.value}`
                    : text.hiddenCard
                }
              >
                <span>
                  {isFlipped ||
                  isMatched
                    ? card.value
                    : '?'}
                </span>
              </button>
            )
          },
        )}

      </main>


      {/* Completion Summary */}

      {gameCompleted && (
        <section className="memory-complete">

          <h2>
            🎉 {text.wellDone}
          </h2>


          <p>
            {text.completedMessage(
              moves,
            )}
          </p>


          <div className="completion-summary">

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


            <p>
              <strong>
                {text.mistakes}:
              </strong>{' '}
              {mistakes}
            </p>

          </div>


          <button
            type="button"
            className="memory-restart-button"
            onClick={handleRestart}
          >
            {text.playAgain}
          </button>

        </section>
      )}


      {!gameCompleted && (
        <button
          type="button"
          className="memory-restart-button"
          onClick={handleRestart}
        >
          {text.restartGame}
        </button>
      )}


      {/* Previous Game History */}

      {history.length > 0 && (
        <section className="memory-history">

          <div className="memory-history-header">

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
              className="memory-clear-button"
              onClick={
                handleClearHistory
              }
            >
              {text.clearHistory}
            </button>

          </div>


          <div className="memory-history-list">

            {history.map(
              (result) => (
                <article
                  className="memory-history-item"
                  key={result.id}
                >

                  <div>
                    <strong>
                      {result.date}
                    </strong>
                  </div>


                  <div>

                    <span>
                      {text.moves}:{' '}
                      {result.moves}
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

                    <span>
                      {text.mistakes}:{' '}
                      {result.mistakes}
                    </span>

                  </div>

                </article>
              ),
            )}

          </div>


          <p className="memory-local-note">
            {text.localHistoryNote}
          </p>

        </section>
      )}

    </div>
  )
}


export default MemoryMatch
import { useEffect, useState } from 'react'
import './PerformanceDashboard.css'
import VoiceReadAloud from '../Components/VoiceReadAloud'

import { apiGet } from '../utils/api'


function PerformanceDashboard({
  text,
  language = 'en-IN',
  readAloudLabel = 'Read Aloud',
  stopReadingLabel = 'Stop Reading',
  onBack,
}) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await apiGet(
          '/game-sessions',
        )

        setSessions(data.sessions || [])
      } catch (err) {
        console.error(
          'Could not load performance data:',
          err,
        )

        setError(
          err.message ||
          'Could not load performance data from the backend.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
  }, [])


  const averageAccuracy =
    sessions.length === 0
      ? 0
      : Math.round(
        sessions.reduce(
          (total, session) =>
            total +
            Number(session.accuracy || 0),
          0,
        ) / sessions.length,
      )
  const recentAccuracyTrend =
    sessions.length < 2
      ? '—'
      : (() => {
        const recentSessions = sessions.slice(0, 3)

        const recentAverage =
          recentSessions.reduce(
            (total, session) =>
              total + Number(session.accuracy || 0),
            0,
          ) / recentSessions.length

        const olderSessions = sessions.slice(3, 6)

        if (olderSessions.length === 0) {
          return '—'
        }

        const olderAverage =
          olderSessions.reduce(
            (total, session) =>
              total + Number(session.accuracy || 0),
            0,
          ) / olderSessions.length

        if (recentAverage > olderAverage) {
          return 'Improving'
        }

        if (recentAverage < olderAverage) {
          return 'Needs Practice'
        }

        return 'Stable'
      })()
  const gameWiseAnalytics =
    Object.values(
      sessions.reduce(
        (groups, session) => {
          const gameName =
            session.game || 'Unknown'

          if (!groups[gameName]) {
            groups[gameName] = {
              game: gameName,
              sessions: 0,
              totalAccuracy: 0,
              totalMistakes: 0,
            }
          }

          groups[gameName].sessions += 1

          groups[gameName].totalAccuracy +=
            Number(session.accuracy || 0)

          groups[gameName].totalMistakes +=
            Number(session.mistakes || 0)

          return groups
        },
        {},
      ),
    ).map((game) => ({
      game: game.game,
      sessions: game.sessions,
      averageAccuracy: Math.round(
        game.totalAccuracy / game.sessions,
      ),
      averageMistakes: (
        game.totalMistakes / game.sessions
      ).toFixed(1),
    }))

  const accuracyDistribution = {
    excellent: sessions.filter(
      (session) =>
        Number(session.accuracy || 0) >= 90,
    ).length,

    good: sessions.filter(
      (session) => {
        const accuracy =
          Number(session.accuracy || 0)

        return (
          accuracy >= 70 &&
          accuracy < 90
        )
      },
    ).length,

    average: sessions.filter(
      (session) => {
        const accuracy =
          Number(session.accuracy || 0)

        return (
          accuracy >= 50 &&
          accuracy < 70
        )
      },
    ).length,

    needsPractice: sessions.filter(
      (session) =>
        Number(session.accuracy || 0) < 50,
    ).length,
  }
  const difficultyWiseAnalytics =
    Object.values(
      sessions.reduce(
        (groups, session) => {
          const difficulty =
            session.difficulty || 'Unknown'

          if (!groups[difficulty]) {
            groups[difficulty] = {
              difficulty,
              sessions: 0,
              totalAccuracy: 0,
            }
          }

          groups[difficulty].sessions += 1

          groups[difficulty].totalAccuracy +=
            Number(session.accuracy || 0)

          return groups
        },
        {},
      ),
    ).map((difficulty) => ({
      difficulty:
        difficulty.difficulty,

      sessions:
        difficulty.sessions,

      averageAccuracy:
        Math.round(
          difficulty.totalAccuracy /
          difficulty.sessions,
        ),
    }))
  const timeWiseAnalytics =
    Object.values(
      sessions.reduce(
        (groups, session) => {
          const gameName =
            session.game || 'Unknown'

          if (!groups[gameName]) {
            groups[gameName] = {
              game: gameName,
              sessions: 0,
              totalTime: 0,
            }
          }

          groups[gameName].sessions += 1

          groups[gameName].totalTime +=
            Number(session.time || 0)

          return groups
        },
        {},
      ),
    ).map((game) => ({
      game: game.game,
      sessions: game.sessions,
      averageTime: Math.round(
        game.totalTime / game.sessions,
      ),
    }))




  const averageMistakes =
    sessions.length === 0
      ? '—'
      : (
        sessions.reduce(
          (total, session) =>
            total +
            Number(session.mistakes || 0),
          0,
        ) / sessions.length
      ).toFixed(1)

  const gameCounts = sessions.reduce(
    (counts, session) => {
      const gameName =
        session.game || 'Unknown'

      counts[gameName] =
        (counts[gameName] || 0) + 1

      return counts
    },
    {},
  )

  const mostPlayedGame =
    sessions.length === 0
      ? '—'
      : Object.entries(gameCounts).sort(
        (a, b) => b[1] - a[1],
      )[0][0]

  const analyticsSummary =
    sessions.length === 0
      ? {
        sessions: 0,
        message:
          'No performance data is available yet.',
      }
      : {
        sessions: sessions.length,
        message:
          `You have completed ${sessions.length} sessions with an average accuracy of ${averageAccuracy}%. Your recent performance trend is ${recentAccuracyTrend}. Your most played game is ${mostPlayedGame}.`,
      }


  const averageTime =
    sessions.length === 0
      ? 0
      : Math.round(
        sessions.reduce(
          (total, session) =>
            total +
            Number(session.time || 0),
          0,
        ) / sessions.length,
      )


  const gameTypes = new Set(
    sessions.map(
      (session) => session.game,
    ),
  ).size


  const formatTime = (seconds) => {
    const totalSeconds =
      Number(seconds || 0)

    const minutes = Math.floor(
      totalSeconds / 60,
    )

    const remainingSeconds =
      totalSeconds % 60

    return `${String(minutes).padStart(
      2,
      '0',
    )}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`
  }


  const formatDate = (dateValue) => {
    if (!dateValue) {
      return 'Unknown'
    }

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return 'Unknown'
    }

    return date.toLocaleString()
  }


  return (
    <div className="performance-page">

      <header className="performance-header">

        <button
          type="button"
          className="performance-back-button"
          onClick={onBack}
        >
          ← {text.backToDashboard}
        </button>


        <h1>
          📊 {text.performanceDashboard}
        </h1>

        <VoiceReadAloud
          text={`${text.performanceDashboard}. ${text.performancePageDescription}`}
          language={language}
          label={readAloudLabel}
          stopLabel={stopReadingLabel}
        />


        <p>
          {text.performancePageDescription}
        </p>

      </header>


      {loading && (
        <div className="performance-message">
          {text.loadingPerformance}
        </div>
      )}


      {!loading && error && (
        <div className="performance-message performance-message--error">
          {error}
        </div>
      )}


      {!loading && !error && (
        <>

          {/* Summary */}
          <section className="performance-summary">

            <div className="performance-stat">
              <strong>
                {sessions.length}
              </strong>

              <span>
                {text.totalSessions}
              </span>
            </div>


            <div className="performance-stat">
              <strong>
                {gameTypes}
              </strong>

              <span>
                {text.gamesPlayed}
              </span>
            </div>


            <div className="performance-stat">
              <strong>
                {averageAccuracy}%
              </strong>

              <span>
                {text.averageAccuracy}
              </span>
            </div>

            <div className="performance-stat">
              <strong>
                {averageMistakes}
              </strong>

              <span>
                {text.averageMistakes}
              </span>
            </div>

            <div className="performance-stat">
              <strong>
                {mostPlayedGame}
              </strong>

              <span>
                {text.mostPlayedGame}
              </span>
            </div>

            <div className="performance-stat">
              <strong>
                {recentAccuracyTrend}
              </strong>

              <span>
                Performance Trend
              </span>
            </div>

            <div className="performance-stat">
              <strong>
                {formatTime(
                  averageTime,
                )}
              </strong>

              <span>
                {text.averageTime}
              </span>
            </div>

          </section>
          <section className="performance-game-summary">
            {gameWiseAnalytics.length === 0 && (
              <p className="performance-empty-message">
                No game performance data available yet.
              </p>
            )}
            <h2>Game-wise Performance</h2>

            <div className="performance-game-grid">
              {gameWiseAnalytics.map((game) => (
                <article
                  className="performance-game-card"
                  key={game.game}
                >
                  <h3>{game.game}</h3>

                  <p>
                    <strong>{game.sessions}</strong>{' '}
                    {game.sessions === 1
                      ? 'session'
                      : 'sessions'}
                  </p>

                  <p>
                    Average Accuracy:{' '}
                    <strong>{game.averageAccuracy}%</strong>
                  </p>

                  <p>
                    Average Mistakes:{' '}
                    <strong>{game.averageMistakes}</strong>
                  </p>
                </article>
              ))}
            </div>
          </section>
          <section className="performance-distribution">
            <h2>Accuracy Distribution</h2>

            <div className="performance-distribution-grid">
              <div className="performance-stat">
                <strong>{accuracyDistribution.excellent}</strong>
                <span>90–100% Accuracy</span>
              </div>

              <div className="performance-stat">
                <strong>{accuracyDistribution.good}</strong>
                <span>70–89% Accuracy</span>
              </div>

              <div className="performance-stat">
                <strong>{accuracyDistribution.average}</strong>
                <span>50–69% Accuracy</span>
              </div>

              <div className="performance-stat">
                <strong>{accuracyDistribution.needsPractice}</strong>
                <span>Below 50% Accuracy</span>
              </div>
            </div>
          </section>
          <section className="performance-difficulty-summary">
            <h2>Difficulty-wise Performance</h2>

            <div className="performance-difficulty-grid">
              {difficultyWiseAnalytics.map((item) => (
                <article
                  className="performance-difficulty-card"
                  key={item.difficulty}
                >
                  <h3>{item.difficulty}</h3>

                  <p>
                    Sessions:{' '}
                    <strong>{item.sessions}</strong>
                  </p>

                  <p>
                    Average Accuracy:{' '}
                    <strong>{item.averageAccuracy}%</strong>
                  </p>
                </article>
              ))}
            </div>
          </section>
          <section className="performance-time-summary">
            <h2>Time-wise Performance</h2>

            <div className="performance-time-grid">
              {timeWiseAnalytics.map((item) => (
                <article
                  className="performance-time-card"
                  key={item.game}
                >
                  <h3>{item.game}</h3>

                  <p>
                    Sessions:{' '}
                    <strong>{item.sessions}</strong>
                  </p>

                  <p>
                    Average Time:{' '}
                    <strong>{item.averageTime}s</strong>
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="performance-summary">
            <h2>Analytics Summary</h2>

            <div className="performance-summary-card">
              <strong>
                {analyticsSummary.sessions}
              </strong>

              <p>
                {analyticsSummary.message}
              </p>
            </div>
          </section>

          {/* Recent Sessions */}
          <section className="performance-history">

            <div className="performance-history-header">

              <div>

                <h2>
                  {text.recentSessions}
                </h2>

                <p>
                  {text.performanceDataSource}
                </p>

              </div>

            </div>


            {sessions.length === 0 ? (

              <div className="performance-empty">
                {text.noSessions}
              </div>

            ) : (

              <div className="performance-list">

                {sessions.map(
                  (session) => (
                    <article
                      className="performance-item"
                      key={session.id}
                    >

                      <div className="performance-item-main">

                        <h3>
                          {session.game}
                        </h3>

                        <p>
                          {formatDate(
                            session.created_at,
                          )}
                        </p>

                      </div>


                      <div className="performance-item-data">

                        <span>
                          {text.difficulty}:{' '}
                          {session.difficulty}
                        </span>


                        <span>
                          {text.accuracy}:{' '}
                          {session.accuracy}%
                        </span>


                        <span>
                          {text.mistakes}:{' '}
                          {session.mistakes}
                        </span>


                        <span>
                          {text.time}:{' '}
                          {formatTime(
                            session.time,
                          )}
                        </span>

                      </div>

                    </article>
                  ),
                )}

              </div>

            )}

          </section>

        </>
      )}

    </div>
  )
}


export default PerformanceDashboard
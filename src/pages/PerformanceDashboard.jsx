import { useEffect, useState } from 'react'
import './PerformanceDashboard.css'

import { apiGet } from '../utils/api'


function PerformanceDashboard({ onBack }) {
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
          ← Back to Dashboard
        </button>


        <h1>
          📊 Performance Dashboard
        </h1>


        <p>
          Review your recent cognitive
          game performance.
        </p>

      </header>


      {loading && (
        <div className="performance-message">
          Loading performance data...
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
                Total Sessions
              </span>
            </div>


            <div className="performance-stat">
              <strong>
                {gameTypes}
              </strong>

              <span>
                Games Played
              </span>
            </div>


            <div className="performance-stat">
              <strong>
                {averageAccuracy}%
              </strong>

              <span>
                Average Accuracy
              </span>
            </div>


            <div className="performance-stat">
              <strong>
                {formatTime(
                  averageTime,
                )}
              </strong>

              <span>
                Average Time
              </span>
            </div>

          </section>


          {/* Recent Sessions */}
          <section className="performance-history">

            <div className="performance-history-header">

              <div>

                <h2>
                  Recent Sessions
                </h2>

                <p>
                  Data loaded from your
                  account through FastAPI
                  and PostgreSQL.
                </p>

              </div>

            </div>


            {sessions.length === 0 ? (

              <div className="performance-empty">
                No game sessions recorded yet.
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
                          Difficulty:{' '}
                          {session.difficulty}
                        </span>


                        <span>
                          Accuracy:{' '}
                          {session.accuracy}%
                        </span>


                        <span>
                          Mistakes:{' '}
                          {session.mistakes}
                        </span>


                        <span>
                          Time:{' '}
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
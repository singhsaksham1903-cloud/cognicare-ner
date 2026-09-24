import { useEffect, useState } from 'react'

import './CaregiverDashboard.css'

import { apiGet } from '../utils/api'


function CaregiverDashboard({ onBack }) {
  const [sessions, setSessions] = useState([])
  const [memories, setMemories] = useState([])
  const [reminders, setReminders] = useState([])
  const [recommendation, setRecommendation] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        const [
          sessionsData,
          memoriesData,
          remindersData,
          recommendationData,
        ] = await Promise.all([
          apiGet('/game-sessions'),
          apiGet('/memories'),
          apiGet('/reminders'),
          apiGet('/recommendation'),
        ])

        setSessions(
          sessionsData.sessions || [],
        )

        setMemories(
          memoriesData.memories || [],
        )

        setReminders(
          remindersData.reminders || [],
        )

        setRecommendation(
          recommendationData.recommendation || null,
        )
      } catch (err) {
        console.error(
          'Could not load caregiver dashboard data:',
          err,
        )

        setError(
          err.message ||
            'Could not load caregiver dashboard.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])


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


  const formatDate = (value) => {
    if (!value) {
      return 'Unknown'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return 'Unknown'
    }

    return date.toLocaleString()
  }


  const formatReminderDate = (value) => {
    if (!value) {
      return 'No due date'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return date.toLocaleString()
  }


  const averageAccuracy =
    sessions.length === 0
      ? 0
      : Math.round(
          sessions.reduce(
            (total, session) =>
              total +
              Number(
                session.accuracy || 0,
              ),
            0,
          ) / sessions.length,
        )


  const gameTypes = new Set(
    sessions.map(
      (session) => session.game,
    ),
  ).size


  const recentSessions =
    sessions.slice(0, 8)


  const upcomingReminders =
    reminders
      .filter(
        (reminder) =>
          !reminder.completed &&
          reminder.dueDatetime,
      )
      .sort(
        (a, b) =>
          new Date(
            a.dueDatetime,
          ).getTime() -
          new Date(
            b.dueDatetime,
          ).getTime(),
      )
      .slice(0, 5)


  const getGameSessions = (
    gameName,
  ) =>
    sessions.filter(
      (session) =>
        session.game === gameName,
    )


  const getGameAverage = (
    gameName,
  ) => {
    const gameSessions =
      getGameSessions(gameName)

    if (gameSessions.length === 0) {
      return '—'
    }

    const average =
      gameSessions.reduce(
        (total, session) =>
          total +
          Number(
            session.accuracy || 0,
          ),
        0,
      ) / gameSessions.length

    return `${Math.round(
      average,
    )}%`
  }


  const getRecentGameAccuracy = (
    gameName,
  ) => {
    const gameSessions =
      getGameSessions(gameName)

    if (gameSessions.length === 0) {
      return null
    }

    const recent =
      gameSessions.slice(0, 3)

    return (
      recent.reduce(
        (total, session) =>
          total +
          Number(
            session.accuracy || 0,
          ),
        0,
      ) / recent.length
    )
  }


  const getGameTrend = (
    gameName,
  ) => {
    const gameSessions =
      getGameSessions(gameName)

    if (gameSessions.length < 2) {
      return 'Not enough data'
    }

    const recent =
      gameSessions[0]

    const previous =
      gameSessions[1]

    const difference =
      Number(
        recent.accuracy || 0,
      ) -
      Number(
        previous.accuracy || 0,
      )

    if (difference > 5) {
      return 'Improving'
    }

    if (difference < -5) {
      return 'Declining'
    }

    return 'Stable'
  }


  const gameNames = [
    'Memory Match',
    'Sequence Memory',
    'Object Recall',
  ]


  return (
    <div className="caregiver-page">

      <header className="caregiver-header">

        <button
          type="button"
          className="caregiver-back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>


        <h1>
          👤 Caregiver Dashboard
        </h1>


        <p>
          Review recent cognitive activity
          and important daily information.
        </p>

      </header>


      {loading && (
        <div className="caregiver-message">
          Loading caregiver data...
        </div>
      )}


      {!loading && error && (
        <div className="caregiver-message caregiver-message--error">
          {error}
        </div>
      )}


      {!loading && !error && (
        <>

          {/* Summary */}
          <section className="caregiver-summary">

            <div className="caregiver-stat">
              <strong>
                {sessions.length}
              </strong>

              <span>
                Total Sessions
              </span>
            </div>


            <div className="caregiver-stat">
              <strong>
                {gameTypes}
              </strong>

              <span>
                Games Played
              </span>
            </div>


            <div className="caregiver-stat">
              <strong>
                {averageAccuracy}%
              </strong>

              <span>
                Average Accuracy
              </span>
            </div>


            <div className="caregiver-stat">
              <strong>
                {memories.length}
              </strong>

              <span>
                Saved Memories
              </span>
            </div>


            <div className="caregiver-stat">
              <strong>
                {
                  reminders.filter(
                    (reminder) =>
                      !reminder.completed,
                  ).length
                }
              </strong>

              <span>
                Active Reminders
              </span>
            </div>

          </section>


          {/* Personalized Activity */}
          {recommendation && (
            <section className="caregiver-recommendation">

              <span className="caregiver-section-label">
                Personalized Activity
              </span>


              <h2>
                {recommendation.game}
              </h2>


              <p>
                Suggested difficulty:{' '}
                <strong>
                  {recommendation.difficulty}
                </strong>
              </p>


              <p className="caregiver-recommendation-reason">
                {recommendation.reason}
              </p>

            </section>
          )}


          {/* Game Performance */}
          <section className="caregiver-game-summary">

            <h2>
              Game Performance
            </h2>


            <div className="caregiver-game-grid">

              {gameNames.map(
                (gameName) => {

                  const count =
                    getGameSessions(
                      gameName,
                    ).length


                  const recentAccuracy =
                    getRecentGameAccuracy(
                      gameName,
                    )


                  return (
                    <article
                      className="caregiver-game-card"
                      key={gameName}
                    >

                      <h3>
                        {gameName}
                      </h3>


                      <strong>
                        {getGameAverage(
                          gameName,
                        )}
                      </strong>


                      <span>
                        {count}{' '}
                        {count === 1
                          ? 'session'
                          : 'sessions'}
                      </span>


                      <div className="caregiver-game-meta">

                        <span>
                          Trend:{' '}
                          {getGameTrend(
                            gameName,
                          )}
                        </span>


                        <span>
                          Recent:{' '}
                          {recentAccuracy ===
                          null
                            ? '—'
                            : `${Math.round(
                                recentAccuracy,
                              )}%`}
                        </span>

                      </div>

                    </article>
                  )
                },
              )}

            </div>

          </section>


          {/* Upcoming Reminders */}
          <section className="caregiver-reminders-section">

            <div className="caregiver-section-heading">

              <div>

                <span className="caregiver-section-label">
                  Planning
                </span>


                <h2>
                  Upcoming Reminders
                </h2>


                <p>
                  The next active reminders
                  currently stored for this user.
                </p>

              </div>

            </div>


            {upcomingReminders.length ===
            0 ? (

              <div className="caregiver-empty">
                No upcoming active reminders.
              </div>

            ) : (

              <div className="caregiver-reminder-list">

                {upcomingReminders.map(
                  (reminder) => (
                    <article
                      className="caregiver-reminder-item"
                      key={reminder.id}
                    >

                      <div>

                        <h3>
                          {reminder.title}
                        </h3>


                        <p>
                          {
                            reminder.description
                          }
                        </p>

                      </div>


                      <div className="caregiver-reminder-meta">

                        <span>
                          {
                            reminder.category
                          }
                        </span>


                        <time>
                          {formatReminderDate(
                            reminder.dueDatetime,
                          )}
                        </time>

                      </div>

                    </article>
                  ),
                )}

              </div>

            )}

          </section>


          {/* Recent Activity */}
          <section className="caregiver-recent">

            <h2>
              Recent Activity
            </h2>


            {recentSessions.length ===
            0 ? (

              <div className="caregiver-empty">
                No sessions recorded yet.
              </div>

            ) : (

              <div className="caregiver-table-wrapper">

                <table className="caregiver-table">

                  <thead>
                    <tr>
                      <th>Game</th>
                      <th>Difficulty</th>
                      <th>Accuracy</th>
                      <th>Mistakes</th>
                      <th>Time</th>
                      <th>Date</th>
                    </tr>
                  </thead>


                  <tbody>

                    {recentSessions.map(
                      (session) => (
                        <tr
                          key={session.id}
                        >

                          <td>
                            {session.game}
                          </td>


                          <td>
                            {
                              session.difficulty
                            }
                          </td>


                          <td>
                            {
                              session.accuracy
                            }%
                          </td>


                          <td>
                            {
                              session.mistakes
                            }
                          </td>


                          <td>
                            {formatTime(
                              session.time,
                            )}
                          </td>


                          <td>
                            {formatDate(
                              session.created_at,
                            )}
                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        </>

      )}

    </div>
  )
}


export default CaregiverDashboard
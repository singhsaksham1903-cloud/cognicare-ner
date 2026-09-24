import { useEffect, useState } from 'react'

import './RecommendationCard.css'

import { apiGet } from '../utils/api'


function RecommendationCard({ onStart }) {
  const [recommendation, setRecommendation] =
    useState(null)

  const [showDetails, setShowDetails] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')


  useEffect(() => {
    const loadRecommendation = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await apiGet(
          '/recommendation',
        )

        setRecommendation(data)
      } catch (err) {
        console.error(
          'Could not load recommendation:',
          err,
        )

        setError(
          err.message ||
            'Recommendation is currently unavailable.',
        )
      } finally {
        setLoading(false)
      }
    }


    const handlePerformanceUpdate = () => {
      loadRecommendation()
    }


    loadRecommendation()


    window.addEventListener(
      'cognicare:performance-updated',
      handlePerformanceUpdate,
    )


    return () => {
      window.removeEventListener(
        'cognicare:performance-updated',
        handlePerformanceUpdate,
      )
    }
  }, [])


  if (loading) {
    return (
      <article className="recommendation-card">

        <div className="recommendation-icon">
          ✨
        </div>

        <div>
          <h2>
            Personalized Recommendation
          </h2>

          <p>
            Analyzing your recent
            performance...
          </p>
        </div>

      </article>
    )
  }


  if (
    error ||
    !recommendation?.recommendation
  ) {
    return (
      <article className="recommendation-card">

        <div className="recommendation-icon">
          ✨
        </div>

        <div>
          <h2>
            Personalized Recommendation
          </h2>

          <p>
            {error ||
              'No recommendation available yet.'}
          </p>
        </div>

      </article>
    )
  }


  const {
    game,
    difficulty,
    reason,
    performance_status,
  } =
    recommendation.recommendation


  const gameSummary =
    recommendation.game_summaries?.[game]


  return (
    <article className="recommendation-card">

      <div className="recommendation-icon">
        ✨
      </div>


      <div className="recommendation-content">

        <span className="recommendation-label">
          Personalized Recommendation
        </span>


        <h2>{game}</h2>


        <div className="recommendation-difficulty">
          Suggested difficulty:{' '}
          <strong>
            {difficulty}
          </strong>
        </div>


        <p>{reason}</p>


        <small>
          Based on{' '}
          {recommendation.based_on_sessions}{' '}
          recorded game sessions.
        </small>


        <button
          type="button"
          className="recommendation-start-button"
          onClick={() =>
            onStart(game, difficulty)
          }
        >
          Start Recommended Game
        </button>


        <button
          type="button"
          className="recommendation-details-button"
          onClick={() =>
            setShowDetails(
              (current) => !current,
            )
          }
          aria-expanded={showDetails}
        >
          {showDetails
            ? 'Hide recommendation details'
            : 'Why this recommendation?'}
        </button>


        {showDetails &&
          gameSummary && (
            <div className="recommendation-details">

              <h3>
                Why this recommendation?
              </h3>


              <div className="recommendation-detail-grid">

                <div>
                  <span>
                    Recent accuracy
                  </span>

                  <strong>
                    {
                      gameSummary.recent_accuracy
                    }%
                  </strong>
                </div>


                <div>
                  <span>
                    Overall accuracy
                  </span>

                  <strong>
                    {
                      gameSummary.overall_accuracy
                    }%
                  </strong>
                </div>


                <div>
                  <span>
                    Mistakes per session
                  </span>

                  <strong>
                    {
                      gameSummary.average_mistakes
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Performance trend
                  </span>

                  <strong>
                    {performance_status}
                  </strong>
                </div>


                <div>
                  <span>
                    Sessions analyzed
                  </span>

                  <strong>
                    {
                      recommendation.based_on_sessions
                    }
                  </strong>
                </div>

              </div>


              <p>
                The recommendation is based on
                your recent game performance,
                mistakes, and performance trend.
              </p>

            </div>
          )}

      </div>

    </article>
  )
}


export default RecommendationCard
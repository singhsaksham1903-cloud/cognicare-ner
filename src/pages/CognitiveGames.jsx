import { useEffect, useState } from 'react'
import './CognitiveGames.css'
import MemoryMatch from './MemoryMatch'
import SequenceMemory from './SequenceMemory'
import ObjectRecall from './ObjectRecall'

// ============================================
// Game Card Component
// ============================================

function GameCard({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
}) {
  const isAvailable = Boolean(onClick)

  return (
    <article className="game-card">
      <span
        className="game-card-icon"
        role="img"
        aria-hidden="true"
      >
        {icon}
      </span>

      <h2 className="game-card-title">{title}</h2>

      <p className="game-card-description">{description}</p>

      <button
        type="button"
        className={`game-card-button${isAvailable ? '' : ' game-card-button--disabled'
          }`}
        disabled={!isAvailable}
        onClick={onClick}
        aria-label={`${title} — ${buttonLabel}`}
      >
        {buttonLabel}
      </button>
    </article>
  )
}

// ============================================
// Cognitive Games Page
// ============================================

function CognitiveGames({
  text,
  onNavigate,
  initialGame = null,
  initialDifficulty = null,
}) {
  const [selectedGame, setSelectedGame] =
    useState(initialGame)

  useEffect(() => {
    if (initialGame) {
      setSelectedGame(initialGame)
    }
  }, [initialGame])

  // -----------------------------
  // Open Memory Match
  // -----------------------------
  if (selectedGame === 'memory-match') {
    return (
      <MemoryMatch
        onBack={() => setSelectedGame(null)}
      />
    )
  }

  // -----------------------------
  // Open Sequence Memory
  // -----------------------------
  if (selectedGame === 'sequence-memory') {
    return (
      <SequenceMemory
        initialDifficulty={
          initialDifficulty || 'Easy'
        }
        onBack={() => setSelectedGame(null)}
      />
    )
  }
  // ----------------------------
  // Open Object Recall
  // -----------------------------
  if (selectedGame === 'object-recall') {
    return (
      <ObjectRecall
        initialDifficulty={
          initialDifficulty || 'Easy'
        }
        onBack={() => setSelectedGame(null)}
      />
    )
  }

  return (
    <div className="games-page">
      {/* --- Back Button --- */}
      <button
        type="button"
        className="back-button"
        onClick={() => onNavigate('dashboard')}
      >
        ← {text.backButton}
      </button>

      {/* --- Page Header --- */}
      <header className="games-header">
        <span
          className="games-header-icon"
          role="img"
          aria-hidden="true"
        >
          {text.icon}
        </span>

        <h1 className="games-title">
          {text.title}
        </h1>

        <p className="games-subtitle">
          {text.subtitle}
        </p>
      </header>

      {/* --- Game Cards --- */}
      <main className="games-grid">
        {text.games.map((game) => (
          <GameCard
            key={game.id}
            icon={game.icon}
            title={game.title}
            description={game.description}
            buttonLabel={game.button}
            onClick={
              game.title === 'Memory Match'
                ? () => setSelectedGame('memory-match')
                : game.title === 'Sequence Memory'
                  ? () => setSelectedGame('sequence-memory')
                  : game.title === 'Object Recall'
                    ? () => setSelectedGame('object-recall')
                    : undefined
            }
          />
        ))}
      </main>
    </div>
  )
}

export default CognitiveGames
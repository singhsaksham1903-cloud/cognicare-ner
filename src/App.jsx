import { useEffect, useState } from 'react'
import AuthPage from './pages/AuthPage'
import CognitiveGames from './pages/CognitiveGames'
import PerformanceDashboard from './pages/PerformanceDashboard'
import CaregiverDashboard from './pages/CaregiverDashboard'
import RecommendationCard from './pages/RecommendationCard'
import Memories from './pages/Memories'
import Reminders from './pages/Reminders'
import UserBar from './pages/UserBar'
import {
  getCurrentUser,
  logout,
} from './utils/auth'

import './App.css'

// ============================================
// UI Text — all user-facing strings in one place
// for future multilingual support (Hindi, Assamese, etc.)
// ============================================
const TEXT = {
  appName: 'Cognicare',
  appNameHighlight: 'NER',
  userName: 'Mrs. Das',
  greetingMorning: 'Good morning',
  greetingAfternoon: 'Good afternoon',
  greetingEvening: 'Good evening',
  cards: {
    games: {
      icon: '🧠',
      title: 'Cognitive Games',
      description: 'Exercise your mind with fun puzzles and games.',
      button: 'Play Now',
    },
    memories: {
      icon: '📸',
      title: 'My Memories',
      description: 'View your photos and cherished moments.',
      button: 'View Memories',
    },
    reminders: {
      icon: '📋',
      title: "Today's Reminders",
      description: 'Your tasks and reminders for today.',
      button: 'See All Reminders',
    },
    caregiver: {
      icon: '🆘',
      title: 'Caregiver Help',
      description: 'Contact your caregiver or get help anytime.',
      button: 'Get Help',
    },
  },
  footer: 'Cognicare NER — SIH 2025 Prototype',
  gamesPage: {
    icon: '🧠',
    title: 'Cognitive Games',
    subtitle: 'Choose a game to exercise your mind, Mrs. Das.',
    backButton: 'Back to Dashboard',
    games: [
      {
        id: 'memory-match',
        icon: '🃏',
        title: 'Memory Match',
        description: 'Flip cards and find matching pairs to train your memory.',
        button: 'Coming Soon',
      },
      {
        id: 'sequence-memory',
        icon: '🔢',
        title: 'Sequence Memory',
        description: 'Remember and repeat the sequence of numbers or colors.',
        button: 'Coming Soon',
      },
      {
        id: 'object-recall',
        icon: '👁️',
        title: 'Object Recall',
        description: 'Look at objects, then recall what you saw.',
        button: 'Coming Soon',
      },
    ],
  },
}

// ============================================
// Mock Data — static for the prototype
// Replace with API calls when backend is ready
// ============================================
const MOCK_REMINDERS = [
  { id: 1, time: '8:00 AM', label: 'Morning medicine 💊' },
  { id: 2, time: '10:00 AM', label: 'Walk in the garden 🌿' },
  { id: 3, time: '1:00 PM', label: 'Lunch with family 🍽️' },
]

// ============================================
// Helper — get time-appropriate greeting
// ============================================
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return TEXT.greetingMorning
  if (hour < 17) return TEXT.greetingAfternoon
  return TEXT.greetingEvening
}

// ============================================
// Helper — format today's date in a readable way
// ============================================
function getFormattedDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ============================================
// Dashboard Card Component
// ============================================
function DashboardCard({ icon, title, description, buttonLabel, buttonStyle, variant, onClick, children }) {
  return (
    <article className={`card${variant === 'danger' ? ' card--danger' : ''}`}>
      <span className="card-icon" role="img" aria-hidden="true">
        {icon}
      </span>
      <h2 className="card-title">{title}</h2>
      <p className="card-description">{description}</p>
      {children}
      <button
        type="button"
        className={`card-button${buttonStyle ? ` card-button--${buttonStyle}` : ''}`}
        onClick={onClick}
      >
        {buttonLabel}
      </button>
    </article>
  )
}

// ============================================
// App — Main Dashboard
// ============================================
function App() {
  const [page, setPage] = useState('dashboard')

  const [currentUser, setCurrentUser] =
    useState(null)

  const [authLoading, setAuthLoading] =
    useState(true)
  const [recommendedGame, setRecommendedGame] =
    useState(null)

  const [recommendedDifficulty, setRecommendedDifficulty] =
    useState(null)

  useEffect(() => {
    const restoreUserSession = async () => {
      try {
        const user = await getCurrentUser()

        setCurrentUser(user)
      } finally {
        setAuthLoading(false)
      }
    }

    restoreUserSession()
  }, [])

  const openGames = (
    game = null,
    difficulty = null,
  ) => {
    setRecommendedGame(game)
    setRecommendedDifficulty(difficulty)
    setPage('games')
  }

  const greeting = getGreeting()
  const todayDate = getFormattedDate()

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
        }}
      >
        Loading Cognicare...
      </div>
    )
  }
  if (!currentUser) {
    return (
      <AuthPage
        onAuthenticated={(user) => {
          setCurrentUser(user)
          setPage('dashboard')
        }}
      />
    )
  }

  if (page === 'games') {
    return (
      <CognitiveGames
        text={TEXT.gamesPage}
        initialGame={recommendedGame}
        initialDifficulty={recommendedDifficulty}
        onNavigate={(targetPage) => {
          setRecommendedGame(null)
          setRecommendedDifficulty(null)
          setPage(targetPage)
        }}
      />
    )
  }

  if (page === 'performance') {
    return (
      <PerformanceDashboard
        onBack={() => setPage('dashboard')}
      />
    )
  }

  if (page === 'caregiver') {
    return (
      <CaregiverDashboard
        onBack={() => setPage('dashboard')}
      />
    )
  }

  if (page === 'memories') {
    return (
      <Memories
        onBack={() => setPage('dashboard')}
      />
    )
  }

  if (page === 'reminders') {
    return (
      <Reminders
        onBack={() => setPage('dashboard')}
      />
    )
  }

  return (
    <>
      {/* --- Header --- */}
      <header className="app-header">
        <div className="app-logo">
          {TEXT.appName} <span className="app-logo-highlight">{TEXT.appNameHighlight}</span>
        </div>
        <h1 className="greeting">
          {greeting}, {TEXT.userName}
        </h1>
        <p className="date-display">{todayDate}</p>
      </header>

      {/* --- Dashboard Cards --- */}
      <UserBar
        user={currentUser}
        onLogout={() => {
          setCurrentUser(null)
          setPage('dashboard')
        }}
      />
      <main className="dashboard">

        <RecommendationCard
          onStart={(game, difficulty) => {
            const gameMap = {
              'Memory Match': 'memory-match',
              'Sequence Memory': 'sequence-memory',
              'Object Recall': 'object-recall',
            }

            openGames(
              gameMap[game],
              difficulty,
            )
          }}
        />

        <DashboardCard
          icon={TEXT.cards.games.icon}
          title={TEXT.cards.games.title}
          description={TEXT.cards.games.description}
          buttonLabel={TEXT.cards.games.button}
          onClick={() => openGames()}
        />

        <DashboardCard
          icon="📊"
          title="My Performance"
          description="View your recent cognitive game performance."
          buttonLabel="View Performance"
          onClick={() => setPage('performance')}
        />

        <DashboardCard
          icon="👤"
          title="Caregiver Dashboard"
          description="Review recent cognitive activity and performance."
          buttonLabel="Open Caregiver Dashboard"
          onClick={() => setPage('caregiver')}
        />

        <DashboardCard
          icon="📝"
          title="Memories"
          description="Save and revisit important moments and stories."
          buttonLabel="Open Memories"
          onClick={() => setPage('memories')}
        />

        <DashboardCard
          icon="⏰"
          title="Reminders"
          description="Keep track of important activities and tasks."
          buttonLabel="Open Reminders"
          onClick={() => setPage('reminders')}
        />

        <DashboardCard
          icon={TEXT.cards.memories.icon}
          title={TEXT.cards.memories.title}
          description={TEXT.cards.memories.description}
          buttonLabel={TEXT.cards.memories.button}
          buttonStyle="green"
        />

        <DashboardCard
          icon={TEXT.cards.reminders.icon}
          title={TEXT.cards.reminders.title}
          description={TEXT.cards.reminders.description}
          buttonLabel={TEXT.cards.reminders.button}
        >
          <ul className="reminders-list">
            {MOCK_REMINDERS.map((r) => (
              <li key={r.id} className="reminder-item">
                <span className="reminder-time">{r.time}</span>
                <span>{r.label}</span>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard
          icon={TEXT.cards.caregiver.icon}
          title={TEXT.cards.caregiver.title}
          description={TEXT.cards.caregiver.description}
          buttonLabel={TEXT.cards.caregiver.button}
          buttonStyle="danger"
          variant="danger"
        />
      </main>

      {/* --- Footer --- */}
      <footer className="app-footer">{TEXT.footer}</footer>
    </>
  )
}

export default App

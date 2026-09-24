import { useState } from 'react'
import {
  loginUser,
  registerUser,
} from '../utils/auth'
import './AuthPage.css'

function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('elderly')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')


  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'register') {
        await registerUser(
          fullName,
          email,
          password,
          role,
        )

        setMessage(
          'Account created successfully. You can now log in.',
        )

        setMode('login')
        setPassword('')
      } else {
        const user = await loginUser(
          email,
          password,
        )

        onAuthenticated(user)
      }
    } catch (err) {
      setError(
        err.message ||
          'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }


  const switchMode = () => {
    setMode(
      mode === 'login'
        ? 'register'
        : 'login',
    )

    setError('')
    setMessage('')
  }


  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <h1>Cognicare NER</h1>

          <p>
            {mode === 'login'
              ? 'Sign in to continue'
              : 'Create your Cognicare account'}
          </p>
        </div>


        {error && (
          <div className="auth-message auth-message--error">
            {error}
          </div>
        )}


        {message && (
          <div className="auth-message auth-message--success">
            {message}
          </div>
        )}


        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {mode === 'register' && (
            <label>
              Full Name

              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value,
                  )
                }
                placeholder="Enter your full name"
                required
                maxLength={200}
              />
            </label>
          )}


          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="Enter your email"
              required
            />
          </label>


          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder="Enter your password"
              required
              minLength={8}
              maxLength={128}
            />
          </label>


          {mode === 'register' && (
            <label>
              Account Type

              <select
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value,
                  )
                }
              >
                <option value="elderly">
                  Elderly User
                </option>

                <option value="caregiver">
                  Caregiver
                </option>
              </select>
            </label>
          )}


          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>


        <button
          type="button"
          className="auth-switch-button"
          onClick={switchMode}
        >
          {mode === 'login'
            ? "Don't have an account? Create one"
            : 'Already have an account? Sign in'}
        </button>
      </section>
    </div>
  )
}

export default AuthPage
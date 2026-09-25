import { useState } from 'react'

import {
  loginUser,
  registerUser,
} from '../utils/auth'

import LanguageSelector from '../Components/LanguageSelector'
import translations from '../data/translations'

import './AuthPage.css'


function AuthPage({
  onAuthenticated,
}) {
  const [mode, setMode] = useState('login')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('elderly')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')


  const [language, setLanguage] =
    useState(() => {
      return (
        localStorage.getItem(
          'cognicare-language',
        ) || 'en'
      )
    })


  const text =
    translations[language]?.authPage ||
    translations.en.authPage


  const handleLanguageChange = (
    newLanguage,
  ) => {
    setLanguage(newLanguage)

    localStorage.setItem(
      'cognicare-language',
      newLanguage,
    )
  }


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
          text.accountCreated,
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
          text.genericError,
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

          <h1>
            Cognicare NER
          </h1>

          <p>
            {mode === 'login'
              ? text.signInSubtitle
              : text.createAccountSubtitle}
          </p>

        </div>


        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <LanguageSelector
            language={language}
            onChange={
              handleLanguageChange
            }
            label={text.language}
          />
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
              {text.fullName}

              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value,
                  )
                }
                placeholder={
                  text.fullNamePlaceholder
                }
                required
                maxLength={200}
              />
            </label>
          )}


          <label>
            {text.email}

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder={
                text.emailPlaceholder
              }
              required
            />
          </label>


          <label>
            {text.password}

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder={
                text.passwordPlaceholder
              }
              required
              minLength={8}
              maxLength={128}
            />
          </label>


          {mode === 'register' && (
            <label>
              {text.accountType}

              <select
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value,
                  )
                }
              >
                <option value="elderly">
                  {text.elderlyUser}
                </option>

                <option value="caregiver">
                  {text.caregiver}
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
              ? text.pleaseWait
              : mode === 'login'
                ? text.signIn
                : text.createAccount}
          </button>

        </form>


        <button
          type="button"
          className="auth-switch-button"
          onClick={switchMode}
        >
          {mode === 'login'
            ? text.createAccountPrompt
            : text.signInPrompt}
        </button>

      </section>

    </div>
  )
}


export default AuthPage
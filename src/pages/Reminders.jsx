import { useEffect, useState } from 'react'

import './Reminders.css'

import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
} from '../utils/api'


const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'General',
  dueDatetime: '',
  completed: false,
}


function Reminders({ onBack }) {
  const [reminders, setReminders] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)

  const [editingId, setEditingId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')


  const loadReminders = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await apiGet('/reminders')

      setReminders(data.reminders || [])
    } catch (err) {
      console.error(
        'Could not load reminders:',
        err,
      )

      setError(
        err.message ||
          'Could not load reminders from the server.',
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadReminders()
  }, [])


  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }


  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }


  const handleSubmit = async (event) => {
    event.preventDefault()

    if (
      !form.title.trim() ||
      !form.description.trim()
    ) {
      setError(
        'Please enter both a title and description.',
      )
      return
    }

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const isEditing = editingId !== null

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        dueDatetime: form.dueDatetime
          ? new Date(
              form.dueDatetime,
            ).toISOString()
          : null,
        completed: form.completed,
      }

      if (isEditing) {
        await apiPut(
          `/reminders/${editingId}`,
          payload,
        )

        setMessage(
          'Reminder updated successfully.',
        )
      } else {
        await apiPost(
          '/reminders',
          payload,
        )

        setMessage(
          'Reminder saved successfully.',
        )
      }

      resetForm()

      await loadReminders()
    } catch (err) {
      console.error(
        'Could not save reminder:',
        err,
      )

      setError(
        err.message ||
          'Could not save the reminder.',
      )
    } finally {
      setSaving(false)
    }
  }


  const handleEdit = (reminder) => {
    let localDateTime = ''

    if (reminder.dueDatetime) {
      const date = new Date(
        reminder.dueDatetime,
      )

      if (!Number.isNaN(date.getTime())) {
        const year = date.getFullYear()

        const month = String(
          date.getMonth() + 1,
        ).padStart(2, '0')

        const day = String(
          date.getDate(),
        ).padStart(2, '0')

        const hours = String(
          date.getHours(),
        ).padStart(2, '0')

        const minutes = String(
          date.getMinutes(),
        ).padStart(2, '0')

        localDateTime =
          `${year}-${month}-${day}T${hours}:${minutes}`
      }
    }

    setEditingId(reminder.id)

    setForm({
      title: reminder.title || '',
      description:
        reminder.description || '',
      category:
        reminder.category || 'General',
      dueDatetime: localDateTime,
      completed: Boolean(
        reminder.completed,
      ),
    })

    setMessage('')
    setError('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  const handleToggleComplete = async (
    reminder,
  ) => {
    try {
      setError('')
      setMessage('')

      await apiPut(
        `/reminders/${reminder.id}`,
        {
          completed: !reminder.completed,
        },
      )

      setMessage(
        reminder.completed
          ? 'Reminder marked as active.'
          : 'Reminder marked as completed.',
      )

      await loadReminders()
    } catch (err) {
      console.error(
        'Could not update reminder:',
        err,
      )

      setError(
        err.message ||
          'Could not update the reminder.',
      )
    }
  }


  const handleDelete = async (
    reminderId,
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this reminder?',
      )

    if (!confirmed) {
      return
    }

    try {
      setError('')
      setMessage('')

      await apiDelete(
        `/reminders/${reminderId}`,
      )

      if (editingId === reminderId) {
        resetForm()
      }

      setMessage(
        'Reminder deleted successfully.',
      )

      await loadReminders()
    } catch (err) {
      console.error(
        'Could not delete reminder:',
        err,
      )

      setError(
        err.message ||
          'Could not delete the reminder.',
      )
    }
  }


  const formatDateTime = (value) => {
    if (!value) {
      return 'No due date'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return date.toLocaleString()
  }


  const isOverdue = (reminder) => {
    if (
      reminder.completed ||
      !reminder.dueDatetime
    ) {
      return false
    }

    const dueDate = new Date(
      reminder.dueDatetime,
    )

    return (
      !Number.isNaN(dueDate.getTime()) &&
      dueDate.getTime() < Date.now()
    )
  }


  return (
    <div className="reminders-page">

      <header className="reminders-header">

        <button
          type="button"
          className="reminders-back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>


        <h1>Reminders</h1>


        <p>
          Keep track of important activities,
          appointments, and daily tasks.
        </p>

      </header>


      {error && (
        <div className="reminders-message reminders-message--error">
          {error}
        </div>
      )}


      {message && (
        <div className="reminders-message reminders-message--success">
          {message}
        </div>
      )}


      <main className="reminders-content">

        {/* Add / Edit Form */}
        <section className="reminder-form-card">

          <h2>
            {editingId !== null
              ? 'Edit Reminder'
              : 'Add a Reminder'}
          </h2>


          <form
            className="reminder-form"
            onSubmit={handleSubmit}
          >

            <label>
              Title

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Family video call"
                maxLength={200}
              />
            </label>


            <label>
              Description

              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={handleChange}
                placeholder="What should be remembered?"
                rows={4}
                maxLength={5000}
              />
            </label>


            <label>
              Category

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="General">
                  General
                </option>

                <option value="Family">
                  Family
                </option>

                <option value="Appointment">
                  Appointment
                </option>

                <option value="Medication">
                  Medication
                </option>

                <option value="Activity">
                  Activity
                </option>

                <option value="Personal">
                  Personal
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </label>


            <label>
              Due Date & Time

              <input
                type="datetime-local"
                name="dueDatetime"
                value={
                  form.dueDatetime
                }
                onChange={handleChange}
              />
            </label>


            {editingId !== null && (
              <label className="reminder-checkbox-label">

                <input
                  type="checkbox"
                  name="completed"
                  checked={
                    form.completed
                  }
                  onChange={
                    handleChange
                  }
                />

                Mark as completed

              </label>
            )}


            <div className="reminder-form-actions">

              <button
                type="submit"
                className="reminder-primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Update Reminder'
                    : 'Save Reminder'}
              </button>


              {editingId !== null && (
                <button
                  type="button"
                  className="reminder-secondary-button"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>

        </section>


        {/* Reminder List */}
        <section className="reminder-list-section">

          <div className="reminder-list-header">

            <div>

              <h2>
                Saved Reminders
              </h2>

              <p>
                Your reminders are stored
                securely in your account.
              </p>

            </div>


            <span className="reminder-count">
              {reminders.length}{' '}

              {reminders.length === 1
                ? 'reminder'
                : 'reminders'}
            </span>

          </div>


          {loading ? (

            <div className="reminder-empty">
              Loading reminders...
            </div>

          ) : reminders.length === 0 ? (

            <div className="reminder-empty">
              No reminders have been
              saved yet.
            </div>

          ) : (

            <div className="reminder-list">

              {reminders.map(
                (reminder) => {

                  const overdue =
                    isOverdue(reminder)

                  return (
                    <article
                      className={`reminder-card ${
                        reminder.completed
                          ? 'reminder-card--completed'
                          : ''
                      } ${
                        overdue
                          ? 'reminder-card--overdue'
                          : ''
                      }`}
                      key={reminder.id}
                    >

                      <div className="reminder-card-header">

                        <div>

                          <h3>
                            {reminder.title}
                          </h3>


                          <span className="reminder-category">
                            {
                              reminder.category
                            }
                          </span>


                          {reminder.completed && (
                            <span className="reminder-status reminder-status--completed">
                              Completed
                            </span>
                          )}


                          {overdue && (
                            <span className="reminder-status reminder-status--overdue">
                              Overdue
                            </span>
                          )}

                        </div>


                        <time>
                          {formatDateTime(
                            reminder.dueDatetime,
                          )}
                        </time>

                      </div>


                      <p>
                        {
                          reminder.description
                        }
                      </p>


                      <div className="reminder-card-actions">

                        <button
                          type="button"
                          className="reminder-secondary-button"
                          onClick={() =>
                            handleToggleComplete(
                              reminder,
                            )
                          }
                        >
                          {reminder.completed
                            ? 'Mark Active'
                            : 'Mark Complete'}
                        </button>


                        <button
                          type="button"
                          className="reminder-secondary-button"
                          onClick={() =>
                            handleEdit(
                              reminder,
                            )
                          }
                        >
                          Edit
                        </button>


                        <button
                          type="button"
                          className="reminder-delete-button"
                          onClick={() =>
                            handleDelete(
                              reminder.id,
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </article>
                  )
                },
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  )
}


export default Reminders
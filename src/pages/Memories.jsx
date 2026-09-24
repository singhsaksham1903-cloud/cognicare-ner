import { useEffect, useState } from 'react'

import './Memories.css'

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
  memoryDate: '',
}


function Memories({ onBack }) {
  const [memories, setMemories] = useState([])

  const [form, setForm] =
    useState(EMPTY_FORM)

  const [editingId, setEditingId] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const [message, setMessage] =
    useState('')


  const loadMemories = async () => {
    try {
      setLoading(true)
      setError('')

      const data =
        await apiGet('/memories')

      setMemories(
        data.memories || [],
      )
    } catch (err) {
      console.error(
        'Could not load memories:',
        err,
      )

      setError(
        err.message ||
          'Could not load memories from the server.',
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadMemories()
  }, [])


  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }


  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }


  const handleSubmit = async (
    event,
  ) => {
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

      const isEditing =
        editingId !== null

      const payload = {
        title: form.title.trim(),
        description:
          form.description.trim(),
        category: form.category,
        memoryDate:
          form.memoryDate || null,
      }

      if (isEditing) {
        await apiPut(
          `/memories/${editingId}`,
          payload,
        )

        setMessage(
          'Memory updated successfully.',
        )
      } else {
        await apiPost(
          '/memories',
          payload,
        )

        setMessage(
          'Memory saved successfully.',
        )
      }

      resetForm()

      await loadMemories()
    } catch (err) {
      console.error(
        'Could not save memory:',
        err,
      )

      setError(
        err.message ||
          'Could not save the memory.',
      )
    } finally {
      setSaving(false)
    }
  }


  const handleEdit = (
    memory,
  ) => {
    setEditingId(memory.id)

    setForm({
      title:
        memory.title || '',

      description:
        memory.description || '',

      category:
        memory.category ||
        'General',

      memoryDate:
        memory.memoryDate || '',
    })

    setMessage('')
    setError('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }


  const handleDelete = async (
    memoryId,
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this memory?',
      )

    if (!confirmed) {
      return
    }

    try {
      setError('')
      setMessage('')

      await apiDelete(
        `/memories/${memoryId}`,
      )

      if (
        editingId === memoryId
      ) {
        resetForm()
      }

      setMessage(
        'Memory deleted successfully.',
      )

      await loadMemories()
    } catch (err) {
      console.error(
        'Could not delete memory:',
        err,
      )

      setError(
        err.message ||
          'Could not delete the memory.',
      )
    }
  }


  const formatDate = (
    value,
  ) => {
    if (!value) {
      return 'No date provided'
    }

    const parsedDate =
      new Date(value)

    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      return value
    }

    return parsedDate.toLocaleDateString()
  }


  return (
    <div className="memories-page">

      <header className="memories-header">

        <button
          type="button"
          className="memories-back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>


        <h1>
          Memories
        </h1>


        <p>
          Save important moments,
          stories, and people you
          want to remember.
        </p>

      </header>


      {error && (
        <div className="memories-message memories-message--error">
          {error}
        </div>
      )}


      {message && (
        <div className="memories-message memories-message--success">
          {message}
        </div>
      )}


      <main className="memories-content">

        {/* Add / Edit Form */}
        <section className="memory-form-card">

          <h2>
            {editingId !== null
              ? 'Edit Memory'
              : 'Add a Memory'}
          </h2>


          <form
            className="memory-form"
            onSubmit={handleSubmit}
          >

            <label>
              Title

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Family trip to Agra"
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
                placeholder="Write about this memory..."
                rows={5}
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

                <option value="Friends">
                  Friends
                </option>

                <option value="Travel">
                  Travel
                </option>

                <option value="Celebration">
                  Celebration
                </option>

                <option value="Childhood">
                  Childhood
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </label>


            <label>
              Memory Date

              <input
                type="date"
                name="memoryDate"
                value={
                  form.memoryDate
                }
                onChange={handleChange}
              />
            </label>


            <div className="memory-form-actions">

              <button
                type="submit"
                className="memory-primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Update Memory'
                    : 'Save Memory'}
              </button>


              {editingId !== null && (
                <button
                  type="button"
                  className="memory-secondary-button"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>

        </section>


        {/* Memory List */}
        <section className="memory-list-section">

          <div className="memory-list-header">

            <div>

              <h2>
                Saved Memories
              </h2>

              <p>
                Your memories are
                stored securely in
                your account.
              </p>

            </div>


            <span className="memory-count">
              {memories.length}{' '}

              {memories.length === 1
                ? 'memory'
                : 'memories'}
            </span>

          </div>


          {loading ? (

            <div className="memory-empty">
              Loading memories...
            </div>

          ) : memories.length === 0 ? (

            <div className="memory-empty">
              No memories have been
              saved yet.
            </div>

          ) : (

            <div className="memory-list">

              {memories.map(
                (memory) => (
                  <article
                    className="memory-card"
                    key={memory.id}
                  >

                    <div className="memory-card-header">

                      <div>

                        <h3>
                          {memory.title}
                        </h3>


                        <span className="memory-category">
                          {memory.category}
                        </span>

                      </div>


                      <time>
                        {formatDate(
                          memory.memoryDate,
                        )}
                      </time>

                    </div>


                    <p>
                      {memory.description}
                    </p>


                    <div className="memory-card-actions">

                      <button
                        type="button"
                        className="memory-secondary-button"
                        onClick={() =>
                          handleEdit(
                            memory,
                          )
                        }
                      >
                        Edit
                      </button>


                      <button
                        type="button"
                        className="memory-delete-button"
                        onClick={() =>
                          handleDelete(
                            memory.id,
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </article>
                ),
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  )
}


export default Memories
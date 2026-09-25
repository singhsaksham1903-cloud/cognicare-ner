import './LanguageSelector.css'

function LanguageSelector({
  language,
  onChange,
  label = 'Language',
}) {
  return (
    <div className="language-selector">
      <label htmlFor="language-select">
        {label}
      </label>

      <select
        id="language-select"
        value={language}
        onChange={(event) =>
          onChange(event.target.value)
        }
        aria-label={label}
      >
        <option value="en">
          English
        </option>

        <option value="hi">
          हिन्दी
        </option>

        <option value="as">
          অসমীয়া
        </option>
      </select>
    </div>
  )
}

export default LanguageSelector
import { logout } from '../utils/auth'
import './UserBar.css'

function UserBar({
  user,
  onLogout,
  text,
}) {
  const handleLogout = () => {
    logout()
    onLogout()
  }

  const roleLabel =
    user?.role === 'caregiver'
      ? text.caregiver
      : text.elderlyUser

  return (
    <div className="user-bar">
      <div className="user-bar-info">
        <div className="user-bar-avatar">
          {user?.full_name
            ? user.full_name
                .charAt(0)
                .toUpperCase()
            : '?'}
        </div>

        <div>
          <strong>
            {user?.full_name}
          </strong>

          <span>
            {roleLabel}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="user-bar-logout"
        onClick={handleLogout}
      >
        {text.logout}
      </button>
    </div>
  )
}

export default UserBar
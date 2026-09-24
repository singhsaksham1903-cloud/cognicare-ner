import {
  apiPost,
} from './api'


const PERFORMANCE_KEY =
  'cognicare-performance-history'


export function getPerformanceHistory() {
  const savedData =
    localStorage.getItem(PERFORMANCE_KEY)

  if (!savedData) {
    return []
  }

  try {
    const parsedData =
      JSON.parse(savedData)

    return Array.isArray(parsedData)
      ? parsedData
      : []
  } catch {
    return []
  }
}


export async function savePerformanceResult(
  result,
) {
  const history =
    getPerformanceHistory()

  const localResult = {
    id: Date.now(),
    date: new Date().toISOString(),
    ...result,
  }

  const updatedHistory = [
    localResult,
    ...history,
  ].slice(0, 50)

  localStorage.setItem(
    PERFORMANCE_KEY,
    JSON.stringify(updatedHistory),
  )

  try {
    const backendResult =
      await apiPost(
        '/game-sessions',
        result,
      )

    console.log(
      'Game result saved to PostgreSQL:',
      backendResult,
    )

    window.dispatchEvent(
      new CustomEvent(
        'cognicare:performance-updated',
      ),
    )

    return backendResult

  } catch (error) {
    console.warn(
      'Backend unavailable. Result remains saved locally.',
      error,
    )

    window.dispatchEvent(
      new CustomEvent(
        'cognicare:performance-updated',
      ),
    )

    return {
      local: true,
      result: localResult,
    }
  }
}


export function clearPerformanceHistory() {
  localStorage.removeItem(
    PERFORMANCE_KEY,
  )
}
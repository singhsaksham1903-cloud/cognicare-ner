import { useEffect, useState } from 'react'

function VoiceReadAloud({
    text,
    language = 'en-IN',
    label = 'Read Aloud',
    stopLabel = 'Stop',
}) {
    const [isSpeaking, setIsSpeaking] =
        useState(false)

    useEffect(() => {
        const handleSpeechEnd = () => {
            setIsSpeaking(false)
        }

        window.speechSynthesis?.addEventListener(
            'end',
            handleSpeechEnd,
        )

        return () => {
            window.speechSynthesis?.removeEventListener(
                'end',
                handleSpeechEnd,
            )

            window.speechSynthesis?.cancel()
        }
    }, [])

    const speak = () => {
        if (!text || !window.speechSynthesis) {
            return
        }

        window.speechSynthesis.cancel()

        const utterance =
            new SpeechSynthesisUtterance(text)

        utterance.lang = language
        utterance.rate = 0.85
        utterance.pitch = 1
        utterance.volume = 1

        utterance.onstart = () => {
            setIsSpeaking(true)
        }

        utterance.onend = () => {
            setIsSpeaking(false)
        }

        utterance.onerror = () => {
            setIsSpeaking(false)
        }

        window.speechSynthesis.speak(utterance)
    }

    const stopSpeaking = () => {
        window.speechSynthesis?.cancel()
        setIsSpeaking(false)
    }

    if (
        typeof window === 'undefined' ||
        !('speechSynthesis' in window)
    ) {
        return null
    }

    return (
        <button
            type="button"
            className="voice-read-aloud"
            onClick={
                isSpeaking
                    ? stopSpeaking
                    : speak
            }
            aria-label={
                isSpeaking
                    ? stopLabel
                    : label
            }
        >
            {isSpeaking
                ? `🔇 ${stopLabel}`
                : `🔊 ${label}`}
        </button>
    )
}

export default VoiceReadAloud
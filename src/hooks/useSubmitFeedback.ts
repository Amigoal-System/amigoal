
'use client';

import { useEffect, useState } from 'react';

export const useSubmitFeedback = () => {
  const [feedback, setFeedback] = useState<{ happiness: number; feedback: string } | null>(null)
  const [isLoading, setLoadingState] = useState(false)
  const [error, setError] = useState<{ error: any } | null>(null)
  const [isSent, setRequestState] = useState(false)

  const submitFeedback = (feedback: { happiness: number; feedback: string }) =>
    new Promise((res) => setTimeout(() => res(feedback), 1000))

  useEffect(() => {
    if (feedback) {
      setLoadingState(true)
      setRequestState(false)

      submitFeedback(feedback)
        .then(() => {
          setRequestState(true)
          setError(null)
        })
        .catch(() => {
          setRequestState(false)
          setError({ error: 'some error' })
        })
        .finally(() => setLoadingState(false))
    }
  }, [feedback])

  return {
    submitFeedback: (happiness: number, feedback: string) => setFeedback({ happiness, feedback }),
    isLoading,
    error,
    isSent
  }
}

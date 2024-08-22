'use client'

import type { Evaluation } from '@latitude-data/core/browser'
import { useSession, useToast } from '@latitude-data/web-ui'
import { createEvaluationAction } from '$/actions/evaluations/create'
import { fetchEvaluationsAction } from '$/actions/evaluations/fetch'
import { updateEvaluationContentAction } from '$/actions/evaluations/updateContent'
import useLatitudeAction from '$/hooks/useLatitudeAction'
import useSWR, { SWRConfiguration } from 'swr'

export default function useEvaluations(
  opts: SWRConfiguration & {
    onSuccessCreate?: (evaluation: Evaluation) => void
  } = {},
) {
  const { workspace } = useSession()

  const { onSuccessCreate } = opts
  const { toast } = useToast()

  const {
    data = [],
    mutate,
    isLoading,
    error: swrError,
  } = useSWR<Evaluation[]>(
    ['evaluations', workspace.id],
    async () => {
      const [data, error] = await fetchEvaluationsAction()

      if (error) {
        toast({
          title: 'Error fetching provider logs',
          description: error.formErrors?.[0] || error.message,
          variant: 'destructive',
        })
        throw error
      }

      return data
    },
    opts,
  )

  const { execute: createEvaluation, isPending: isCreating } =
    useLatitudeAction(createEvaluationAction, {
      onSuccess: async ({ data: newEvaluation }) => {
        mutate([...(data ?? []), newEvaluation])
        onSuccessCreate?.(newEvaluation)

        toast({
          title: 'Success',
          description: `New Evaluation ${newEvaluation.name} created`,
        })
      },
    })

  const { execute: updateEvaluation, isPending: isUpdating } =
    useLatitudeAction(updateEvaluationContentAction, {
      onSuccess: ({ data: newEval }) => {
        const prevEvaluations = data
        mutate(
          prevEvaluations.map((prevEval: Evaluation) =>
            prevEval.uuid === newEval.uuid ? newEval : prevEval,
          ),
        )
      },
    })

  return {
    data,
    isLoading,
    createEvaluation,
    isCreating,
    updateEvaluation,
    isUpdating,
    error: swrError,
  }
}

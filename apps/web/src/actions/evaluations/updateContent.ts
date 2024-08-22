'use server'

import { updateEvaluation } from '@latitude-data/core'
import { z } from 'zod'

import { authProcedure } from '../procedures'

export const updateEvaluationContentAction = authProcedure
  .createServerAction()
  .input(
    z.object({
      evaluationUuid: z.string(),
      prompt: z.string(),
    }),
    { type: 'json' },
  )
  .handler(async ({ input, ctx }) => {
    const result = await updateEvaluation({
      workspaceId: ctx.workspace.id,
      evaluationUuid: input.evaluationUuid,
      prompt: input.prompt,
    })

    return result.unwrap()
  })

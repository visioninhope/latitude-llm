import { Evaluation } from '$core/browser'
import { database } from '$core/client'
import { Result, Transaction, TypedResult } from '$core/lib'
import { BadRequestError, NotFoundError } from '$core/lib/errors'
import { EvaluationsRepository } from '$core/repositories'
import { evaluations } from '$core/schema'
import { eq } from 'drizzle-orm'

export async function updateEvaluation(
  {
    workspaceId,
    evaluationUuid,
    name,
    description,
    prompt,
  }: {
    workspaceId: number
    evaluationUuid: string
    name?: string
    description?: string
    prompt?: string
  },
  trx = database,
): Promise<TypedResult<Evaluation, Error>> {
  return await Transaction.call(async (tx) => {
    const updatedDocData = Object.fromEntries(
      Object.entries({ name, description, prompt }).filter(
        ([_, v]) => v !== undefined,
      ),
    )

    if (Object.keys(updatedDocData).length === 0) {
      return Result.error(new BadRequestError('No data to update'))
    }

    const evaluationsScope = new EvaluationsRepository(workspaceId, tx)
    const evaluation = await evaluationsScope
      .findByUuid(evaluationUuid)
      .then((r) => r.unwrap())

    const updatedEvals = await tx
      .update(evaluations)
      .set(updatedDocData)
      .where(eq(evaluations.id, evaluation.id))
      .returning()

    if (updatedEvals.length === 0) {
      return Result.error(new NotFoundError('Evaluation does not exist'))
    }

    return Result.ok(updatedEvals[0]!)
  }, trx)
}

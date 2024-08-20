import { database } from '$core/client'
import { Result, Transaction } from '$core/lib'
import { EvaluationsRepository } from '$core/repositories'
import { evaluations } from '$core/schema'

type Props = {
  workspaceId: number
  name: string
  description: string
  prompt: string
}
export async function createEvaluation(
  { workspaceId, name, description, prompt }: Props,
  db = database,
) {
  const evaluationsScope = new EvaluationsRepository(workspaceId, db)
  const existsEvaluation = await evaluationsScope.findByName(name)
  if (existsEvaluation.ok) {
    return Result.error(
      new Error(
        'An evaluation with the same name already exists in this workspace',
      ),
    )
  }

  return await Transaction.call(async (tx) => {
    const result = await tx
      .insert(evaluations)
      .values({
        workspaceId,
        name,
        description,
        prompt,
        templateId: null,
      })
      .returning()

    return Result.ok(result[0]!)
  }, db)
}

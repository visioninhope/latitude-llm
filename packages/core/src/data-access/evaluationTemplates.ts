import {
  database,
  evaluationTemplateCategories,
  evaluationTemplates,
  NotFoundError,
  Result,
  TypedResult,
} from '@latitude-data/core'
import { EvaluationTemplate } from '$core/browser'
import { asc, eq, getTableColumns } from 'drizzle-orm'

export type EvaluationTemplateWithCategory = EvaluationTemplate & {
  category: string
}

export async function findAllEvaluationTemplates(): Promise<
  TypedResult<EvaluationTemplateWithCategory[], Error>
> {
  const result = await database
    .select({
      ...getTableColumns(evaluationTemplates),
      category: evaluationTemplateCategories.name,
    })
    .from(evaluationTemplates)
    .innerJoin(
      evaluationTemplateCategories,
      eq(evaluationTemplates.categoryId, evaluationTemplateCategories.id),
    )
    .orderBy(
      asc(evaluationTemplateCategories.name),
      asc(evaluationTemplates.name),
    )
  return Result.ok(result)
}

export async function findEvaluationTemplateById(
  id: number,
): Promise<TypedResult<EvaluationTemplate, Error>> {
  const result = await database.query.evaluationTemplates.findFirst({
    where: eq(evaluationTemplates.id, id),
  })

  if (!result) {
    return Result.error(new NotFoundError('Evaluation template not found'))
  }

  return Result.ok(result)
}

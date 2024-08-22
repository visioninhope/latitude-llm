import {
  Chain,
  ConversationMetadata,
  readMetadata,
} from '@latitude-data/compiler'
import { DocumentLog, Evaluation } from '$core/browser'
import { LatitudeError, Result, TypedResult } from '$core/lib'
import { ProviderLogsRepository } from '$core/repositories'

import { PARAMETERS_FROM_LOG } from './constants'

export async function buildEvaluationChain(
  evaluation: Evaluation,
  documentLog: DocumentLog,
): Promise<TypedResult<Chain, LatitudeError>> {
  const providerLogScope = new ProviderLogsRepository(evaluation.workspaceId)
  const providerLogResult = await providerLogScope.findLastByDocumentLogUuid(
    documentLog.uuid,
  )
  if (providerLogResult.error) return providerLogResult
  const providerLog = providerLogResult.value

  const parameters = Object.fromEntries(
    Object.entries(PARAMETERS_FROM_LOG).map(([name, getValueFromLog]) => {
      return [name, getValueFromLog({ documentLog, providerLog })]
    }),
  )

  const chain = new Chain({ prompt: evaluation.prompt, parameters })
  return Result.ok(chain)
}

export async function readMetadataFromEvaluation(
  evaluation: Evaluation,
): Promise<TypedResult<ConversationMetadata, LatitudeError>> {
  const metadata = await readMetadata({
    prompt: evaluation.prompt,
    withParameters: Object.keys(PARAMETERS_FROM_LOG),
  })
  return Result.ok(metadata)
}

export { PARAMETERS_FROM_LOG }

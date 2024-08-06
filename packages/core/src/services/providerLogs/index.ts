import { Message, ToolCall } from '@latitude-data/compiler'
import {
  database,
  providerLogs,
  Result,
  Transaction,
} from '@latitude-data/core'
import { ProviderLog } from '$core/browser'

import { touchProviderApiKey } from '../providerApiKeys/touch'

export type LogProviderGenerationProps = {
  logUuid: string
  providerId: number
  model: string
  config: Record<string, unknown>
  messages: Message[]
  responseText: string
  toolCalls?: ToolCall[]
  tokens: number
  duration: number
}

export async function logProviderGeneration(
  {
    logUuid,
    providerId,
    model,
    config,
    messages,
    responseText,
    toolCalls,
    tokens,
    duration,
  }: LogProviderGenerationProps,
  db = database,
) {
  return Transaction.call<ProviderLog>(async (trx) => {
    const inserts = await trx
      .insert(providerLogs)
      .values({
        uuid: logUuid,
        providerId,
        model,
        config,
        messages,
        responseText,
        toolCalls,
        tokens,
        duration,
      })
      .returning()

    const log = inserts[0]!
    await touchProviderApiKey(providerId, trx)
    return Result.ok(log)
  }, db)
}

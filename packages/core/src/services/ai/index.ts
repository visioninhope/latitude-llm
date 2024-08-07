import { createAnthropic } from '@ai-sdk/anthropic'
import { azure, createAzure } from '@ai-sdk/azure'
import { createMistral } from '@ai-sdk/mistral'
import { createOpenAI } from '@ai-sdk/openai'
import { OpenAICompletionModelId } from '@ai-sdk/openai/internal'
import { Message } from '@latitude-data/compiler'
import { ProviderApiKey, Providers } from '$core/browser'
import {
  CallWarning,
  CompletionTokenUsage,
  CoreMessage,
  FinishReason,
  jsonSchema,
  streamObject,
  streamText,
} from 'ai'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import { LogProviderGenerationProps } from '../providerLogs'
import { JSONSchema7 } from 'json-schema'

export type FinishCallbackEvent = {
  finishReason: FinishReason
  usage: CompletionTokenUsage
  text: string
  toolCalls?:
    | {
        type: 'tool-call'
        toolCallId: string
        toolName: string
        args: any
      }[]
    | undefined
  toolResults?: never[] | undefined
  rawResponse?: {
    headers?: Record<string, string>
  }
  warnings?: CallWarning[]
}
type FinishCallback = (event: FinishCallbackEvent) => void

export type GenerationConfig = {
  model: string
  schema?: JSONSchema7
  azure?: { resourceName: string }
} & Record<string, unknown>

export type Config = GenerationConfig & {
  provider: string
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1'

function createProvider({
  provider,
  apiKey,
  config,
}: {
  provider: Providers
  apiKey: string
  config?: GenerationConfig
}) {
  switch (provider) {
    case Providers.OpenAI:
      return createOpenAI({
        apiKey,
        compatibility: 'strict', // Needed for OpenAI to return token usage
      })
    case Providers.Groq:
      return createOpenAI({
        apiKey,
        compatibility: 'compatible',
        baseURL: GROQ_API_URL,
      })
    case Providers.Anthropic:
      return createAnthropic({
        apiKey,
      })
    case Providers.Mistral:
      return createMistral({
        apiKey,
      })
    case Providers.Azure:
      return createAzure({
        apiKey,
        ...(config?.azure ?? {}),
      })
    default:
      throw new Error(`Provider ${provider} not supported`)
  }
}

export async function ai(
  {
    provider: apiProvider,
    prompt,
    messages,
    config: _config,
  }: {
    provider: ProviderApiKey
    config: GenerationConfig
    messages: Message[]
    prompt?: string
  },
  {
    logHandler,
    onFinish,
  }: {
    logHandler: (log: LogProviderGenerationProps) => void
    onFinish?: FinishCallback
  },
) {
  const startTime = Date.now()
  const { provider, token: apiKey, id: providerId } = apiProvider

  const config = {
    ..._config,
    schema: _config.schema ? jsonSchema(_config.schema) : undefined,
    structuredOutputs: _config.schema !== undefined,
  } as GenerationConfig
  
  const model = createProvider({ provider, apiKey, config })(config.model)

  const props = {
    ...config,
    model,
    prompt,
    messages: messages as CoreMessage[],
    onFinish: (event: FinishCallbackEvent) => {
      logHandler({
        logUuid: uuidv4(),
        providerId,
        model: config.model,
        config,
        messages,
        responseText: event.text,
        toolCalls: event.toolCalls?.map((t) => ({
          id: t.toolCallId,
          name: t.toolName,
          arguments: t.args,
        })),
        tokens: event.usage.totalTokens,
        duration: Date.now() - startTime,
      })

      onFinish?.(event)
    }
  }

  if (config.structuredOutputs) return streamObject(props)
  return streamText(props)
}

export function validateConfig(config: Record<string, unknown>): Config {
  const configSchema = z
    .object({
      model: z.string(),
      provider: z.string(),
      azure: z
        .object({
          resourceName: z.string(),
        })
        .optional(),
    })
    .catchall(z.unknown())

  return configSchema.parse(config)
}

import {
  logProviderGeneration,
  LogProviderGenerationProps,
} from '@latitude-data/core'
import { Job } from 'bullmq'

export type LogProviderGenerationJobData = LogProviderGenerationProps

export const logProviderGenerationJob = async (
  job: Job<LogProviderGenerationJobData>,
) => {
  await logProviderGeneration(job.data).then((r) => r.unwrap())
}

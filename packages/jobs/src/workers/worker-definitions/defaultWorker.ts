import { Jobs, Queues } from '$jobs/constants'
import {
  logProviderGenerationJob,
  LogProviderGenerationJobData,
} from '$jobs/job-definitions/providerLogs/createJob'
import { Job, Processor } from 'bullmq'

const processor: Processor = async (job) => {
  switch (job.name) {
    case Jobs.logProviderGenerationJob:
      return await logProviderGenerationJob(
        job as Job<LogProviderGenerationJobData>,
      )
    default:
    // do nothing
  }
}

export const defaultWorker = {
  processor,
  queueName: Queues.defaultQueue,
}

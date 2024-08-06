import { Jobs, Queues } from '$jobs/constants'

import { LogProviderGenerationJobData } from './providerLogs/createJob'

type JobData<J extends Jobs> = J extends Jobs.logProviderGenerationJob
  ? LogProviderGenerationJobData
  : never

type JobSpec<J extends Jobs = Jobs> = {
  name: J
  data: JobData<J>
}

export type JobDefinition = {
  [Queues.defaultQueue]: {
    [Jobs.logProviderGenerationJob]: JobSpec<Jobs.logProviderGenerationJob>
  }
}

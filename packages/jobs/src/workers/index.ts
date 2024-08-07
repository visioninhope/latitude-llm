import { Worker } from 'bullmq'
import { Redis } from 'ioredis'

import { defaultWorker } from './worker-definitions/defaultWorker'

const WORKER_OPTS = {
  concurrency: 5,
  autorun: false,
  removeOnComplete: { count: 0 },
  removeOnFail: { count: 0 },
}

const WORKERS = [defaultWorker]

export default function startWorkers({ connection }: { connection: Redis }) {
  return WORKERS.map((w) => {
    const worker = new Worker(w.queueName, w.processor, {
      ...WORKER_OPTS,
      connection,
    })
    worker.run()
    return worker
  })
}

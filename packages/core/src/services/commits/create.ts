import {
  Commit,
  commits,
  Database,
  database,
  Result,
  Transaction,
} from '@latitude-data/core'

export default async function createCommit({
  commit,
  db = database,
}: {
  commit: Omit<Partial<Commit>, 'id'>
  db?: Database
}) {
  return Transaction.call<Commit>(async (tx) => {
    const result = await tx
      .insert(commits)
      .values({ projectId: commit.projectId!, title: commit.title })
      .returning()
    const createdCommit = result[0]

    return Result.ok(createdCommit!)
  }, db)
}

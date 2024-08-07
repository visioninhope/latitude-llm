import type { Commit, DocumentVersion } from '$core/browser'
import { findWorkspaceFromCommit } from '$core/data-access'
import { Result, Transaction, TypedResult } from '$core/lib'
import { BadRequestError } from '$core/lib/errors'
import { DocumentVersionsRepository } from '$core/repositories'
import { documentVersions } from '$core/schema'
import { eq } from 'drizzle-orm'

export const sanitizeDocumentPath = <T extends string | undefined>(
  path: T,
): T => {
  if (path === undefined) return path
  if (path.startsWith('/')) return path
  return `/${path}` as T
}

export async function createNewDocument({
  commit,
  path: inputPath,
  content,
}: {
  commit: Commit
  path: string
  content?: string
}): Promise<TypedResult<DocumentVersion, Error>> {
  return await Transaction.call(async (tx) => {
    if (commit.mergedAt !== null) {
      return Result.error(new BadRequestError('Cannot modify a merged commit'))
    }

    const workspace = await findWorkspaceFromCommit(commit, tx)
    const docsScope = new DocumentVersionsRepository(workspace!.id, tx)
    const path = sanitizeDocumentPath(inputPath)

    const currentDocs = await docsScope
      .getDocumentsAtCommit(commit)
      .then((r) => r.unwrap())
    if (currentDocs.find((d) => d.path === path)) {
      return Result.error(
        new BadRequestError('A document with the same path already exists'),
      )
    }

    const newDoc = await tx
      .insert(documentVersions)
      .values({
        commitId: commit.id,
        path,
        content: content ?? '',
      })
      .returning()

    // Invalidate all resolvedContent for this commit
    await tx
      .update(documentVersions)
      .set({ resolvedContent: null })
      .where(eq(documentVersions.commitId, commit.id))

    return Result.ok(newDoc[0]!)
  })
}

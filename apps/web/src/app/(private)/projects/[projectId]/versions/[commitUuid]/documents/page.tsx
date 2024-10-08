import { Text } from '@latitude-data/web-ui'
import { getDocumentsAtCommitAction } from '$/actions/documents/getDocumentsAtCommitAction'
import { findCommitCached } from '$/app/(private)/_data-access'
import { ROUTES } from '$/services/routes'
import { redirect } from 'next/navigation'

import DocumentsLayout from '../_components/DocumentsLayout'

export default async function DocumentsPage({
  params,
}: {
  params: { projectId: string; commitUuid: string }
}) {
  const projectId = Number(params.projectId)
  const commitUuid = params.commitUuid
  const commit = await findCommitCached({
    projectId,
    uuid: commitUuid,
  })
  const [documents, error] = await getDocumentsAtCommitAction({
    projectId,
    commitUuid,
  })
  if (error) throw error
  if (documents && documents.length > 0) {
    return redirect(
      ROUTES.projects
        .detail({ id: projectId })
        .commits.detail({ uuid: params.commitUuid })
        .documents.detail({ uuid: documents[0]?.documentUuid! }).root,
    )
  }

  return (
    <DocumentsLayout projectId={projectId} commitUuid={commitUuid}>
      <div className='flex-1 flex flex-row justify-center py-6 pr-4 h-full'>
        <div className='rounded-lg flex flex-col flex-1 gap-4 p-4 items-center justify-center bg-secondary'>
          <Text.H5M>
            {commit.mergedAt
              ? '👈 There are no prompts in this version, to get started create a new version from the sidebar.'
              : '👈 There are no prompts in this version, to get started create one from the sidebar.'}
          </Text.H5M>
        </div>
      </div>
    </DocumentsLayout>
  )
}

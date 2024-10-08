import { addMessagesAction } from '$/actions/sdk/addMessagesAction'
import { runDocumentAction } from '$/actions/sdk/runDocumentAction'
import {
  findCommitCached,
  getDocumentByUuidCached,
  getDocumentsAtCommitCached,
} from '$/app/(private)/_data-access'

import DocumentEditor from './_components/DocumentEditor/Editor'

export default async function DocumentPage({
  params,
}: {
  params: { projectId: string; commitUuid: string; documentUuid: string }
}) {
  const projectId = Number(params.projectId)
  const commitUuid = params.commitUuid
  const commit = await findCommitCached({ projectId, uuid: commitUuid })
  const document = await getDocumentByUuidCached({
    documentUuid: params.documentUuid,
    projectId,
    commitUuid,
  })
  const documents = await getDocumentsAtCommitCached({ commit })

  return (
    <DocumentEditor
      runDocumentAction={runDocumentAction}
      addMessagesAction={addMessagesAction}
      documents={documents}
      document={document}
    />
  )
}

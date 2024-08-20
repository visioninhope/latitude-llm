import { ReactNode } from 'react'

import { AppLayout } from '$/components/layouts'
import { getCurrentUser } from '$/services/auth/getCurrentUser'
import { ROUTES } from '$/services/routes'

import { getFirstProjectCached } from '../_data-access'
import { NAV_LINKS } from '../_lib/constants'

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getCurrentUser()
  const project = await getFirstProjectCached({
    workspaceId: session.workspace.id,
  })
  const projectUrl = ROUTES.projects.detail({ id: project.id }).root
  const sectionLinks = [
    { label: 'Projects', href: projectUrl },
    { label: 'Evaluations', href: ROUTES.evaluations.root },
    { label: 'Settings', href: ROUTES.settings.root },
  ]
  return (
    <AppLayout
      navigationLinks={NAV_LINKS}
      currentUser={session.user}
      breadcrumbs={[{ name: session.workspace.name }, { name: 'Evaluations' }]}
      sectionLinks={sectionLinks}
    >
      {children}
    </AppLayout>
  )
}

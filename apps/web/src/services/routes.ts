import { HEAD_COMMIT } from '@latitude-data/core/browser'

const ROOT_PATH = '/'
const PROJECTS_PATH = `${ROOT_PATH}projects`

export enum DocumentRoutes {
  editor = 'editor',
  logs = 'logs',
}

export enum EvaluationRoutes {
  history = 'history',
  editor = 'editor',
}

export const ROUTES = {
  root: ROOT_PATH,
  settings: {
    root: '/settings',
  },
  evaluations: {
    root: '/evaluations',
    detail: ({ uuid }: { uuid: string }) => {
      const root = `${ROUTES.evaluations.root}/${uuid}`
      return {
        root,
        [EvaluationRoutes.history]: { root },
        [EvaluationRoutes.editor]: {
          root: `${root}/editor`,
        },
      }
    },
  },
  projects: {
    root: PROJECTS_PATH,
    detail: ({ id }: { id: number }) => {
      const root = `${PROJECTS_PATH}/${id}`
      const rootCommits = `${root}/versions`
      return {
        root,
        commits: {
          root: rootCommits,
          latest: `${rootCommits}/${HEAD_COMMIT}`,
          detail: ({ uuid }: { uuid: string }) => {
            const root = `${rootCommits}/${uuid}`
            const rootDocuments = `${root}/documents`
            return {
              root,
              documents: {
                root: rootDocuments,
                detail: ({ uuid }: { uuid: string }) => {
                  const root = `${rootDocuments}/${uuid}`
                  return {
                    root,
                    [DocumentRoutes.editor]: { root },
                    [DocumentRoutes.logs]: {
                      root: `${root}/${DocumentRoutes.logs}`,
                    },
                  }
                },
              },
            }
          },
        },
      }
    },
  },
  auth: {
    setup: '/setup',
    login: '/login',
  },
} as const

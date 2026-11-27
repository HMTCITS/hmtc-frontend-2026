export const galleryKeys = {
  all: ['galleries'] as const,
  lists: () => [...galleryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...galleryKeys.lists(), filters] as const,
  details: () => [...galleryKeys.all, 'detail'] as const,
  detail: (id: number) => [...galleryKeys.details(), id] as const,
} as const;

export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
} as const;

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...userKeys.lists(), filters ?? {}] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  requests: (id: string) => [...userKeys.detail(id), 'requests'] as const,
  requestsList: (id: string, filters?: Record<string, unknown>) =>
    [...userKeys.requests(id), filters ?? {}] as const,
} as const;

export const requestKeys = {
  all: ['requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...requestKeys.lists(), filters ?? {}] as const,
  details: () => [...requestKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestKeys.details(), id] as const,
} as const;

export const uploadKeys = {
  all: ['uploads'] as const,
  lists: () => [...uploadKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...uploadKeys.lists(), filters ?? {}] as const,
  details: () => [...uploadKeys.all, 'detail'] as const,
  detail: (id: string) => [...uploadKeys.details(), id] as const,
} as const;

export const cmsKeys = {
  all: ['cms'] as const,
  session: () => [...cmsKeys.all, 'session'] as const,
  departments: () => [...cmsKeys.all, 'departments'] as const,
  prokers: (query?: Record<string, unknown>) =>
    [...cmsKeys.all, 'prokers', query ?? {}] as const,
  pages: () => [...cmsKeys.all, 'pages'] as const,
  pageLists: () => [...cmsKeys.pages(), 'list'] as const,
  pageList: (query?: Record<string, unknown>) =>
    [...cmsKeys.pageLists(), query ?? {}] as const,
  pageDetails: () => [...cmsKeys.pages(), 'detail'] as const,
  pageDetail: (id: string) => [...cmsKeys.pageDetails(), id] as const,
  revisions: (id: string) => [...cmsKeys.pageDetail(id), 'revisions'] as const,
  previewGrants: (id: string) =>
    [...cmsKeys.pageDetail(id), 'preview-grants'] as const,
} as const;

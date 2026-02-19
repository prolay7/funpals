// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { DataProvider, GetListParams, GetOneParams, CreateParams, UpdateParams, DeleteParams, RaRecord } from 'react-admin';
import { apiClient } from '@/api/client';

/** Map react-admin resource names → API base paths */
const RESOURCE_MAP: Record<string, string> = {
  users:      '/admin/users',
  activities: '/admin/activities',
  materials:  '/admin/materials',
  groups:     '/groups/public',
  meetings:   '/meetings/live',
  posts:      '/posts',
  reports:    '/admin/users', // reports piggy-back until dedicated endpoint
};

function apiPath(resource: string): string {
  return RESOURCE_MAP[resource] ?? `/${resource}`;
}

/** Extract data array + total from various API response shapes */
function unwrap(response: { data: unknown }): { data: unknown[]; total: number } {
  const body = response.data as Record<string, unknown>;
  const rows: unknown[] = Array.isArray(body) ? body
    : Array.isArray(body.data) ? (body.data as unknown[])
    : Array.isArray(body.items) ? (body.items as unknown[])
    : [];
  const total: number = typeof body.total === 'number' ? body.total : rows.length;
  return { data: rows, total };
}

// Use `any` casts — react-admin's DataProvider generics are strict but
// our runtime shapes are always compatible at the RaRecord level (id field).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dataProvider: DataProvider = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getList: async (resource: string, params: GetListParams): Promise<any> => {
    const { page = 1, perPage = 25 } = params.pagination ?? {};
    const { field = 'id', order = 'ASC' } = params.sort ?? {};
    const query: Record<string, unknown> = {
      limit: perPage,
      offset: (page - 1) * perPage,
      sort: field,
      order,
      ...params.filter,
    };
    if (params.filter?.q) { delete query.q; query.search = params.filter.q; }
    const res = await apiClient.get(apiPath(resource), { params: query });
    const { data, total } = unwrap(res);
    return { data: data as RaRecord[], total };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getOne: async (resource: string, params: GetOneParams): Promise<any> => {
    const path = resource === 'users' ? `/users/${params.id}` : `${apiPath(resource)}/${params.id}`;
    const res = await apiClient.get(path);
    const body = res.data as Record<string, unknown>;
    return { data: (body.data ?? body) as RaRecord };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMany: async (resource: string, params): Promise<any> => {
    const results = await Promise.all(
      params.ids.map((id) => apiClient.get(`${apiPath(resource)}/${id}`).then((r) => {
        const b = r.data as Record<string, unknown>;
        return (b.data ?? b) as RaRecord;
      })),
    );
    return { data: results };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getManyReference: async (resource: string, params): Promise<any> => {
    const res = await apiClient.get(apiPath(resource), {
      params: { [params.target]: params.id, limit: 100 },
    });
    const { data, total } = unwrap(res);
    return { data: data as RaRecord[], total };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: async (resource: string, params: CreateParams): Promise<any> => {
    const res = await apiClient.post(apiPath(resource), params.data);
    const body = res.data as Record<string, unknown>;
    return { data: (body.data ?? body) as RaRecord };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: async (resource: string, params: UpdateParams): Promise<any> => {
    let path = `${apiPath(resource)}/${params.id}`;
    let payload = params.data;
    if (resource === 'users' && (payload as Record<string, unknown>).__action === 'ban') {
      path = `/admin/users/${params.id}/ban`;
      payload = {} as typeof payload;
    }
    const res = await apiClient.patch(path, payload);
    const body = res.data as Record<string, unknown>;
    return { data: (body.data ?? body) as RaRecord };
  },

  updateMany: async (resource: string, params) => {
    await Promise.all(params.ids.map((id) => apiClient.patch(`${apiPath(resource)}/${id}`, params.data)));
    return { data: params.ids as string[] };
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: async (resource: string, params: DeleteParams): Promise<any> => {
    await apiClient.delete(`${apiPath(resource)}/${params.id}`);
    return { data: { id: params.id } as RaRecord };
  },

  deleteMany: async (resource: string, params) => {
    await Promise.all(params.ids.map((id) => apiClient.delete(`${apiPath(resource)}/${id}`)));
    return { data: params.ids as string[] };
  },
};

/**
 * Fetchers for Studio-owned Next API routes. Single boundary: client -> Next API.
 */

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.text();
    let message = `Request failed: ${res.status}`;
    try {
      const data = JSON.parse(body);
      if (data?.error) message = data.error;
    } catch {
      if (body) message = body.slice(0, 200);
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export type ForgeGraphDoc = {
  id: number;
  title: string;
  flow: unknown;
  createdAt?: string;
  updatedAt?: string;
};

export type VideoDocRecord = {
  id: number;
  title: string;
  graphId?: string | null;
  doc: unknown;
  createdAt?: string;
  updatedAt?: string;
};

export type StudioUser = {
  id: number | string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  plan?: string | null;
};

export type StudioMeResponse = {
  user: StudioUser | null;
};

export const studioClient = {
  getGraphs: () => fetchJson<ForgeGraphDoc[]>('/api/graphs'),
  getGraph: (id: number) => fetchJson<ForgeGraphDoc>(`/api/graphs/${id}`),
  updateGraph: (id: number, body: { flow?: unknown }) =>
    fetchJson<ForgeGraphDoc>(`/api/graphs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  createGraph: (body: { title: string; flow: unknown }) =>
    fetchJson<ForgeGraphDoc>('/api/graphs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  getVideoDocs: () => fetchJson<VideoDocRecord[]>('/api/video-docs'),
  getVideoDoc: (id: number) => fetchJson<VideoDocRecord>(`/api/video-docs/${id}`),
  updateVideoDoc: (id: number, body: { doc: unknown }) =>
    fetchJson<VideoDocRecord>(`/api/video-docs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  createVideoDoc: (body: { title: string; doc: unknown }) =>
    fetchJson<VideoDocRecord>('/api/video-docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  getMe: async (): Promise<StudioMeResponse | null> => {
    const res = await fetch('/api/me');
    if (res.status === 401) return { user: null };
    if (!res.ok) {
      const body = await res.text();
      let message = `Request failed: ${res.status}`;
      try {
        const data = JSON.parse(body);
        if (data?.error) message = data.error;
      } catch {
        if (body) message = body.slice(0, 200);
      }
      throw new Error(message);
    }
    return res.json() as Promise<StudioMeResponse>;
  },
};

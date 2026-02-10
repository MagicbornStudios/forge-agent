/**
 * Client for Payload media upload via our Next API.
 */

import { API_ROUTES } from './routes';

export interface MediaUploadResult {
  id: number;
  url: string;
}

export async function uploadFile(file: File): Promise<MediaUploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(API_ROUTES.MEDIA, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Media upload failed: ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  const doc = json.doc ?? json;
  const url =
    doc.url ??
    doc.sizes?.medium?.url ??
    doc.sizes?.thumbnail?.url ??
    API_ROUTES.MEDIA_FILE(doc.id);

  return { id: doc.id, url };
}

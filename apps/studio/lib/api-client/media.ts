/**
 * Client for Payload media upload via our Next API.
 */

export interface MediaUploadResult {
  id: number;
  url: string;
}

export async function uploadFile(file: File): Promise<MediaUploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/media', {
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
    `/api/media/file/${doc.id}`;

  return { id: doc.id, url };
}

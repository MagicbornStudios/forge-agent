'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { FileText } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { fetchRepoFile, writeRepoFile } from '@/lib/api/services';
import { toErrorMessage } from '@/lib/api/http';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((module) => module.default),
  { ssr: false },
);

export interface EnvFileEditorPanelProps {
  filePath: string;
  onDirtyChange?: (path: string, dirty: boolean) => void;
}

function basename(p: string): string {
  const n = p.replace(/\/+$/, '').trim();
  const i = n.lastIndexOf('/');
  return i < 0 ? n : n.slice(i + 1);
}

export function EnvFileEditorPanel({
  filePath,
  onDirtyChange,
}: EnvFileEditorPanelProps) {
  const [content, setContent] = React.useState('');
  const [baselineContent, setBaselineContent] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [messageError, setMessageError] = React.useState(false);

  const dirty = content !== baselineContent;

  React.useEffect(() => {
    onDirtyChange?.(filePath, dirty);
  }, [filePath, dirty, onDirtyChange]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage('');
    (async () => {
      try {
        const payload = await fetchRepoFile(filePath);
        if (cancelled) return;
        if (!payload.ok) {
          setMessage(payload.message || 'Unable to read file.');
          setMessageError(true);
          setContent('');
          setBaselineContent('');
          return;
        }
        const text = payload.content ?? '';
        setContent(text);
        setBaselineContent(text);
        setMessageError(false);
      } catch (err) {
        if (!cancelled) {
          setMessage(toErrorMessage(err, 'Unable to read file.'));
          setMessageError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filePath]);

  const handleSave = React.useCallback(async () => {
    setSaving(true);
    setMessage('');
    setMessageError(false);
    try {
      const payload = await writeRepoFile({ path: filePath, content });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to save file.');
        setMessageError(true);
        return;
      }
      setBaselineContent(content);
      setMessage(`Saved ${filePath}`);
    } catch (err) {
      setMessage(toErrorMessage(err, 'Unable to save file.'));
      setMessageError(true);
    } finally {
      setSaving(false);
    }
  }, [filePath, content]);

  const handleRevert = React.useCallback(() => {
    setContent(baselineContent);
    setMessage('Reverted to saved version.');
  }, [baselineContent]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-xs text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-2 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <FileText size={14} className="shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate text-xs font-medium" title={filePath}>
            {basename(filePath)}
          </span>
          {dirty ? (
            <span className="shrink-0 text-xs text-muted-foreground">(unsaved)</span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button size="sm" variant="outline" onClick={handleRevert} disabled={!dirty}>
            Revert
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
      {message ? (
        <div
          className={
            messageError
              ? 'shrink-0 border-b border-border px-2 py-1 text-xs text-destructive'
              : 'shrink-0 border-b border-border px-2 py-1 text-xs text-muted-foreground'
          }
        >
          {message}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-hidden">
        <MonacoEditor
          language="properties"
          theme="vs-dark"
          value={content}
          onChange={(value) => setContent(value ?? '')}
          options={{
            readOnly: false,
            minimap: { enabled: false },
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}

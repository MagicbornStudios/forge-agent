'use client';

import React from 'react';

// ---------------------------------------------------------------------------
// Render helpers for copilot action results (generative UI)
// ---------------------------------------------------------------------------

export function renderCharacterCreated(props: { status: string; result?: { data?: { characterId?: number; name?: string } } }) {
  const { status, result } = props;
  if (status === 'inProgress') {
    return <div className="text-sm text-muted-foreground animate-pulse">Creating character...</div>;
  }
  const name = result?.data?.name ?? 'Character';
  return (
    <div className="rounded-md border bg-card p-3 text-sm">
      <span className="font-medium text-green-600">Created:</span> {name}
    </div>
  );
}

export function renderPortraitGenerated(props: { status: string; result?: { data?: { imageUrl?: string; characterName?: string } } }) {
  const { status, result } = props;
  if (status === 'inProgress') {
    return <div className="text-sm text-muted-foreground animate-pulse">Generating portrait...</div>;
  }
  const url = result?.data?.imageUrl;
  return (
    <div className="rounded-md border bg-card p-3 text-sm space-y-2">
      <div>
        <span className="font-medium text-green-600">Portrait generated</span>
        {result?.data?.characterName && <span> for {result.data.characterName}</span>}
      </div>
      {url && (
        <img
          src={url}
          alt="Generated portrait"
          className="w-32 h-32 rounded-md object-cover border"
        />
      )}
    </div>
  );
}

export function renderRelationshipCreated(props: { status: string; result?: { data?: { label?: string; sourceName?: string; targetName?: string } } }) {
  const { status, result } = props;
  if (status === 'inProgress') {
    return <div className="text-sm text-muted-foreground animate-pulse">Creating relationship...</div>;
  }
  const d = result?.data;
  return (
    <div className="rounded-md border bg-card p-3 text-sm">
      <span className="font-medium text-green-600">Relationship:</span>{' '}
      {d?.sourceName ?? '?'} &mdash; <em>{d?.label ?? 'related to'}</em> &mdash; {d?.targetName ?? '?'}
    </div>
  );
}

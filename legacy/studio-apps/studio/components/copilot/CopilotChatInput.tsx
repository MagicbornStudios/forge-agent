'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AudioLines, ArrowUp, Mic, MicOff, Paperclip, Square } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { FeatureGate } from '@forge/shared';
import { CAPABILITIES } from '@forge/shared/entitlements';
import { ModelSwitcher } from '@/components/model-switcher';

type SpeechRecognitionResultItem = {
  transcript?: string;
};

type SpeechRecognitionResultLike = {
  0?: SpeechRecognitionResultItem;
  isFinal?: boolean;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = {
  new (): SpeechRecognitionLike;
};

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export interface ChatInputProps {
  inProgress: boolean;
  onSend: (text: string) => Promise<void>;
  isVisible?: boolean;
  onStop?: () => void;
  onUpload?: () => void;
  hideStopButton?: boolean;
  chatReady?: boolean;
}

export function CopilotChatInput({
  inProgress,
  onSend,
  isVisible = true,
  onStop,
  onUpload,
  hideStopButton = false,
  chatReady = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const dictationBaseRef = useRef('');

  const [text, setText] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [dictationSupported, setDictationSupported] = useState(false);

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setDictationSupported(false);
      return;
    }

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsDictating(true);
    };
    recognition.onend = () => {
      setIsDictating(false);
    };
    recognition.onerror = () => {
      setIsDictating(false);
    };
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const nextTranscript = event.results[i][0]?.transcript ?? '';
        if (event.results[i].isFinal) {
          final += nextTranscript;
        } else {
          interim += nextTranscript;
        }
      }

      const base = dictationBaseRef.current;
      const spacer = base && (final || interim) && !base.endsWith(' ') ? ' ' : '';
      const merged = `${base}${spacer}${final}${interim}`.trimStart();
      setText(merged);

      if (final.trim().length > 0) {
        dictationBaseRef.current = merged.trimEnd();
      }
    };

    recognitionRef.current = recognition;
    setDictationSupported(true);

    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setIsDictating(false);
    };
  }, []);

  const canSend = useMemo(
    () => !inProgress && chatReady && text.trim().length > 0,
    [chatReady, inProgress, text],
  );

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    const next = text.trim();
    setText('');
    dictationBaseRef.current = '';
    await onSend(next);
    textareaRef.current?.focus();
  }, [canSend, onSend, text]);

  const handleStartDictation = useCallback(() => {
    if (!dictationSupported || inProgress || isDictating) return;
    dictationBaseRef.current = text.trimEnd();
    try {
      recognitionRef.current?.start();
    } catch {
      setIsDictating(false);
    }
  }, [dictationSupported, inProgress, isDictating, text]);

  const handleStopDictation = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  if (!isVisible) return null;

  return (
    <div className="mx-3 mb-3 flex flex-col rounded-2xl border border-input bg-background p-2">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Send a message..."
        className="min-h-14 w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
        rows={1}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void handleSend();
          }
        }}
      />

      <div className="mt-1 flex items-center justify-between gap-2 px-1 pb-1">
        <div className="flex items-center gap-1">
          <FeatureGate
            capability={CAPABILITIES.STUDIO_AI_ATTACHMENTS}
            mode="disable"
            reason="File upload is feature-flagged and currently off."
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-[var(--control-height)] rounded-full"
              onClick={onUpload}
              disabled={!onUpload}
              aria-label="Add attachment"
            >
              <Paperclip className="size-[var(--icon-size)]" />
            </Button>
          </FeatureGate>
        </div>

        <div className="flex items-center gap-1">
          <ModelSwitcher provider="copilot" variant="composer" />

          <FeatureGate
            capability={CAPABILITIES.STUDIO_AI_DICTATION}
            mode="disable"
            reason="Speech-to-text is feature-flagged and currently off."
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-[var(--control-height)] rounded-full"
              onClick={isDictating ? handleStopDictation : handleStartDictation}
              disabled={!dictationSupported || inProgress}
              aria-label={isDictating ? 'Stop dictation' : 'Start dictation'}
            >
              {isDictating ? (
                <MicOff className="size-[var(--icon-size)]" />
              ) : (
                <Mic className="size-[var(--icon-size)]" />
              )}
            </Button>
          </FeatureGate>

          <FeatureGate
            capability={CAPABILITIES.STUDIO_AI_VOICE_MODE}
            mode="disable"
            reason="Realtime voice mode is coming soon."
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-[var(--control-height)] rounded-full"
              disabled
              aria-label="Voice mode"
            >
              <AudioLines className="size-[var(--icon-size)]" />
            </Button>
          </FeatureGate>

          {inProgress && !hideStopButton ? (
            <Button
              type="button"
              variant="default"
              size="icon"
              className="size-[var(--control-height)] rounded-full"
              onClick={onStop}
              aria-label="Stop generating"
            >
              <Square className="size-[var(--icon-size)] fill-current" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="icon"
              className="size-[var(--control-height)] rounded-full"
              onClick={() => {
                void handleSend();
              }}
              disabled={!canSend}
              aria-label="Send message"
            >
              <ArrowUp className="size-[var(--icon-size-lg)]" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  AudioLines,
  ImageIcon,
  Loader2,
  Upload,
  Video,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@forge/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@forge/ui/tabs';
import { Button } from '@forge/ui/button';
import { Textarea } from '@forge/ui/textarea';
import { Label } from '@forge/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@forge/ui/select';

export type GenerateMediaTab =
  | 'text-to-image'
  | 'image-to-video'
  | 'text-to-video'
  | 'text-to-speech'
  | 'upload';

export interface GenerateMediaContext {
  name?: string;
  description?: string;
  existingImageUrl?: string;
}

export interface GenerateMediaResult {
  url: string;
  type: 'image' | 'video' | 'audio';
}

export interface GenerateMediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (result: GenerateMediaResult) => void;
  defaultTab?: GenerateMediaTab;
  context?: GenerateMediaContext;
  enabledTabs?: GenerateMediaTab[];
  generateImage: (
    prompt: string,
    opts?: { aspectRatio?: string },
  ) => Promise<{ imageUrl: string }>;
  generateVideo?: (
    sourceImageUrl: string,
    prompt: string,
  ) => Promise<{ videoUrl: string }>;
  generateSpeech?: (
    text: string,
    voiceId: string,
  ) => Promise<{ audioUrl: string }>;
  voices?: { id: string; name: string; labels?: Record<string, string> }[];
  uploadFile?: (
    file: File,
  ) => Promise<{ url: string; type?: 'image' | 'video' | 'audio' }>;
}

const ASPECT_RATIOS = [
  { value: '3:4', label: 'Portrait (3:4)' },
  { value: '1:1', label: 'Square (1:1)' },
  { value: '16:9', label: 'Landscape (16:9)' },
  { value: '4:3', label: 'Classic (4:3)' },
] as const;

export function GenerateMediaModal({
  open,
  onOpenChange,
  onGenerated,
  defaultTab = 'text-to-image',
  context,
  enabledTabs = ['text-to-image'],
  generateImage,
  generateVideo,
  generateSpeech,
  voices,
  uploadFile,
}: GenerateMediaModalProps) {
  const [activeTab, setActiveTab] = useState<GenerateMediaTab>(defaultTab);

  useEffect(() => {
    if (open) setActiveTab(defaultTab);
  }, [open, defaultTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[var(--dialog-max-w-lg)]">
        <DialogHeader>
          <DialogTitle>Generate Media</DialogTitle>
          <DialogDescription>
            Create image, audio, and video assets for the selected entity.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as GenerateMediaTab)}>
          <TabsList className="grid h-auto w-full grid-cols-2 gap-[var(--control-gap)] bg-muted/40 p-[var(--control-padding-y)] md:grid-cols-3">
            {enabledTabs.includes('text-to-image') && (
              <TabsTrigger value="text-to-image" className="text-xs">
                <ImageIcon />
                Text to Image
              </TabsTrigger>
            )}
            {enabledTabs.includes('image-to-video') && (
              <TabsTrigger value="image-to-video" className="text-xs">
                <Video />
                Image to Video
              </TabsTrigger>
            )}
            {enabledTabs.includes('text-to-video') && (
              <TabsTrigger value="text-to-video" className="text-xs">
                <Video />
                Text to Video
              </TabsTrigger>
            )}
            {enabledTabs.includes('text-to-speech') && (
              <TabsTrigger value="text-to-speech" className="text-xs">
                <AudioLines />
                Text to Speech
              </TabsTrigger>
            )}
            {enabledTabs.includes('upload') && (
              <TabsTrigger value="upload" className="text-xs">
                <Upload />
                Upload
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="text-to-image" className="mt-[var(--panel-padding)]">
            <TextToImageTab
              context={context}
              generateImage={generateImage}
              onApply={(url) => {
                onGenerated({ url, type: 'image' });
                onOpenChange(false);
              }}
            />
          </TabsContent>

          <TabsContent value="image-to-video" className="mt-[var(--panel-padding)]">
            <ImageToVideoTab
              context={context}
              generateVideo={generateVideo}
              onApply={(url) => {
                onGenerated({ url, type: 'video' });
                onOpenChange(false);
              }}
            />
          </TabsContent>

          <TabsContent value="text-to-video" className="mt-[var(--panel-padding)]">
            <TextToVideoTab context={context} />
          </TabsContent>

          <TabsContent value="text-to-speech" className="mt-[var(--panel-padding)]">
            <TextToSpeechTab
              context={context}
              generateSpeech={generateSpeech}
              voices={voices}
              onApply={(url) => {
                onGenerated({ url, type: 'audio' });
                onOpenChange(false);
              }}
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-[var(--panel-padding)]">
            <UploadTab
              uploadFile={uploadFile}
              onApply={(result) => {
                onGenerated({ url: result.url, type: result.type ?? 'image' });
                onOpenChange(false);
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="rounded-[var(--radius-sm)] border border-destructive/40 bg-destructive/10 px-[var(--control-padding-x)] py-[var(--control-padding-y)] text-xs text-destructive">
      {message}
    </p>
  );
}

function TextToImageTab({
  context,
  generateImage,
  onApply,
}: {
  context?: GenerateMediaContext;
  generateImage: GenerateMediaModalProps['generateImage'];
  onApply: (url: string) => void;
}) {
  const [prompt, setPrompt] = useState(buildPromptFromContext(context));
  const [aspectRatio, setAspectRatio] = useState('3:4');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setPrompt(buildPromptFromContext(context));
    setPreviewUrl(null);
    setError(null);
  }, [context?.name, context?.description]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setPreviewUrl(null);
    try {
      const result = await generateImage(prompt.trim(), { aspectRatio });
      setPreviewUrl(result.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image generation failed');
    } finally {
      setLoading(false);
    }
  }, [prompt, aspectRatio, generateImage]);

  return (
    <div className="space-y-[var(--panel-padding)]">
      <div className="space-y-[var(--control-gap)]">
        <Label htmlFor="t2i-prompt">Prompt</Label>
        <Textarea
          id="t2i-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="space-y-[var(--control-gap)]">
        <Label htmlFor="t2i-ratio">Aspect Ratio</Label>
        <Select value={aspectRatio} onValueChange={setAspectRatio}>
          <SelectTrigger id="t2i-ratio">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASPECT_RATIOS.map((ratio) => (
              <SelectItem key={ratio.value} value={ratio.value}>
                {ratio.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleGenerate} disabled={!prompt.trim() || loading} className="w-full">
        {loading ? <Loader2 className="animate-spin" /> : <ImageIcon />}
        {loading ? 'Generating...' : 'Generate Image'}
      </Button>

      {error && <ErrorMessage message={error} />}

      {previewUrl && (
        <div className="space-y-[var(--control-gap)]">
          <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-muted">
            <img
              src={previewUrl}
              alt="Generated preview"
              className="max-h-64 w-full object-contain"
            />
          </div>
          <div className="flex gap-[var(--control-gap)]">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setPreviewUrl(null);
                setError(null);
              }}
            >
              Discard
            </Button>
            <Button size="sm" className="flex-1" onClick={() => onApply(previewUrl)}>
              <ImageIcon />
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ImageToVideoTab({
  context,
  generateVideo,
  onApply,
}: {
  context?: GenerateMediaContext;
  generateVideo?: GenerateMediaModalProps['generateVideo'];
  onApply: (url: string) => void;
}) {
  const [motionPrompt, setMotionPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sourceImage = context?.existingImageUrl;
  const isAvailable = Boolean(generateVideo && sourceImage);

  const handleGenerate = useCallback(async () => {
    if (!generateVideo || !sourceImage) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateVideo(sourceImage, motionPrompt.trim());
      onApply(result.videoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video generation failed');
    } finally {
      setLoading(false);
    }
  }, [generateVideo, sourceImage, motionPrompt, onApply]);

  return (
    <div className="space-y-[var(--panel-padding)]">
      <div className="space-y-[var(--control-gap)]">
        <Label>Source image</Label>
        {sourceImage ? (
          <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-muted">
            <img src={sourceImage} alt="Source" className="max-h-40 w-full object-contain" />
          </div>
        ) : (
          <div className="rounded-[var(--radius-md)] border border-dashed border-border p-[var(--panel-padding)] text-center text-sm text-muted-foreground">
            No image available yet. Generate or upload one first.
          </div>
        )}
      </div>

      <div className="space-y-[var(--control-gap)]">
        <Label htmlFor="i2v-motion">Motion prompt (optional)</Label>
        <Textarea
          id="i2v-motion"
          value={motionPrompt}
          onChange={(e) => setMotionPrompt(e.target.value)}
          placeholder="Describe how the image should move..."
          rows={2}
          className="resize-none"
          disabled={!isAvailable}
        />
      </div>

      <Button onClick={handleGenerate} disabled={!isAvailable || loading} className="w-full">
        {loading ? <Loader2 className="animate-spin" /> : <Video />}
        {!generateVideo
          ? 'Video generation coming soon'
          : loading
            ? 'Generating...'
            : 'Generate Video'}
      </Button>

      {error && <ErrorMessage message={error} />}
    </div>
  );
}

function TextToVideoTab({ context }: { context?: GenerateMediaContext }) {
  const [prompt, setPrompt] = useState(
    context?.name
      ? `Cinematic shot of ${context.name}${context.description ? `, ${context.description}` : ''}`
      : '',
  );

  return (
    <div className="space-y-[var(--panel-padding)]">
      <div className="space-y-[var(--control-gap)]">
        <Label htmlFor="t2v-prompt">Prompt</Label>
        <Textarea
          id="t2v-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the video you want to generate..."
          rows={3}
          className="resize-none"
        />
      </div>
      <Button disabled className="w-full">
        <Video />
        Video generation coming soon
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Text-to-video generation is available when a compatible backend is configured.
      </p>
    </div>
  );
}

function TextToSpeechTab({
  context,
  generateSpeech,
  voices,
  onApply,
}: {
  context?: GenerateMediaContext;
  generateSpeech?: GenerateMediaModalProps['generateSpeech'];
  voices?: GenerateMediaModalProps['voices'];
  onApply: (url: string) => void;
}) {
  const [text, setText] = useState(
    context?.description
      ? context.description.slice(0, 500)
      : context?.name
        ? `Hello, my name is ${context.name}.`
        : '',
  );
  const [selectedVoiceId, setSelectedVoiceId] = useState(voices?.[0]?.id ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const isAvailable = Boolean(generateSpeech && voices && voices.length > 0);

  useEffect(() => {
    if (voices && voices.length > 0 && !selectedVoiceId) {
      setSelectedVoiceId(voices[0].id);
    }
  }, [voices, selectedVoiceId]);

  const handleGenerate = useCallback(async () => {
    if (!generateSpeech || !text.trim() || !selectedVoiceId) return;
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    try {
      const result = await generateSpeech(text.trim(), selectedVoiceId);
      setAudioUrl(result.audioUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speech generation failed');
    } finally {
      setLoading(false);
    }
  }, [generateSpeech, text, selectedVoiceId]);

  return (
    <div className="space-y-[var(--panel-padding)]">
      <div className="space-y-[var(--control-gap)]">
        <Label htmlFor="tts-voice">Voice</Label>
        {voices && voices.length > 0 ? (
          <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
            <SelectTrigger id="tts-voice">
              <SelectValue placeholder="Select a voice..." />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name}
                  {voice.labels?.accent ? ` (${voice.labels.accent})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-xs text-muted-foreground">
            {voices === undefined ? 'Loading voices...' : 'No voices available'}
          </p>
        )}
      </div>

      <div className="space-y-[var(--control-gap)]">
        <Label htmlFor="tts-text">Text</Label>
        <Textarea
          id="tts-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to speak..."
          rows={4}
          className="resize-none"
          disabled={!isAvailable}
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!isAvailable || !text.trim() || !selectedVoiceId || loading}
        className="w-full"
      >
        {loading ? <Loader2 className="animate-spin" /> : <AudioLines />}
        {!generateSpeech
          ? 'Speech generation unavailable'
          : loading
            ? 'Generating...'
            : 'Generate Speech'}
      </Button>

      {error && <ErrorMessage message={error} />}

      {audioUrl && (
        <div className="space-y-[var(--control-gap)]">
          <div className="rounded-[var(--radius-md)] border border-border bg-muted p-[var(--panel-padding)]">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio controls className="w-full" src={audioUrl} />
          </div>
          <div className="flex gap-[var(--control-gap)]">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setAudioUrl(null);
                setError(null);
              }}
            >
              Discard
            </Button>
            <Button size="sm" className="flex-1" onClick={() => onApply(audioUrl)}>
              <AudioLines />
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadTab({
  uploadFile,
  onApply,
}: {
  uploadFile?: GenerateMediaModalProps['uploadFile'];
  onApply: (result: { url: string; type?: 'image' | 'video' | 'audio' }) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    url: string;
    type?: 'image' | 'video' | 'audio';
  } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !uploadFile) return;
      setError(null);
      setUploadResult(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setLoading(true);
      try {
        const result = await uploadFile(file);
        setUploadResult(result);
        if (result.type === 'image' || file.type.startsWith('image/')) {
          setPreviewUrl(result.url);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setLoading(false);
        e.target.value = '';
      }
    },
    [uploadFile, previewUrl],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file || !uploadFile) return;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (inputRef.current) {
        inputRef.current.files = dataTransfer.files;
        inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    },
    [uploadFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  if (!uploadFile) {
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed border-border p-[var(--panel-padding)] text-center text-sm text-muted-foreground">
        Upload is not configured for this environment.
      </div>
    );
  }

  return (
    <div className="space-y-[var(--panel-padding)]">
      <div
        className="rounded-[var(--radius-md)] border border-dashed border-border p-[var(--panel-padding)] text-center text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          id="upload-media-input"
          onChange={handleFileChange}
          disabled={loading}
        />
        <label htmlFor="upload-media-input" className="cursor-pointer">
          {loading ? (
            <span className="inline-flex items-center gap-[var(--control-gap)]">
              <Loader2 className="animate-spin" />
              Uploading...
            </span>
          ) : (
            <span className="inline-flex items-center gap-[var(--control-gap)]">
              <Upload />
              Drop an image here or click to browse
            </span>
          )}
        </label>
      </div>

      {error && <ErrorMessage message={error} />}

      {uploadResult && (
        <div className="space-y-[var(--control-gap)]">
          {previewUrl && (
            <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-muted">
              <img
                src={previewUrl}
                alt="Uploaded preview"
                className="max-h-64 w-full object-contain"
              />
            </div>
          )}
          <div className="flex gap-[var(--control-gap)]">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setUploadResult(null);
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }
                setError(null);
              }}
            >
              Discard
            </Button>
            <Button size="sm" className="flex-1" onClick={() => onApply(uploadResult)}>
              <Upload />
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function buildPromptFromContext(context?: GenerateMediaContext): string {
  if (!context?.name) return '';
  const parts = [`Portrait of ${context.name}`];
  if (context.description) {
    parts.push(context.description.slice(0, 200));
  }
  return parts.join(', ');
}

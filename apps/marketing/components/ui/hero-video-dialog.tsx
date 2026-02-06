'use client';

import { useState } from 'react';
import { Play, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Dialog, DialogContent, DialogTitle, Button } from '@forge/ui';
import { cn } from '@/lib/utils';

type AnimationStyle =
  | 'from-bottom'
  | 'from-center'
  | 'from-top'
  | 'from-left'
  | 'from-right'
  | 'fade'
  | 'top-in-bottom-out'
  | 'left-in-right-out';

interface HeroVideoDialogProps {
  animationStyle?: AnimationStyle;
  videoSrc: string;
  thumbnailSrc: string;
  thumbnailAlt?: string;
  className?: string;
}

const animationVariants = {
  'from-bottom': {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  'from-center': {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  'from-top': {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  'from-left': {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  'from-right': {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'top-in-bottom-out': {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  'left-in-right-out': {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
};

export function HeroVideoDialog({
  animationStyle = 'from-center',
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = 'Video thumbnail',
  className,
}: HeroVideoDialogProps) {
  const [open, setOpen] = useState(false);
  const selected = animationVariants[animationStyle];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'relative flex aspect-video w-full max-w-2xl items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/50 transition-transform hover:scale-[1.02]',
          className
        )}
      >
        <img
          src={thumbnailSrc}
          alt={thumbnailAlt}
          className="absolute inset-0 size-full object-cover"
        />
        <span className="relative z-10 flex size-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
          <Play className="size-8 fill-current" />
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Video</DialogTitle>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={selected.initial}
                animate={selected.animate}
                exit={selected.exit}
                transition={{ duration: 0.2 }}
                className="relative aspect-video w-full overflow-hidden rounded-lg bg-black"
              >
                <video
                  src={videoSrc}
                  controls
                  autoPlay
                  className="size-full object-contain"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={() => setOpen(false)}
                >
                  <X className="size-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}

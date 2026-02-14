'use client';

import { MessageCircle, Users } from 'lucide-react';
import type { DemoEditorDefinition } from './types';

export const PROJECT_OPTIONS = [
  { value: 'forge-platform', label: 'Forge Platform' },
  { value: 'writer-suite', label: 'Writer Suite' },
  { value: 'campaign-lab', label: 'Campaign Lab' },
];

export const EDITORS: DemoEditorDefinition[] = [
  { id: 'dialogue', label: 'Dialogue', icon: MessageCircle },
  { id: 'character', label: 'Character', icon: Users },
];

export const DIALOGUE_BEATS = [
  'Intro hook',
  'Conflict escalation',
  'Bargain + reveal',
  'Decision point',
];

export const CHARACTER_BEATS = [
  'Backstory anchor',
  'Core motivation',
  'Relationship map',
  'Voice constraints',
];


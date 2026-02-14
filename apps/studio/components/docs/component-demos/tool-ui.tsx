'use client';

import * as React from 'react';
import {
  ActionButtons,
  ApprovalCard,
  Audio,
  Chart,
  Citation,
  CodeBlock,
  DataTable,
  Image,
  ImageGallery,
  InstagramPost,
  ItemCarousel,
  LinkPreview,
  LinkedInPost,
  MessageDraft,
  OptionList,
  OrderSummary,
  ParameterSlider,
  Plan,
  PreferencesPanel,
  ProgressTracker,
  QuestionFlow,
  StatsDisplay,
  Terminal,
  Video,
  WeatherWidget,
  XPost,
} from '@forge/shared/components/tool-ui';
import type { ComponentDemoId } from './generated-ids';
import { ComponentDemoFrame } from './harnesses';
import { TOOL_UI_FIXTURES, TOOL_UI_SHARED_ACTIONS } from './fixtures/tool-ui';

export type ToolUiDemoId = Extract<ComponentDemoId, `tool-ui.${string}`>;

type DemoRenderer = () => React.JSX.Element;

const TOOL_UI_DEMOS: Record<ToolUiDemoId, DemoRenderer> = {
  'tool-ui.approval-card': () => (
    <ComponentDemoFrame>
      <ApprovalCard {...TOOL_UI_FIXTURES.approvalCard} />
    </ComponentDemoFrame>
  ),
  'tool-ui.audio': () => (
    <ComponentDemoFrame>
      <Audio {...TOOL_UI_FIXTURES.audio} />
    </ComponentDemoFrame>
  ),
  'tool-ui.chart': () => (
    <ComponentDemoFrame>
      <Chart {...TOOL_UI_FIXTURES.chart} />
    </ComponentDemoFrame>
  ),
  'tool-ui.citation': () => (
    <ComponentDemoFrame>
      <Citation {...TOOL_UI_FIXTURES.citation} />
    </ComponentDemoFrame>
  ),
  'tool-ui.code-block': () => (
    <ComponentDemoFrame>
      <CodeBlock {...TOOL_UI_FIXTURES.codeBlock} />
    </ComponentDemoFrame>
  ),
  'tool-ui.data-table': () => (
    <ComponentDemoFrame>
      <DataTable {...TOOL_UI_FIXTURES.dataTable} />
    </ComponentDemoFrame>
  ),
  'tool-ui.image': () => (
    <ComponentDemoFrame>
      <Image {...TOOL_UI_FIXTURES.image} alt={TOOL_UI_FIXTURES.image.alt ?? 'Tool UI image preview'} />
    </ComponentDemoFrame>
  ),
  'tool-ui.image-gallery': () => (
    <ComponentDemoFrame>
      <ImageGallery {...TOOL_UI_FIXTURES.imageGallery} />
    </ComponentDemoFrame>
  ),
  'tool-ui.instagram-post': () => (
    <ComponentDemoFrame>
      <InstagramPost post={TOOL_UI_FIXTURES.instagramPost} />
    </ComponentDemoFrame>
  ),
  'tool-ui.item-carousel': () => (
    <ComponentDemoFrame>
      <ItemCarousel {...TOOL_UI_FIXTURES.itemCarousel} />
    </ComponentDemoFrame>
  ),
  'tool-ui.link-preview': () => (
    <ComponentDemoFrame>
      <LinkPreview {...TOOL_UI_FIXTURES.linkPreview} />
    </ComponentDemoFrame>
  ),
  'tool-ui.linkedin-post': () => (
    <ComponentDemoFrame>
      <LinkedInPost post={TOOL_UI_FIXTURES.linkedInPost} />
    </ComponentDemoFrame>
  ),
  'tool-ui.message-draft': () => (
    <ComponentDemoFrame>
      <MessageDraft {...TOOL_UI_FIXTURES.messageDraft} />
    </ComponentDemoFrame>
  ),
  'tool-ui.option-list': () => (
    <ComponentDemoFrame>
      <OptionList {...TOOL_UI_FIXTURES.optionList} />
    </ComponentDemoFrame>
  ),
  'tool-ui.order-summary': () => (
    <ComponentDemoFrame>
      <OrderSummary {...TOOL_UI_FIXTURES.orderSummary} />
    </ComponentDemoFrame>
  ),
  'tool-ui.parameter-slider': () => (
    <ComponentDemoFrame>
      <ParameterSlider {...TOOL_UI_FIXTURES.parameterSlider} />
    </ComponentDemoFrame>
  ),
  'tool-ui.plan': () => (
    <ComponentDemoFrame>
      <Plan {...TOOL_UI_FIXTURES.plan} />
    </ComponentDemoFrame>
  ),
  'tool-ui.preferences-panel': () => (
    <ComponentDemoFrame>
      <PreferencesPanel {...TOOL_UI_FIXTURES.preferencesPanel} />
    </ComponentDemoFrame>
  ),
  'tool-ui.progress-tracker': () => (
    <ComponentDemoFrame>
      <ProgressTracker {...TOOL_UI_FIXTURES.progressTracker} />
    </ComponentDemoFrame>
  ),
  'tool-ui.question-flow': () => (
    <ComponentDemoFrame>
      <QuestionFlow {...TOOL_UI_FIXTURES.questionFlow} />
    </ComponentDemoFrame>
  ),
  'tool-ui.shared': () => (
    <ComponentDemoFrame>
      <ActionButtons
        actions={TOOL_UI_SHARED_ACTIONS}
        onAction={() => undefined}
      />
    </ComponentDemoFrame>
  ),
  'tool-ui.stats-display': () => (
    <ComponentDemoFrame>
      <StatsDisplay {...TOOL_UI_FIXTURES.statsDisplay} />
    </ComponentDemoFrame>
  ),
  'tool-ui.terminal': () => (
    <ComponentDemoFrame>
      <Terminal {...TOOL_UI_FIXTURES.terminal} />
    </ComponentDemoFrame>
  ),
  'tool-ui.video': () => (
    <ComponentDemoFrame>
      <Video {...TOOL_UI_FIXTURES.video} />
    </ComponentDemoFrame>
  ),
  'tool-ui.weather-widget': () => (
    <ComponentDemoFrame>
      <WeatherWidget
        {...TOOL_UI_FIXTURES.weatherWidget}
        effects={{ enabled: false }}
      />
    </ComponentDemoFrame>
  ),
  'tool-ui.x-post': () => (
    <ComponentDemoFrame>
      <XPost post={TOOL_UI_FIXTURES.xPost} />
    </ComponentDemoFrame>
  ),
};

export function getToolUiDemo(id: ToolUiDemoId): DemoRenderer {
  return TOOL_UI_DEMOS[id];
}

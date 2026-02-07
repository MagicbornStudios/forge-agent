'use client';

import * as React from 'react';
import { makeAssistantTool, type ToolCallMessagePartProps } from '@assistant-ui/react';
import { ToolFallback } from '../assistant-ui/tool-fallback';
import { ToolUIErrorBoundary } from './shared';
import { ApprovalCard, parseSerializableApprovalCard, SerializableApprovalCardSchema } from './approval-card';
import { Audio, parseSerializableAudio, SerializableAudioSchema } from './audio';
import { Chart, parseSerializableChart, SerializableChartSchema } from './chart';
import { Citation, parseSerializableCitation, SerializableCitationSchema } from './citation';
import { CodeBlock, parseSerializableCodeBlock, SerializableCodeBlockSchema } from './code-block';
import { DataTable } from './data-table';
import { parseSerializableDataTable, SerializableDataTableSchema } from './data-table/schema';
import { Image, parseSerializableImage, SerializableImageSchema } from './image';
import { ImageGallery, parseSerializableImageGallery, SerializableImageGallerySchema } from './image-gallery';
import { InstagramPost, parseSerializableInstagramPost, SerializableInstagramPostSchema } from './instagram-post';
import { ItemCarousel, parseSerializableItemCarousel, SerializableItemCarouselSchema } from './item-carousel';
import { LinkPreview, parseSerializableLinkPreview, SerializableLinkPreviewSchema } from './link-preview';
import { LinkedInPost, parseSerializableLinkedInPost, SerializableLinkedInPostSchema } from './linkedin-post';
import { MessageDraft, parseSerializableMessageDraft, SerializableMessageDraftSchema } from './message-draft';
import { OptionList, parseSerializableOptionList, SerializableOptionListSchema } from './option-list';
import { OrderSummary, parseSerializableOrderSummary, SerializableOrderSummarySchema } from './order-summary';
import { ParameterSlider, parseSerializableParameterSlider, SerializableParameterSliderSchema } from './parameter-slider';
import { Plan, parseSerializablePlan, SerializablePlanSchema } from './plan';
import { PreferencesPanel, parseSerializablePreferencesPanel, SerializablePreferencesPanelSchema } from './preferences-panel';
import { ProgressTracker, parseSerializableProgressTracker, SerializableProgressTrackerSchema } from './progress-tracker';
import { QuestionFlow, parseSerializableQuestionFlow, SerializableQuestionFlowSchema } from './question-flow';
import { StatsDisplay, parseSerializableStatsDisplay, SerializableStatsDisplaySchema } from './stats-display';
import { Terminal, parseSerializableTerminal, SerializableTerminalSchema } from './terminal';
import { Video, parseSerializableVideo, SerializableVideoSchema } from './video';
import { WeatherWidget, parseSerializableWeatherWidget, SerializableWeatherWidgetSchema } from './weather-widget';
import { XPost, parseSerializableXPost, SerializableXPostSchema } from './x-post';

type ToolRenderProps = ToolCallMessagePartProps<Record<string, unknown>, unknown>;

type ToolUIConfig<TPayload> = {
  toolName: string;
  componentName: string;
  description: string;
  schema: unknown;
  parse: (input: unknown) => TPayload;
  Component: React.ComponentType<TPayload>;
};

const renderParsedTool = <TPayload,>(
  props: ToolRenderProps,
  config: ToolUIConfig<TPayload>,
) => {
  if (props.status?.type === 'running' && props.result == null) {
    return <ToolFallback {...props} />;
  }

  const payloadSource = props.result ?? props.args;

  try {
    const payload = config.parse(payloadSource);
    return (
      <ToolUIErrorBoundary componentName={config.componentName}>
        <config.Component {...payload} />
      </ToolUIErrorBoundary>
    );
  } catch {
    return <ToolFallback {...props} />;
  }
};

function createToolUI<TPayload>(config: ToolUIConfig<TPayload>) {
  return makeAssistantTool<Record<string, unknown>, unknown>({
    toolName: config.toolName,
    description: config.description,
    parameters: config.schema as never,
    render: (props) => renderParsedTool(props, config),
  });
}

const TOOL_DEFINITIONS: ToolUIConfig<any>[] = [
  {
    toolName: 'render_plan',
    componentName: 'Plan',
    description: 'Render a structured plan with steps and status.',
    schema: SerializablePlanSchema,
    parse: parseSerializablePlan,
    Component: Plan,
  },
  {
    toolName: 'render_code_block',
    componentName: 'CodeBlock',
    description: 'Render a code block with language and highlighting.',
    schema: SerializableCodeBlockSchema,
    parse: parseSerializableCodeBlock,
    Component: CodeBlock,
  },
  {
    toolName: 'render_data_table',
    componentName: 'DataTable',
    description: 'Render a data table with columns and rows.',
    schema: SerializableDataTableSchema,
    parse: parseSerializableDataTable,
    Component: DataTable,
  },
  {
    toolName: 'render_terminal',
    componentName: 'Terminal',
    description: 'Render terminal output, including ANSI colors.',
    schema: SerializableTerminalSchema,
    parse: parseSerializableTerminal,
    Component: Terminal,
  },
  {
    toolName: 'render_chart',
    componentName: 'Chart',
    description: 'Render a chart with series and data points.',
    schema: SerializableChartSchema,
    parse: parseSerializableChart,
    Component: Chart,
  },
  {
    toolName: 'render_image',
    componentName: 'Image',
    description: 'Render a single image with caption.',
    schema: SerializableImageSchema,
    parse: parseSerializableImage,
    Component: Image,
  },
  {
    toolName: 'render_image_gallery',
    componentName: 'ImageGallery',
    description: 'Render a gallery of images.',
    schema: SerializableImageGallerySchema,
    parse: parseSerializableImageGallery,
    Component: ImageGallery,
  },
  {
    toolName: 'render_audio',
    componentName: 'Audio',
    description: 'Render audio playback controls.',
    schema: SerializableAudioSchema,
    parse: parseSerializableAudio,
    Component: Audio,
  },
  {
    toolName: 'render_video',
    componentName: 'Video',
    description: 'Render video playback with poster and metadata.',
    schema: SerializableVideoSchema,
    parse: parseSerializableVideo,
    Component: Video,
  },
  {
    toolName: 'render_link_preview',
    componentName: 'LinkPreview',
    description: 'Render a link preview card with title and summary.',
    schema: SerializableLinkPreviewSchema,
    parse: parseSerializableLinkPreview,
    Component: LinkPreview,
  },
  {
    toolName: 'render_citation',
    componentName: 'Citation',
    description: 'Render a citation summary card.',
    schema: SerializableCitationSchema,
    parse: parseSerializableCitation,
    Component: Citation,
  },
  {
    toolName: 'render_option_list',
    componentName: 'OptionList',
    description: 'Render a list of selectable options.',
    schema: SerializableOptionListSchema,
    parse: parseSerializableOptionList,
    Component: OptionList,
  },
  {
    toolName: 'render_question_flow',
    componentName: 'QuestionFlow',
    description: 'Render a multi-step question flow.',
    schema: SerializableQuestionFlowSchema,
    parse: parseSerializableQuestionFlow,
    Component: QuestionFlow,
  },
  {
    toolName: 'render_progress_tracker',
    componentName: 'ProgressTracker',
    description: 'Render a progress tracker for steps or milestones.',
    schema: SerializableProgressTrackerSchema,
    parse: parseSerializableProgressTracker,
    Component: ProgressTracker,
  },
  {
    toolName: 'render_stats_display',
    componentName: 'StatsDisplay',
    description: 'Render a stats display with metrics.',
    schema: SerializableStatsDisplaySchema,
    parse: parseSerializableStatsDisplay,
    Component: StatsDisplay,
  },
  {
    toolName: 'render_message_draft',
    componentName: 'MessageDraft',
    description: 'Render a draft message UI with preview.',
    schema: SerializableMessageDraftSchema,
    parse: parseSerializableMessageDraft,
    Component: MessageDraft,
  },
  {
    toolName: 'render_approval_card',
    componentName: 'ApprovalCard',
    description: 'Render an approval card with confirm and cancel actions.',
    schema: SerializableApprovalCardSchema,
    parse: parseSerializableApprovalCard,
    Component: ApprovalCard,
  },
  {
    toolName: 'render_parameter_slider',
    componentName: 'ParameterSlider',
    description: 'Render a slider for numeric parameter tuning.',
    schema: SerializableParameterSliderSchema,
    parse: parseSerializableParameterSlider,
    Component: ParameterSlider,
  },
  {
    toolName: 'render_preferences_panel',
    componentName: 'PreferencesPanel',
    description: 'Render a preferences panel with toggleable settings.',
    schema: SerializablePreferencesPanelSchema,
    parse: parseSerializablePreferencesPanel,
    Component: PreferencesPanel,
  },
  {
    toolName: 'render_order_summary',
    componentName: 'OrderSummary',
    description: 'Render an order summary card.',
    schema: SerializableOrderSummarySchema,
    parse: parseSerializableOrderSummary,
    Component: OrderSummary,
  },
  {
    toolName: 'render_item_carousel',
    componentName: 'ItemCarousel',
    description: 'Render a carousel of items.',
    schema: SerializableItemCarouselSchema,
    parse: parseSerializableItemCarousel,
    Component: ItemCarousel,
  },
  {
    toolName: 'render_instagram_post',
    componentName: 'InstagramPost',
    description: 'Render an Instagram-style post preview.',
    schema: SerializableInstagramPostSchema,
    parse: parseSerializableInstagramPost,
    Component: InstagramPost,
  },
  {
    toolName: 'render_linkedin_post',
    componentName: 'LinkedInPost',
    description: 'Render a LinkedIn-style post preview.',
    schema: SerializableLinkedInPostSchema,
    parse: parseSerializableLinkedInPost,
    Component: LinkedInPost,
  },
  {
    toolName: 'render_x_post',
    componentName: 'XPost',
    description: 'Render an X/Twitter-style post preview.',
    schema: SerializableXPostSchema,
    parse: parseSerializableXPost,
    Component: XPost,
  },
  {
    toolName: 'render_weather_widget',
    componentName: 'WeatherWidget',
    description: 'Render a weather widget with forecast details.',
    schema: SerializableWeatherWidgetSchema,
    parse: parseSerializableWeatherWidget,
    Component: WeatherWidget,
  },
];

const TOOL_COMPONENTS = TOOL_DEFINITIONS.map((definition) => ({
  toolName: definition.toolName,
  ToolComponent: createToolUI(definition),
}));

export const TOOL_UI_TOOL_NAMES = TOOL_DEFINITIONS.map((definition) => definition.toolName);

export function ToolUIRegistry() {
  return (
    <>
      {TOOL_COMPONENTS.map(({ toolName, ToolComponent }) => (
        <ToolComponent key={toolName} />
      ))}
    </>
  );
}

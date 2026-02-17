import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, useApp } from 'ink';

function statusColor(status) {
  if (status === 'complete') return 'green';
  if (status === 'failed') return 'red';
  if (status === 'running') return 'yellow';
  return 'gray';
}

function StepRow({ step, active }) {
  const prefix = step.status === 'complete'
    ? '[x]'
    : step.status === 'failed'
      ? '[!]'
      : step.status === 'running'
        ? '[~]'
        : '[ ]';

  return (
    React.createElement(
      Box,
      { flexDirection: 'row' },
      React.createElement(Text, { color: statusColor(step.status) }, `${prefix} ${step.label}${active ? ' (active)' : ''}`),
    )
  );
}

export function InteractiveLoopApp({
  title,
  runner,
  mode,
  phaseNumber,
  steps,
  onDone,
}) {
  const [stepStates, setStepStates] = useState(() => steps.map((step) => ({ key: step.key, label: step.label, status: 'pending' })));
  const [logs, setLogs] = useState([]);
  const [activeKey, setActiveKey] = useState(null);
  const { exit } = useApp();

  const activeIndexByKey = useMemo(() => {
    const map = new Map();
    stepStates.forEach((item, index) => map.set(item.key, index));
    return map;
  }, [stepStates]);

  useEffect(() => {
    let cancelled = false;

    const setStatus = (key, status) => {
      setStepStates((previous) => previous.map((item) => (item.key === key ? { ...item, status } : item)));
    };

    const pushLog = (line) => {
      setLogs((previous) => {
        const next = [...previous, line];
        return next.slice(-8);
      });
    };

    const run = async () => {
      const results = [];
      let failed = null;

      for (const step of steps) {
        if (cancelled) return;

        setActiveKey(step.key);
        setStatus(step.key, 'running');
        pushLog(`Running ${step.label}...`);

        try {
          const result = await step.run();
          if (cancelled) return;
          const ok = result?.ok !== false;
          results.push({ key: step.key, ok, result });
          setStatus(step.key, ok ? 'complete' : 'failed');
          pushLog(ok ? `${step.label} completed.` : `${step.label} failed.`);

          if (!ok) {
            failed = {
              key: step.key,
              message: result?.message || 'Step returned failure.',
              result,
            };
            break;
          }
        } catch (error) {
          if (cancelled) return;
          const message = error instanceof Error ? error.message : String(error);
          setStatus(step.key, 'failed');
          pushLog(`${step.label} error: ${message}`);
          failed = {
            key: step.key,
            message,
            result: null,
          };
          break;
        }
      }

      if (cancelled) return;

      setActiveKey(null);
      onDone({
        ok: !failed,
        phaseNumber,
        runner,
        mode,
        failed,
        stageResults: results,
      });
      setTimeout(() => exit(), 40);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [steps, runner, mode, phaseNumber, onDone, exit]);

  return (
    React.createElement(
      Box,
      { flexDirection: 'column', paddingX: 1, paddingY: 0 },
      React.createElement(Text, { color: 'cyanBright' }, title),
      React.createElement(Text, { color: 'gray' }, `Phase: ${phaseNumber} | Runner: ${runner} | Mode: ${mode}`),
      React.createElement(Box, { marginTop: 1, flexDirection: 'column' },
        ...stepStates.map((step) => React.createElement(StepRow, {
          key: step.key,
          step,
          active: step.key === activeKey,
        })),
      ),
      React.createElement(Box, { marginTop: 1, flexDirection: 'column' },
        React.createElement(Text, { color: 'yellow' }, 'Recent output:'),
        ...(logs.length === 0
          ? [React.createElement(Text, { key: 'none', color: 'gray' }, '- waiting -')]
          : logs.map((line, index) => React.createElement(Text, { key: `${index}-${line}` }, `- ${line}`))),
      ),
    )
  );
}

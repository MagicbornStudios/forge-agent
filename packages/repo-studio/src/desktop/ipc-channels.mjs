export const DESKTOP_IPC = {
  runtimeEvent: 'repo-studio:runtime:event',
  runtimeStatus: 'repo-studio:runtime:status',
  runtimeStop: 'repo-studio:runtime:stop',
  windowState: 'repo-studio:window:state',
  windowStateChanged: 'repo-studio:window:state-changed',
  windowMinimize: 'repo-studio:window:minimize',
  windowToggleMaximize: 'repo-studio:window:toggle-maximize',
  windowClose: 'repo-studio:window:close',
  projectPickFolder: 'repo-studio:project:pick-folder',
  authStatus: 'repo-studio:auth:status',
  authConnect: 'repo-studio:auth:connect',
  authDisconnect: 'repo-studio:auth:disconnect',
  authValidate: 'repo-studio:auth:validate',
};

export const DESKTOP_RUNTIME_EVENT_TYPES = {
  treeChanged: 'treeChanged',
  searchInvalidated: 'searchInvalidated',
  gitStatusInvalidated: 'gitStatusInvalidated',
  watcherHealth: 'watcherHealth',
};

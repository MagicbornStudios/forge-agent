export const DESKTOP_IPC = {
  runtimeEvent: 'repo-studio:runtime:event',
  runtimeStatus: 'repo-studio:runtime:status',
  runtimeStop: 'repo-studio:runtime:stop',
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

const { contextBridge, ipcRenderer } = require('electron');

const DESKTOP_IPC = {
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

function onRuntimeEvent(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  const wrapped = (_event, payload) => {
    listener(payload);
  };

  ipcRenderer.on(DESKTOP_IPC.runtimeEvent, wrapped);
  return () => {
    ipcRenderer.removeListener(DESKTOP_IPC.runtimeEvent, wrapped);
  };
}

function onWindowState(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  const wrapped = (_event, payload) => {
    listener(payload);
  };

  ipcRenderer.on(DESKTOP_IPC.windowStateChanged, wrapped);
  return () => {
    ipcRenderer.removeListener(DESKTOP_IPC.windowStateChanged, wrapped);
  };
}

contextBridge.exposeInMainWorld('repoStudioDesktop', {
  subscribeRuntimeEvents: onRuntimeEvent,
  subscribeWindowState: onWindowState,
  runtimeStatus: () => ipcRenderer.invoke(DESKTOP_IPC.runtimeStatus),
  stopRuntime: () => ipcRenderer.invoke(DESKTOP_IPC.runtimeStop),
  windowState: () => ipcRenderer.invoke(DESKTOP_IPC.windowState),
  windowMinimize: () => ipcRenderer.invoke(DESKTOP_IPC.windowMinimize),
  windowToggleMaximize: () => ipcRenderer.invoke(DESKTOP_IPC.windowToggleMaximize),
  windowClose: () => ipcRenderer.invoke(DESKTOP_IPC.windowClose),
  pickProjectFolder: () => ipcRenderer.invoke(DESKTOP_IPC.projectPickFolder),
  authStatus: () => ipcRenderer.invoke(DESKTOP_IPC.authStatus),
  authConnect: (payload) => ipcRenderer.invoke(DESKTOP_IPC.authConnect, payload || {}),
  authDisconnect: () => ipcRenderer.invoke(DESKTOP_IPC.authDisconnect),
  authValidate: (payload) => ipcRenderer.invoke(DESKTOP_IPC.authValidate, payload || {}),
});

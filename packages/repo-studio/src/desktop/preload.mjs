import { contextBridge, ipcRenderer } from 'electron';

import { DESKTOP_IPC } from './ipc-channels.mjs';

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

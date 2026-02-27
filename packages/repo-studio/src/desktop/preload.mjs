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

contextBridge.exposeInMainWorld('repoStudioDesktop', {
  subscribeRuntimeEvents: onRuntimeEvent,
  runtimeStatus: () => ipcRenderer.invoke(DESKTOP_IPC.runtimeStatus),
  stopRuntime: () => ipcRenderer.invoke(DESKTOP_IPC.runtimeStop),
  pickProjectFolder: () => ipcRenderer.invoke(DESKTOP_IPC.projectPickFolder),
  authStatus: () => ipcRenderer.invoke(DESKTOP_IPC.authStatus),
  authConnect: (payload) => ipcRenderer.invoke(DESKTOP_IPC.authConnect, payload || {}),
  authDisconnect: () => ipcRenderer.invoke(DESKTOP_IPC.authDisconnect),
  authValidate: (payload) => ipcRenderer.invoke(DESKTOP_IPC.authValidate, payload || {}),
});

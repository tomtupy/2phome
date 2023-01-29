import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    getSensorData() {
      ipcRenderer.send('GET_SENSOR_DATA', 'ping');
    },
    loadEarthImageryData() {
      ipcRenderer.send('LOAD_EARTH_IMAGERY_DATA', 'ping');
    },
    getDrywellImages() {
      ipcRenderer.send('GET_DRYWELL_IMAGES', 'ping');
    },
    on(channel: string, func: (...args: unknown[]) => void) {
      const validChannels = ['ipc-example', 'GET_SENSOR_DATA', 'LOAD_EARTH_IMAGERY_DATA', 'GET_DRYWELL_IMAGES'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
      return undefined;
    },
    once(channel: string, func: (...args: unknown[]) => void) {
      const validChannels = ['ipc-example', 'GET_SENSOR_DATA', 'LOAD_EARTH_IMAGERY_DATA', 'GET_DRYWELL_IMAGES'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (_event, ...args) => func(...args));
      }
    },
  },
});

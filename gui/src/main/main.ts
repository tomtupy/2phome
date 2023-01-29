/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath } from './util';
//import { SensorData } from '../db/SensorData';
import { Client } from 'pg'
import { loadImageryIntoLocalStorage } from './helpers/imagery_loader';
import { Imagery } from './constants';

const client = new Client({
  host: '192.168.0.69',
  port: 5432,
  user: 'tom',
  password: '',
  database: '2phome'
})

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

client.connect((err) => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})

let mainWindow: BrowserWindow | null = null;
//let sensorData: SensorData = new SensorData;



if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1366,
    height: 768,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      webSecurity: false,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });


  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  client.end((err) => {
    console.log('client has disconnected')
    if (err) {
      console.log('error during disconnection', err.stack)
    }
  })
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

ipcMain.on("LOAD_EARTH_IMAGERY_DATA", async (event, arg) => {
  try {
    const finalFileEntries = await loadImageryIntoLocalStorage(Imagery.LiveEarthView, mainWindow)
    event.reply("LOAD_EARTH_IMAGERY_DATA", finalFileEntries);
  } catch (e) {
    console.error(`Failed to load imagery data`, e)
    event.reply("LOAD_EARTH_IMAGERY_DATA", 'error');
  }
});

ipcMain.on("GET_DRYWELL_IMAGES", async (event, arg) => {
  try {
    const finalFileEntries = await loadImageryIntoLocalStorage(Imagery.Drywell, mainWindow)
    event.reply("GET_DRYWELL_IMAGES", finalFileEntries);
  } catch (e) {
    console.error(`Failed to load drywell imagery data`, e)
    event.reply("GET_DRYWELL_IMAGES", 'error');
  }
});

ipcMain.on("GET_SENSOR_DATA", (event, arg) => {
  console.log("IPC GET SENSOR DATA")
  client.query('SELECT * from sensor_data ORDER BY time DESC LIMIT 5', (err, res) => {
    if (err) throw err
    console.log("TOM PG DATA")
    console.log(res)
    event.reply("GET_SENSOR_DATA", res.rows);
    //client.end()
  })
});
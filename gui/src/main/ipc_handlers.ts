import { loadImageryIntoLocalStorage } from './helpers/imagery_loader';
import { Imagery } from './constants';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { Client } from 'pg';
import { spawn } from 'child_process';
import { executePythonScript } from './helpers/python_script';

export class IpcHandlers {
  mainWindow: BrowserWindow;
  pgClient: Client;
  app: Electron.App;

  constructor(mainWindow: BrowserWindow, app: Electron.App) {
    this.mainWindow = mainWindow;
    this.app = app;
    
    this.pgClient = new Client({
      host: '192.168.0.69',
      port: 5432,
      user: 'tom',
      password: '',
      database: '2phome',
    })
    
    this.pgClient.connect((err) => {
      if (err) {
        console.error('connection error', err.stack)
      } else {
        console.log('connected')
      }
    })
  }

  setup() {
    ipcMain.on("LOAD_EARTH_IMAGERY_DATA", async (event, arg) => {
      try {
        console.log("FETCHING EARTH IMAGERY")
        const finalFileEntries = await loadImageryIntoLocalStorage(Imagery.LiveEarthView, this.mainWindow)
        event.reply("LOAD_EARTH_IMAGERY_DATA", finalFileEntries);
        console.log("GOT EARTH IMAGERY")
      } catch (e) {
        console.error(`Failed to load imagery data`, e)
        event.reply("LOAD_EARTH_IMAGERY_DATA", 'error');
      }
    });
    
    ipcMain.on("GET_DRYWELL_IMAGES", async (event, arg) => {
      try {
        console.log("FETCHING DRYWELL IMAGERY")
        const finalFileEntries = await loadImageryIntoLocalStorage(Imagery.Drywell, this.mainWindow)
        event.reply("GET_DRYWELL_IMAGES", finalFileEntries);
      } catch (e) {
        console.error(`Failed to load drywell imagery data`, e)
        event.reply("GET_DRYWELL_IMAGES", 'error');
      }
    });
    
    ipcMain.on("GET_SENSOR_DATA", (event, arg) => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - 5); // subtract 5 mins
      const lowerTsBoundStr = this.getDateString(now);
      now.setMinutes(now.getMinutes() + 10); // add 10 mins
      const upperTsBoundStr = this.getDateString(now);

      console.log("IPC GET SENSOR DATA", lowerTsBoundStr, upperTsBoundStr)

      this.pgClient.query("SELECT DISTINCT ON (sensor_id) sensor_id, time, data, secondary_data, additional_data  FROM sensor_data where time > '" + lowerTsBoundStr + "' and time < '" + upperTsBoundStr + "' ORDER BY sensor_id, time DESC;", 
      (err, res) => {
        if (err) throw err
        console.log("TOM PG DATA")
        console.log(res)
        const parsedRows: SensorDataEntry[] = res.rows.map(row => (
            {
              'sensor_id': row['sensor_id'],
              'time': new Date(row['time']),
              'data': row['data'],
              'secondary_data': row['secondary_data'],
              'additional_data': row['additional_data']
            } as SensorDataEntry
          )
        )
        event.reply("GET_SENSOR_DATA", parsedRows);
        //client.end()
      })
    });

    ipcMain.on("EXEC_PYTHON", async (event, arg) => {
      try {
        var dataToSend: string = "";
        console.log("EXEC PYTHING SCRIPT", arg)
        //const finalFileEntries = await loadImageryIntoLocalStorage(Imagery.Drywell, this.mainWindow)
        const python = await spawn('python3', [arg, 'welcome', 'Duyen']);
        //console.log("SCRIPT RESULT", python)
        // collect data from script
        await python.stdout.on('data', function (data) {
          dataToSend = data.toString();
        });

        await python.stderr.on('data', data => {
          console.error(`stderr: ${data}`);
        });

        // in close event we are sure that stream from child process is closed
        await python.on('exit', (code) => {
          console.log(`child process exited with code ${code}, ${dataToSend}`);
          console.log("PYTHON DATA", dataToSend)
          event.reply("EXEC_PYTHON", dataToSend);
        })
      } catch (e) {
        console.error(`Failed to execute python script`, e)
        event.reply("EXEC_PYTHON", 'error');
      }
    });

    ipcMain.on("GET_PING_DATA", async (event, arg) => {
      await executePythonScript(event, 'GET_PING_DATA', '../ping.py')
    });

    app.on('window-all-closed', () => {
      // Respect the OSX convention of having the application in memory even
      // after all windows have been closed
      this.pgClient.end((err) => {
        console.log('client has disconnected')
        if (err) {
          console.log('error during disconnection', err.stack)
        }
      })
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  getDateString(ts: Date) {
    return ts.getFullYear() + '-' + ("0" + (ts.getMonth() + 1)).slice(-2) + '-' + ("0" + ts.getDate()).slice(-2) + ' ' + ("0" + ts.getHours()).slice(-2) + ':' + ("0" + (ts.getMinutes())).slice(-2) + ':00';
  }
}

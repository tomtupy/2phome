import { spawn } from 'child_process';


export const executePythonScript = async (event: Electron.IpcMainEvent, channel: string, script: string) => {
  console.group(`Exectuting python script ${script}`)
  try {
    var dataToSend: string = "";
    const python = await spawn('python3', [script]);
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
      event.reply(channel, dataToSend);
    })
  } catch (e) {
    console.error(`Failed to execute python script`, e)
    event.reply(channel, null);
  }
   console.groupEnd()
};
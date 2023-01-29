import * as fs from 'fs'
import { BrowserWindow } from 'electron';
import { fileTimestampParser, Imagery, imageryDir, imageryFilePrefix } from '../constants';


export const loadImageryIntoLocalStorage = async (imagery: Imagery, mainWindow: BrowserWindow | null) => {
  console.group(`Load ${imagery} Imagery Data`)
  const files = await fs.readdirSync(imageryDir[imagery])

  const fileTimestamps = files.map(file => fileTimestampParser[imagery](file))
  console.log(fileTimestamps)

  // get entries in localstorage
  let storageEntriesLength = await mainWindow?.webContents.executeJavaScript('localStorage.length', true)

  const validFileEntries: string[] = [];
  const oldStorageEntries: string[] = [];
  // separate valid/old entries
  console.log("Local Storage Length", storageEntriesLength)
  for (let i = 0; i < storageEntriesLength; i++) {
    const storageEntry = await mainWindow?.webContents.executeJavaScript(`localStorage.key(${i})`, true)
    if (storageEntry.startsWith(imageryFilePrefix[imagery])) {
      const entryTimestamp = storageEntry.replace(imageryFilePrefix[imagery], '')
      if (fileTimestamps.includes(entryTimestamp)) {
        validFileEntries.push(entryTimestamp)
      } else {
        oldStorageEntries.push(storageEntry)
      }
    }
  }
  // delete old entries
  let filesDeleted = 0
  for (const oldStorageEntry of oldStorageEntries) {
    //console.log(`Deleting ${oldStorageEntry} from Local Storage`)
    await mainWindow?.webContents.executeJavaScript(`localStorage.removeItem("${oldStorageEntry}")`, true)
    filesDeleted += 1
  }
  console.log(`Deleted ${filesDeleted} old images`)

  // load new images
  let filesLoaded = 0
  for (const imageFile of files) {
    const fileTimestamp = fileTimestampParser[imagery](imageFile)

    if (!validFileEntries.includes(fileTimestamp)) {
      try {
        const fileData = await fs.readFileSync( `${imageryDir[imagery]}/${imageFile}`, {encoding: 'base64'})
        const localStorageEntryKey = imageryFilePrefix[imagery] + fileTimestamp
        //console.log(`Loading ${imageFile} into Local Storage with size ${fileData.length}`)
        await mainWindow?.webContents.executeJavaScript(`localStorage.setItem("${localStorageEntryKey}", "data:image/jpeg;charset=utf-8;base64, ${fileData}")`, true)
        filesLoaded += 1
      } catch (e) {
        console.error(`Failed to load ${imageFile}`, e)
      }
    }
  }
  console.log(`Loaded ${filesLoaded} new images`)
  console.groupEnd()

  const finalFileEntries: string[] = [];
  // get entries in localstorage
  storageEntriesLength = await mainWindow?.webContents.executeJavaScript('localStorage.length', true)
  for (let i = 0; i < storageEntriesLength; i++) {
    const storageEntry = await mainWindow?.webContents.executeJavaScript(`localStorage.key(${i})`, true)
    if (storageEntry.startsWith(imageryFilePrefix[imagery])) {
      finalFileEntries.push(storageEntry)
    }
  }
  finalFileEntries.sort()
  return finalFileEntries
};
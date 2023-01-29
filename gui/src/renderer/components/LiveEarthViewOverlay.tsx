import React from 'react';
import { useEffect } from "react";
import { useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import moment from "moment"
import { ProgressBar, Stack } from 'react-bootstrap';


const getLiveDelay = (currentTime: number, latestImageTimestamp: number) => {
  var seconds = moment.unix(currentTime).diff(moment.unix(latestImageTimestamp), 'seconds')
  let formatted = `${seconds}`
  if (seconds >= 60) {
    formatted = moment.utc(seconds*1000).format('mm:ss');
  } else if (seconds >= 3600) {
    formatted = moment.utc(seconds*1000).format('HH:mm:ss');
  } else if (seconds >= 86400) {
    formatted = `${Math.floor(seconds / 86400)} day(s) and ${moment.utc(seconds*1000).format('HH:mm:ss')}`;
  }
  return `${formatted}`
}

const getRefreshDelayPct = (fetchIntervalSec: number, currentTime: number, lastFetchTimestamp: number) => {
  return moment.unix(currentTime).diff(moment.unix(lastFetchTimestamp), 'seconds') / fetchIntervalSec * 100
}

const getImageTimestamp = (currentAnimationIndex: number, imageFiles: string[]) => {
  const file = imageFiles[currentAnimationIndex]
  if (file) {
    return moment.utc(file.replace("lev_", ''), 'YYYYDDDHHmm').local().format("HH:mm")
  }
  return ''
}

const LiveEarthViewOverlay = () => {
  const { currentAnimationIndex, imageFiles, lastFetchTimestamp, latestImageTimestamp, fetchIntervalSec } = useSelector((state: RootState) => state.liveEarthView)
  const [currentTime, setCurrentTime] = React.useState(Math.floor(Date.now() / 1000));

  // clock
  useEffect(() => {
    setInterval(
      () => setCurrentTime(Math.floor(Date.now() / 1000)),
      1000
    )
  }, []);

  return (
    <div style={{
      position: 'absolute',
      backgroundColor: 'rgba(53, 56, 68, 0.9)',
      padding: '0px 10px',
      color: 'white',
      bottom: 0,
      fontSize: 'smaller',
      height: '22px',
      width: '600px',
      borderBottomLeftRadius: '0.375rem',
      borderBottomRightRadius: '0.375rem'
    }}>
      <Stack direction="horizontal" gap={2}>
        <span style={{
          height: '11px',
          width: '11px',
          backgroundColor: 'rgb(177 45 45)',
          borderRadius: '50%',
          display: 'inline-block',
      }}></span>
        Live Delay: {getLiveDelay(currentTime, latestImageTimestamp)}
        <span style={{marginLeft: '5px', width: '50px'}}>
          <ProgressBar style={{backgroundColor: 'rgba(0, 0, 0, 0.22)', height: '11px'}} striped variant="success" now={getRefreshDelayPct(fetchIntervalSec, currentTime, lastFetchTimestamp)} />
        </span>
        <span style={{marginLeft: '5px', width: '50px', right: 40, position: 'absolute'}}>{getImageTimestamp(currentAnimationIndex, imageFiles)}</span>
        <span style={{marginLeft: '5px', width: '50px', right: 0, position: 'absolute'}}>({currentAnimationIndex}/{imageFiles.length})</span>
      </Stack>
    </div>
  );
}


export default LiveEarthViewOverlay

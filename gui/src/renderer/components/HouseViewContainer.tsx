import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'renderer/redux/store';
import { sensorData } from 'renderer/redux/reducers/sensorDataSlice';
import { DataFetchStatus } from 'renderer/constants';

// function getSensorData() {
//   console.log("GETTING SENSOR DATA")
//   window.electron.ipcRenderer.once("GET_SENSOR_DATA", 
//     (_, sensorDataResponse)=> {
//       console.log("GET SENSOR DATA")
//       console.log(sensorDataResponse)
//     }
//   ); 
// };

function HouseViewContainer() {
  const dispatch : AppDispatch = useDispatch<AppDispatch>();
  const containerId = "lightweight_chart_container"
  let chart = null; 
  const width = 300;
  const height = 100;


  const getSensorData = () => {
    dispatch(sensorData.actions.setSensorDataFetchStatus(DataFetchStatus.IN_PROGRESS))
    //window.electron.ipcRenderer.loadEarthImageryData();
    window.electron.ipcRenderer.once('GET_SENSOR_DATA', (image_list) => {
      //console.log("SENSOR DATA: ", image_list)
      if (Array.isArray(image_list)) {
        dispatch(sensorData.actions.setSensorData(image_list))
        dispatch(sensorData.actions.setSensorDataFetchStatus(DataFetchStatus.SUCCESS))
      } else {
        dispatch(sensorData.actions.setSensorDataFetchStatus(DataFetchStatus.FAILED))
      } 
    });
  }

  // useEffect(() => {
  //   // Delete the existing graph if already exists
  //   let element = document.querySelector('.tv-lightweight-charts')
  //   if(element) {
  //     element.parentNode.removeChild(element)
  //   }

  //   // chart = createChart(
  //   //   containerId,
  //   //   {
  //   //     width: width,
  //   //     height: height,
  //   //   },
  //   //   [width, height]
  //   // );

  //   // const lineSeries = chart.addLineSeries();

  //   // const barSeries = chart.addBarSeries({
  //   //   thinBars: false
  //   // });

  //   lineSeries.setData([
  //     { time: "2019-04-10", value: 60.01 },
  //     { time: "2019-04-11", value: 80.01 }
  //   ]);

  //   // set the data
  //   barSeries.setData([
  //     {
  //       time: "2019-04-10",
  //       open: 141.77,
  //       high: 170.39,
  //       low: 120.25,
  //       close: 145.72
  //     },
  //     {
  //       time: "2019-04-11",
  //       open: 145.72,
  //       high: 147.99,
  //       low: 100.11,
  //       close: 108.19
  //     },
  //     {
  //       time: "2019-04-12",
  //       open: 161.19,
  //       high: 192.99,
  //       low: 100.11,
  //       close: 173.19
  //     }
  //   ]);
  // }, [width, height]);

  getSensorData();
  //return (<div id={containerId}></div>);
  return (<div></div>);
}

export default HouseViewContainer

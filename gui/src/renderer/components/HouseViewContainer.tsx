import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'renderer/redux/store';
import { sensorData } from 'renderer/redux/reducers/sensorDataSlice';
import { DataFetchStatus } from 'renderer/constants';
import { rainbow } from '@indot/rainbowvis';
import { Card } from 'react-bootstrap';
import { useEffect, useRef } from 'react';
import { MDBIcon } from 'mdb-react-ui-kit';
import Rainbow from 'rainbowvis.js';


function HouseViewContainer() {
  const dispatch : AppDispatch = useDispatch<AppDispatch>();

  const { dataFetchStatus, data, fetchIntervalSec } = useSelector((state: RootState) => state.sensorData)
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const colorGradient = rainbow()
  // https://mycolor.space/gradient3?ori=to+left&hex=%23FF3700&hex2=%2300B928&hex3=%232100FF&submit=submit
  colorGradient.setSpectrum('#ea5f26', '#e47d13', '#db970a', '#ceb01c', '#bec639', '#98d157', '#6dda7a', '#2ce0a1', '#00dacd', '#00cfef', '#00c0ff', '#62aefc');
  colorGradient.setNumberRange(0,150);

  const getSensorData = async () => {
    dispatch(sensorData.actions.setSensorDataFetchStatus(DataFetchStatus.IN_PROGRESS))
    window.electron.ipcRenderer.getSensorData();
    window.electron.ipcRenderer.once('GET_SENSOR_DATA', (sensor_data_list) => {
      console.log("SENSOR DATA: ", sensor_data_list)
      if (Array.isArray(sensor_data_list)) {
        dispatch(sensorData.actions.setSensorData(sensor_data_list))
        dispatch(sensorData.actions.setSensorDataFetchStatus(DataFetchStatus.SUCCESS))
      } else {
        dispatch(sensorData.actions.setSensorDataFetchStatus(DataFetchStatus.FAILED))
      } 
    });
  }
  

  useEffect(() => {
    getSensorData()
    setInterval(
      () => getSensorData(),
      5 * 1000
    )
    
  }, []);

  useEffect(() => {
    drawHouseOutline();
  }, []);

  useEffect(() => {
    if (Object.keys(data).length == 0) {
      return;
    }
  
    drawFillFarSouth(data[1238].data);

    drawFillSouth(data[1239].data);

    drawFillFarNorth(data[1240].data);

    drawFillNorth(data[1237].data, data[1237].secondary_data);

    drawFillWest(data[1236].data, data[1236].secondary_data);

    drawFarWest(data[1235].data);
  }, [data]);

  const drawHouseOutline = () => { 
    const canvasEle = canvas.current;
    const ctx = canvasEle!.getContext("2d");

    ctx!.moveTo(91,11);
    ctx?.lineTo(174,11);
    ctx?.lineTo(174,153);
    ctx?.lineTo(192,153);
    ctx?.lineTo(192,243);
    ctx?.lineTo(127,243);
    ctx?.lineTo(127,125);
    ctx?.lineTo(97,125);
    ctx?.lineTo(93,129);
    ctx?.lineTo(93,145);
    ctx?.lineTo(56,145);
    ctx?.lineTo(56,129);
    ctx?.lineTo(49,129);
    ctx?.lineTo(45,135);
    ctx?.lineTo(25,135);
    ctx?.lineTo(20,129);
    ctx?.lineTo(12,129);
    ctx?.lineTo(12,72);
    ctx?.lineTo(91,72);
    ctx?.lineTo(91,11);
    
    ctx!.strokeStyle = "black";
    ctx!.lineWidth = 2;
    ctx!.lineJoin = ctx!.lineCap = "round";
    ctx?.stroke();
  }

  const drawFarWest = (temperature: number) => {
    const canvasEle = canvas.current;
    const ctx = canvasEle!.getContext("2d");

    ctx?.beginPath();
    ctx?.moveTo(13,73);
    ctx?.lineTo(69,73);
    ctx?.lineTo(69,144);
    ctx?.lineTo(57,144);
    ctx?.lineTo(57,128);
    ctx?.lineTo(48,128);
    ctx?.lineTo(44,134);
    ctx?.lineTo(26,134);
    ctx?.lineTo(21,128);
    ctx?.lineTo(13,128);
    ctx?.lineTo(13,128);
    ctx?.lineTo(13,73);
    ctx?.closePath();

    const temperatureInt = Math.round(temperature);

    ctx!.strokeStyle = "white";
    ctx!.lineWidth = 1;
    ctx!.lineJoin = ctx!.lineCap = "round";
    ctx!.fillStyle = '#' + colorGradient.colorAt(temperatureInt);
    ctx!.fill();

    ctx!.fillStyle = "black";
    ctx!.fillText(temperatureInt.toString() + "°F", 31, 105);
  }

  const drawFillWest = (temperature: number, humidity: number) => {
    const canvasEle = canvas.current;
    const ctx = canvasEle!.getContext("2d");

    ctx?.beginPath();
    ctx?.moveTo(69,73);
    ctx?.lineTo(118,73);
    ctx?.lineTo(118,124);
    ctx?.lineTo(96,124);
    ctx?.lineTo(92,128);
    ctx?.lineTo(92,144);
    ctx?.lineTo(69,144);
    ctx?.closePath();

    const temperatureInt = Math.round(temperature);

    ctx!.strokeStyle = "white";
    ctx!.lineWidth = 1;
    ctx!.lineJoin = ctx!.lineCap = "round";
    ctx!.fillStyle = '#' + colorGradient.colorAt(temperatureInt);
    ctx!.fill();

    ctx!.fillStyle = "black";
    ctx!.fillText(temperatureInt.toString() + "°F", 83, 99);
    ctx!.fillText(Math.round(humidity).toString() + "%", 83, 110);
  }

  const drawFillSouth = (temperature: number) => {
    const canvasEle = canvas.current;
    const ctx = canvasEle!.getContext("2d");

    ctx?.beginPath();
    ctx?.moveTo(173,100);
    ctx?.lineTo(173,154);
    ctx?.lineTo(191,154);
    ctx?.lineTo(191,177);
    ctx?.lineTo(128,177);
    ctx?.lineTo(128,124);
    ctx?.closePath();

    const temperatureInt = Math.round(temperature);

    ctx!.strokeStyle = "white";
    ctx!.lineWidth = 1;
    ctx!.lineJoin = ctx!.lineCap = "round";
    ctx!.fillStyle = '#' + colorGradient.colorAt(temperatureInt);
    ctx!.fill();

    ctx!.fillStyle = "black";
    ctx!.fillText(temperatureInt.toString() + "°F", 140, 147);
  }

  const drawFillFarSouth = (temperature: number) => {
    const canvasEle = canvas.current;
    const ctx = canvasEle!.getContext("2d");
    
    ctx?.beginPath();
    ctx?.moveTo(191,177);
    ctx?.lineTo(191,242);
    ctx?.lineTo(128,242);
    ctx?.lineTo(128,177);
    ctx?.closePath();

    const temperatureInt = Math.round(temperature);

    ctx!.strokeStyle = "white";
    ctx!.lineWidth = 1;
    ctx!.lineJoin = ctx!.lineCap = "round";
    ctx!.fillStyle = '#' + colorGradient.colorAt(temperatureInt);
    ctx!.fill();

    ctx!.fillStyle = "black";
    ctx!.fillText(temperatureInt.toString() + "°F", 147, 220);
  }

  const drawFillNorth = (temperature: number, humidity: number) => {
    const canvasEle = canvas.current;
    const ctx = canvasEle!.getContext("2d");

    ctx?.beginPath();
    ctx?.moveTo(118,73);
    ctx?.lineTo(173,73);
    ctx?.lineTo(173,100);
    ctx?.lineTo(128,124);
    ctx?.lineTo(118,124);
    ctx?.closePath();

    const temperatureInt = Math.round(temperature);

    ctx!.strokeStyle = "white";
    ctx!.lineWidth = 1;
    ctx!.lineJoin = ctx!.lineCap = "round";
    ctx!.fillStyle = '#' + colorGradient.colorAt(temperatureInt);
    ctx!.fill();

    ctx!.fillStyle = "black";
    ctx!.fillText(temperatureInt.toString() + "°F", 133, 94);
    ctx!.fillText(Math.round(humidity).toString() + "%", 133, 104);
  }

  const drawFillFarNorth = (temperature: number) => {
    const canvasEle = canvas.current;
    const ctx = canvasEle!.getContext("2d");

    ctx?.beginPath();
    ctx?.moveTo(92,73);
    ctx?.lineTo(173,73);
    ctx?.lineTo(173,12);
    ctx!.lineTo(92,12);
    ctx?.closePath();

    const temperatureInt = Math.round(temperature);

    ctx!.strokeStyle = "white";
    ctx!.lineWidth = 1;
    ctx!.lineJoin = ctx!.lineCap = "round";
    ctx!.fillStyle = '#' + colorGradient.colorAt(temperatureInt);
    ctx!.fill();

    ctx!.fillStyle = "black";
    ctx!.fillText(temperatureInt.toString() + "°F", 123, 45);
  }


  return (
    <>
      <Card text='white' style={{width: '205px', height: '290px', paddingTop: '10px', backgroundColor: '#515151'}}>
        <Card.Body style={{padding: 0}}>
          <div style={{paddingLeft: '20px', fontSize: '1.0em'}}>
            <MDBIcon
              fas
              icon="temperature-three-quarters fa-fw"
              style={{ color: "#868B94" }}
            />{" "}
            <span>Attic Temps</span>
          </div>
          <canvas ref={canvas} width={205} height={290}></canvas>
        </Card.Body>
      </Card>
    </>
  );
}

export default HouseViewContainer

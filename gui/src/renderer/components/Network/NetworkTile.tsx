import React from 'react';
import { useEffect } from "react";
import { Card, Col, Row } from 'react-bootstrap';
import {  MDBIcon } from 'mdb-react-ui-kit';
import { Sparklines, SparklinesLine, SparklinesNormalBand, SparklinesSpots } from 'react-sparklines';

const PING_VALUE_RETENTION_MAX = 60

function NetworkTile() {
  //const [thermostatData, setThermostatData] = React.useState<String | null>(null)
  const [pingData, setPingData] = React.useState<number[]>([])

  const getPingData = async () => {
    window.electron.ipcRenderer.getPingData();
    window.electron.ipcRenderer.once('GET_PING_DATA', (ping_data) => {
      const pingValue = parseFloat((ping_data as string).split(' ')[0])
      console.log("PYTHON VAL: ", pingValue)
      if (typeof pingValue === 'number') {
        setPingData(oldArray => [...oldArray, pingValue]);
      }
      setPingData(oldArray => oldArray.filter((_, i) => oldArray.length > PING_VALUE_RETENTION_MAX ? i !== 0 : true))
    });
  }

  useEffect(() => {
    getPingData()
    setInterval(
      () => getPingData(),
      5 * 1000
    )
  }, []);

  const average = (array: number[]) => (array.length > 0 ? array.reduce((a, b) => a + b) / array.length : 0);

  return (
    <>
        <Card text='white' className='sidebar-card' style={{height: '145px'}}>
          <Card.Body style={{paddingTop: 10, paddingLeft: 0, paddingRight: 0}}>
          <Row style={{margin: 0}}>
              <Col>
                <div style={{fontSize: '1.0em', paddingLeft: '10px'}}>
                  <MDBIcon
                    fas
                    icon="house-signal fa-fw"
                    style={{ color: "#868B94" }}
                  />{" "}   
                  <span>Network</span>
                </div>
              </Col>
            </Row>
            <Row style={{margin: 0}}>
              <Col style={{padding: 0}}>
                <div style={{textAlign: 'center', paddingTop: '10px'}}>
                <Sparklines data={pingData} limit={5} width={100} height={20} margin={5} style={{background: "#535353"}}>
                    <SparklinesLine color="blue" />
                    <SparklinesSpots />
                    <SparklinesNormalBand style={{ fill: "#2991c8", fillOpacity: .1 }} />
                </Sparklines>
                </div>
              </Col>
            </Row>
            <Row style={{margin: 0}}>
              <Col>
                <div style={{textAlign: 'center', paddingTop: '6px'}}>
                  <span style={{ color: "#868B94", fontSize: '0.8em', display: 'grid' }}>
                    <span>Min/Avg/Max:</span>
                    <span>{Math.min(...pingData).toFixed(2)}/{average(pingData).toFixed(2)}/{Math.max(...pingData).toFixed(2)} ms</span>
                  </span>
                </div>
              </Col>
            </Row>
            <Row style={{margin: 0}}>
              <Col>
                <div style={{textAlign: 'center', paddingTop: '0px'}}>
                  <span style={{ color: "rgb(205 205 205)", fontSize: '0.83em', fontWeight: '500', display: 'grid' }}>
                    <span>Last: {pingData.slice(-1)} ms ({pingData.length})</span>
                  </span>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
    </>
  );
}

export default NetworkTile

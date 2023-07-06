import React from 'react';
import { useEffect } from "react";
import { Card, Col, Row } from 'react-bootstrap';
import { MDBTypography, MDBIcon } from 'mdb-react-ui-kit';

function ThermostatTile() {
  const [thermostatData, setThermostatData] = React.useState<String[] | null>(null)

  const getThermostatData = async () => {
    window.electron.ipcRenderer.execPythonScript("../wyze.py");
    window.electron.ipcRenderer.once('EXEC_PYTHON', (thermostat_data) => {
      var split_themostat_data = (thermostat_data as String).split(",")
      var parsed_thermostat_data = split_themostat_data.map(val => val.trim())
      console.log("PYTHON DATA: ", parsed_thermostat_data)
      setThermostatData(parsed_thermostat_data)
    });
  }

  useEffect(() => {
    getThermostatData()
    setInterval(
      () => getThermostatData(),
      60 * 1000
    )
  }, []);

  if (!thermostatData || thermostatData?.length < 4) {
    return (<></>)
  }

  return (
    <>
        <Card text='white' className='sidebar-card' style={{height: '145px'}}>
          <Card.Body style={{paddingTop: 10, paddingLeft: 0, paddingRight: 0}}>
          <Row style={{margin: 0}}>
              <Col>
                <div style={{fontSize: '1.0em'}}>
                  <MDBIcon
                    fas
                    icon="fire fa-fw"
                    style={{ color: "#868B94" }}
                  />{" "}
                  <span>Thermostat</span>
                </div>
              </Col>
            </Row>
            <Row style={{margin: 0}}>
              <Col>
                <div style={{textAlign: 'center', paddingTop: '3px'}}>
                  <MDBTypography
                    tag="h5"
                    className="font-weight-bold"
                    style={{marginBottom: 0}}
                  >
                    {" "}
                    {thermostatData![0]}°F{" "}
                  </MDBTypography>
                </div>
              </Col>
            </Row>       
            <Row style={{paddingLeft: '30px', paddingTop: '8px'}}>
              <Col>
                <div style={{margin: 0, display: 'flex'}}>
                  <div style={{fontSize: '0.8em'}}>
                    <MDBIcon
                      fas
                      icon="temperature-arrow-up fa-fw"
                      style={{ color: "#868B94" }}
                    />
                    <span className="ms-1">
                    {thermostatData![2]}°F{" "}
                    </span>
                  </div>
                  <div style={{marginLeft: '10px', fontSize: '0.8em'}}>
                    <MDBIcon
                      fas
                      icon="droplet fa-fw"
                      style={{ color: "#868B94" }}
                    />
                    <span className="ms-1">
                    {thermostatData![1]}%{" "}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
            <Row style={{paddingLeft: '30px'}}>
              <Col>
                <div style={{margin: 0, display: 'flex'}}>
                  <div style={{fontSize: '0.8em'}}>
                    <MDBIcon
                      fas
                      icon="fire fa-fw"
                      style={{ color: "#868B94" }}
                    />
                    <span className="ms-1">
                    {thermostatData![3]}{" "}
                    </span>
                  </div>
                  <div style={{marginLeft: '10px', fontSize: '0.8em'}}>
                    <MDBIcon
                      fas
                      icon="fan fa-fw"
                      style={{ color: "#868B94" }}
                    />
                    <span className="ms-1">
                    {thermostatData![4]}{" "}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
            <Row style={{paddingLeft: '30px'}}>
              <Col>
                <div style={{fontSize: '0.8em'}}>
                  <MDBIcon
                    fas
                    icon="user fa-fw"
                    style={{ color: "#868B94" }}
                  />{" "}
                  <span className="ms-1">
                  {thermostatData![5]}{" "}
                  </span>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
    </>
  );
}

export default ThermostatTile

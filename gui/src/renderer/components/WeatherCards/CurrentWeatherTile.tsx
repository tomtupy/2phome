import moment from 'moment';
import { Card, Col, Row } from 'react-bootstrap';
import { MDBTypography, MDBIcon } from 'mdb-react-ui-kit';
import Highcharts from 'highcharts';
import { WEATHER_CODE_MAP } from './constants';
import AnnotationsFactory from "highcharts/modules/annotations";
import { RootState } from 'renderer/redux/store';
import { useSelector } from 'react-redux';
AnnotationsFactory(Highcharts);

function CurrentWeatherTile() {
  const { weatherData } = useSelector((state: RootState) => state.weatherData)


  const getHourlyIndex = () => {
    var m = moment();
    var currentHour = m.startOf('hour').format('YYYY-MM-DDTHH:mm');
    return weatherData?.hourly?.time.findIndex(e => e === currentHour)
  }

  if (!weatherData) {
    return (<></>)
  }

  return (
    <>
        <Card text='white' className='sidebar-card' style={{ height: '145px'}}>
          <Card.Body style={{padding: 10}}>
            <Row style={{margin: 0}}>
              <Col>
                <div style={{textAlign: 'center', paddingTop: '10px'}}>
                  <MDBTypography
                    tag="h4"
                    className="font-weight-bold"
                    style={{marginBottom: 0}}
                  >
                    {" "}
                    {weatherData?.current_weather?.temperature}°F{" "}
                  </MDBTypography>
                  <span style={{ color: "#868B94", fontSize: '0.8em' }}>
                    {WEATHER_CODE_MAP[weatherData!.current_weather.weathercode]?.at(0)}
                  </span>
                </div>
              </Col>
            </Row>
            <Row style={{marginLeft: '7px'}}>
              <Col>
                <div style={{fontSize: '0.8em'}}>
                  <MDBIcon
                    fas
                    icon="wind fa-fw"
                    style={{ color: "#868B94" }}
                  />{" "}
                  <span>{weatherData!.current_weather?.windspeed} mph {" -> "} {weatherData!.current_weather?.winddirection}°</span>
                </div>
              </Col>
            </Row>
            <Row style={{marginLeft: '7px'}}>
              <Col>
                <div style={{fontSize: '0.8em'}}>
                  <MDBIcon
                    fas
                    icon="tint fa-fw"
                    style={{ color: "#868B94" }}
                  />{" "}
                  <span>{weatherData!.hourly.relativehumidity_2m[getHourlyIndex()!]}% {" -- "} {weatherData!.hourly.dewpoint_2m[getHourlyIndex()!]}°F</span>
                </div>
              </Col>
            </Row>
            <Row style={{marginLeft: '7px'}}>
              <Col>
                <div style={{fontSize: '0.8em'}}>
                  <MDBIcon
                    fas
                    icon="sun fa-fw"
                    style={{ color: "#868B94" }}
                  />{" "}
                  <span className="ms-1">
                    {weatherData!.daily.sunrise.find(e => e.startsWith(moment().format('YYYY-MM-DD')))!.split('T')[1]}
                    {" - "}
                    {weatherData!.daily.sunset.find(e => e.startsWith(moment().format('YYYY-MM-DD')))!.split('T')[1]}
                  </span>
                </div>
              </Col>
            </Row>                  
          </Card.Body>
        </Card>
    </>
  );
}

export default CurrentWeatherTile

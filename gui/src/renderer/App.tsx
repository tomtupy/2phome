import LiveEarthViewContainer from './components/LiveEarthViewContainer';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Col, Container, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import LiveEarthViewOverlay from './components/LiveEarthViewOverlay';
import { WEATHER_API_URL } from './components/WeatherCards/constants';
import { useEffect } from 'react';
import { AppDispatch } from './redux/store';
import { useDispatch } from 'react-redux';
import { weatherData } from './redux/reducers/weatherSlice';
import { DataFetchStatus } from './constants';
import WeatherForecastTile from './components/WeatherCards/WeatherForecastTile';
import CurrentWeatherTile from './components/WeatherCards/CurrentWeatherTile';
import ThermostatTile from './components/Thermostat/ThermostatTile';
import NetworkTile from './components/Network/NetworkTile';


const _2pHome = () => {
  const dispatch : AppDispatch = useDispatch<AppDispatch>();

  const getWeatherData = () => {
    dispatch(weatherData.actions.setWeatherDataFetchStatus(DataFetchStatus.IN_PROGRESS))
    fetch(WEATHER_API_URL)
    .then(response => response.json())
    .then(data =>  {
      dispatch(weatherData.actions.setWeatherData(data))
      dispatch(weatherData.actions.setWeatherDataFetchStatus(DataFetchStatus.SUCCESS))
    }).catch(() => {
      dispatch(weatherData.actions.setWeatherDataFetchStatus(DataFetchStatus.FAILED))
    })
  }
  
  useEffect(() => {
    getWeatherData()
    setInterval(
      () => getWeatherData(),
      30 * 1 * 1000
    )
  }, []);

  return (
    <Container style={{margin: 0, width: '1366px', height: '768px', padding: 0}}>
      <Row style={{width: '1366px', margin: 0, padding: 0}}>
        <Col style={{width: '593px',backgroundColor: '#282c34', flex: 'none', marginRight: '5px', padding: '3px'}} className='sidebar-wrapper'>
          <div style={{margin: 0, display: 'flex'}}>
            <div style={{padding: 0, marginRight: '3px'}}>
              <CurrentWeatherTile />
            </div>
            <div style={{padding: 0, marginRight: '3px'}}>
              <ThermostatTile />
            </div>
            <div style={{padding: 0, marginRight: '3px'}}>
              <NetworkTile />
            </div>
          </div>
          <Row style={{margin: 0}}>
            <Col style={{paddingLeft: 0, paddingRight: 0}}>
              <WeatherForecastTile />
            </Col>
          </Row>
        </Col>
        <Col style={{width: '768px', height: '768px',padding: '0px', backgroundColor: '#515151', flex: 'none', borderRadius: '0.375rem'}}>
          <div style={{margin: 0, padding: 0}}>
            <LiveEarthViewContainer />
            <LiveEarthViewOverlay />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<_2pHome />} />
      </Routes>
    </Router>
  );
}

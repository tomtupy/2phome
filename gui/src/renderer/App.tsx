import LiveEarthViewContainer from './components/LiveEarthViewContainer';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HouseViewContainer from './components/HouseViewContainer';
import { Card, Col, Container, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import LiveEarthViewOverlay from './components/LiveEarthViewOverlay';
import DrywellViewContainer from './components/DrywellViewContainer';
import WeatherCards from './components/WeatherCards/WeatherCards';

const _2pHome = () => {
  return (
    <Container style={{margin: 0, padding: '5px'}}>
      <Row>
        <Col style={{width: '640px'}}>
          <Row style={{margin: 0}}>
            <WeatherCards />
          </Row>
          <Row style={{paddingTop: '5px'}}>
            <Col>
              <Card text='white' style={{width: '602px', height: '607px', backgroundColor: '#282c34'}}>
                <Card.Body style={{padding: 1}}>
                  <LiveEarthViewContainer />
                  <LiveEarthViewOverlay />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
        </Col>
        <Col>
          <HouseViewContainer />
          <Card text='white' style={{width: '312px', height: '440px', backgroundColor: '#282c34'}}>
            <Card.Body style={{padding: 5}}>
              <DrywellViewContainer />
            </Card.Body>
          </Card>
          
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

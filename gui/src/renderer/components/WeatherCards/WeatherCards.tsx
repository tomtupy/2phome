import React from 'react';
import { useEffect } from "react";
import moment from 'moment';
import { Card, Col, Row } from 'react-bootstrap';
import { MDBTypography, MDBIcon } from 'mdb-react-ui-kit';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { FORECAST_CHART_OPTIONS, WEATHER_API_URL, WEATHER_CODE_MAP } from './constants';
import { OpenMetroResponse } from './types';
import AnnotationsFactory from "highcharts/modules/annotations";
AnnotationsFactory(Highcharts);

function WeatherCards() {
  const [chartInstance, setChartInstance] = React.useState<Highcharts.Chart | null>(null)
  const [weatherData, setWeatherData] = React.useState<OpenMetroResponse | null>(null);

  const getWeatherData = () => {
    fetch(WEATHER_API_URL)
    .then(response => response.json())
    .then(data =>  {setWeatherData(data)});
  }

  useEffect(() => {
    getWeatherData()
    getHourlyIndex()
    setInterval(
      () => getWeatherData(),
      30 * 1 * 1000
    )
  }, []);

  useEffect(() => {
    if (!weatherData) {
      return
    }
    if (!chartInstance) {
      return
    }
    const max_temp = Math.max.apply(Math, weatherData.hourly.temperature_2m)
    const min_temp = Math.min.apply(Math, weatherData.hourly.temperature_2m)
    const min_temp_index = weatherData.hourly.temperature_2m.indexOf(min_temp)
    const max_temp_index = weatherData.hourly.temperature_2m.indexOf(max_temp)
    const weather_icons = weatherData.hourly.time.filter(t => moment(t,'YYYY-MM-DDTHH:mm').hour() === 12).map((t, i) => ({x: moment(t,'YYYY-MM-DDTHH:mm').subtract(8, 'hours').toDate().getTime(), y: max_temp + 3, marker: {
      symbol: WEATHER_CODE_MAP[weatherData.daily.weathercode[i]]?.at(1)
  }}) )
    const temp_data = weatherData.hourly.time.map((t, i) => ({x: moment(t,'YYYY-MM-DDTHH:mm').subtract(8, 'hours').toDate().getTime(), y: weatherData.hourly.temperature_2m.at(i), id: (i == min_temp_index ? 'min' : (i == max_temp_index ? 'max' : `item${i}`))}) )

    chartInstance.series[0].setData(temp_data)
    chartInstance.series[1].setData(weather_icons)
    chartInstance.axes[1].setExtremes(min_temp - 5, max_temp + 9)
    chartInstance.addAnnotation({
      labels: [{
        point: 'min',
        shape: 'callout',
        text: `${min_temp}°F`,
        y: -15,
        backgroundColor: 'rgba(40,40,40,0.7)'
      }]
    })
    chartInstance.addAnnotation({
      labels: [{
        point: 'max',
        text: `${max_temp}°F`,
        y: 30,
        shape: 'callout',
        backgroundColor: 'rgba(40,40,40,0.7)'
      }]
    })

  }, [weatherData, chartInstance]);

  const afterChartCreated: Highcharts.ChartCallbackFunction = (chart) => {
    setChartInstance(chart)
  }

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
      <Col style={{paddingRight: 0, paddingLeft: 0}}>
        <Card text='white' style={{width: '160px', height: '145px', backgroundColor: '#282c34'}}>
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
            <Row>
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
            <Row>
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
            <Row>
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
      </Col>
      <Col style={{paddingLeft: '5px', paddingRight: 0}}>
        <Card text='white' style={{width: '437px', height: '145px', backgroundColor: '#282c34'}}>
          <Card.Body style={{padding: 0}}>
            <Row style={{margin: 0, marginLeft: "-12px", marginRight: "-12px"}}>
              <HighchartsReact
                highcharts={Highcharts}
                options={FORECAST_CHART_OPTIONS}
                callback={ afterChartCreated }
              />
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </>
  );
}

export default WeatherCards

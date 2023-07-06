import React from 'react';
import { useEffect } from "react";
import moment from 'moment';
import { Card, Row } from 'react-bootstrap';
import { MDBIcon } from 'mdb-react-ui-kit';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { FORECAST_CHART_OPTIONS, WEATHER_CODE_MAP } from './constants';
import AnnotationsFactory from "highcharts/modules/annotations";
import { useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
AnnotationsFactory(Highcharts);

function WeatherForecastTile() {
  const [chartInstance, setChartInstance] = React.useState<Highcharts.Chart | null>(null)
  const { weatherData } = useSelector((state: RootState) => state.weatherData)


  useEffect(() => {
    if (!weatherData) {
      return
    }
    if (!chartInstance) {
      return
    }
    console.log(weatherData)
    const max_temp = Math.max.apply(Math, weatherData.hourly.temperature_2m)
    const min_temp = Math.min.apply(Math, weatherData.hourly.temperature_2m)
    const max_percip = Math.max.apply(Math, weatherData.hourly.precipitation)
    const min_percip = Math.min.apply(Math, weatherData.hourly.precipitation)
    const min_temp_index = weatherData.hourly.temperature_2m.indexOf(min_temp)
    const max_temp_index = weatherData.hourly.temperature_2m.indexOf(max_temp)
    const weather_icons = weatherData.hourly.time.filter(
      t => moment(t,'YYYY-MM-DDTHH:mm').hour() === 12
    ).map(
      (t, i) => ({
        x: moment(t,'YYYY-MM-DDTHH:mm').subtract(8, 'hours').toDate().getTime(),
        y: max_temp + 3,
        marker: {
          symbol: WEATHER_CODE_MAP[weatherData.daily.weathercode[i]]?.at(1)
        }
      })
    )
    const temp_data = weatherData.hourly.time.map(
      (t, i) => ({
        x: moment(t,'YYYY-MM-DDTHH:mm').subtract(8, 'hours').toDate().getTime(),
        y: weatherData.hourly.temperature_2m.at(i),
        id: (i == min_temp_index ? 'min' : (i == max_temp_index ? 'max' : `item${i}`))
      })
    )
    const percip_data = weatherData.hourly.time.map(
      (t, i) => ({
        x: moment(t,'YYYY-MM-DDTHH:mm').subtract(8, 'hours').toDate().getTime(),
        y: weatherData.hourly.precipitation.at(i)
      })
    )

    chartInstance.series[2].setData(temp_data)
    chartInstance.series[1].setData(weather_icons)
    chartInstance.series[0].setData(percip_data)
    chartInstance.axes[1].setExtremes(min_temp - 5, max_temp + 9)
    const percip_scale = (max_percip - min_percip) * 0.3
    chartInstance.axes[2].setExtremes(min_percip - percip_scale, max_percip + percip_scale * 3)
    chartInstance.removeAnnotation('min_annotation')
    chartInstance.removeAnnotation('max_annotation')
    chartInstance.addAnnotation({
      id: 'min_annotation',
      labels: [{
        point: 'min',
        shape: 'callout',
        text: `${min_temp}°F`,
        y: -15,
        backgroundColor: 'rgba(40,40,40,0.7)'
      }]
    })
    chartInstance.addAnnotation({
      id: 'max_annotation',
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
        <Card text='white' style={{width: '590px', height: '241px', paddingTop: '10px', backgroundColor: '#515151'}}>
          <Card.Body style={{padding: 0}}>
            <Row style={{margin: 0, marginLeft: '-12px', width: '602px'}}>
              <HighchartsReact
                highcharts={Highcharts}
                options={FORECAST_CHART_OPTIONS}
                callback={ afterChartCreated }
              />
            </Row>
            <Row style={{marginLeft: '6px'}}>
            { weatherData?.daily.time.map((time, i) => {
              return (
              <div className='weather-forecast-day-info-container'>
                <div className='weather-forecast-day-info-row'>
                  <MDBIcon
                      fas
                      icon="temperature-arrow-up fa-fw"
                      style={{ color: "#868B94" }}
                    />{" "}
                    <span>{weatherData?.daily.temperature_2m_max[i]}{weatherData?.daily_units.temperature_2m_max}</span>
                </div>
                <div className='weather-forecast-day-info-row'>
                  <MDBIcon
                      fas
                      icon="temperature-arrow-down fa-fw"
                      style={{ color: "#868B94" }}
                    />{" "}
                    <span>{weatherData?.daily.temperature_2m_min[i]}{weatherData?.daily_units.temperature_2m_min}</span>
                </div>
                <div className='weather-forecast-day-info-row'>
                  <MDBIcon
                      fas
                      icon="droplet fa-fw"
                      style={{ color: "#868B94" }}
                    />{" "}
                    <span>{weatherData?.daily.precipitation_probability_max[i]}{weatherData?.daily_units.precipitation_probability_max}</span>
                </div>
                <div className='weather-forecast-day-info-row'>
                  <MDBIcon
                      fas
                      icon="droplet fa-fw"
                      style={{ color: "#868B94" }}
                    />{" "}
                    <span>{weatherData?.daily.precipitation_sum[i]} {weatherData?.daily_units.precipitation_sum}</span>
                </div>
              </div>)
            })}
                         
            </Row>
          </Card.Body>
        </Card>
    </>
  );
}

export default WeatherForecastTile

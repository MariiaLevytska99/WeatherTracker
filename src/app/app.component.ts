import {Component, OnInit, ViewChild} from '@angular/core';
import * as go from 'gojs';
import {WeatherService} from './services/weather-tracker.service';
import {Location} from './models/Location';
import {Forecast} from './models/Forecast';
import {Units} from './models/Units';
import {WeatherChartComponent} from './weather-chart/weather-chart.component';

const $ = go.GraphObject.make;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'weather-tracker';
  public temperatures;
  public forecast: Array<Forecast>;
  displayedColumns: string[] = ['date', 'temperature'];
  @ViewChild(WeatherChartComponent) chart: WeatherChartComponent;

  public model: go.GraphLinksModel = $(go.GraphLinksModel,
    {
      copiesArrays: true,
      copiesArrayObjects: true,
      nodeDataArray: []
    });

  selectedTempUnit: Units;
  eUnits = Units;

  cityCoordinates: Location = {
    name: 'Lviv',
    lat: 49.84,
    lon: 24.02
  };

  constructor(private weatherService: WeatherService) {
  }

  ngOnInit(): void {
    this.selectedTempUnit = Units.Celsius;
    this.getTemperaturesForChart(this.cityCoordinates, this.selectedTempUnit);
  }

  getTemperaturesForChart(location: Location, units: Units): void {
    this.temperatures = [];
    this.forecast = [];

    this.weatherService.getForecast(location, units).subscribe(value => {
      value.daily.map(val => {
        this.temperatures.push(val.temp.day);
      });

      value.daily.map(val => this.forecast.push(
        {
          date: val.dt,
          temperature: val.temp.day
        }));

      this.model.nodeDataArray = [{
        key: 'Temperature', items: [
          {color: 'red', values: this.temperatures, label: 'Daily temperature'},
          {color: 'black', values: [0] }
        ]
      }];
    });
  }

  onChange(value: any): void {
    this.selectedTempUnit = value;
    this.getTemperaturesForChart(this.cityCoordinates, this.selectedTempUnit);
  }

  downloadChart(): void {
    this.chart.downloadChart();
  }
}

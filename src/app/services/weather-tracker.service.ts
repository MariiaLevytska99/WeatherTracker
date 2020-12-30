import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {ConfigService} from './config.service';
import {Location} from '../models/Location';
import {Units} from '../models/Units';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {


  constructor(private http: HttpClient) { }

  getForecast(location: Location, units: Units): Observable<any> {
    const url = ConfigService.getWeatherApiUrl() +
      `onecall?lat=${location.lat}&lon=${location.lon}&exclude=hourly,minutely&units=${units}&appid=${ConfigService.getApiId()}`;
    return this.http.get(url);
  }

}



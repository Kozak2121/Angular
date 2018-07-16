import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '@environments/environment';

@Injectable()
export class UnitService {
  private THERMOSTAT_URL = environment.thermostat.host;

  constructor(private http: HttpClient) { }

  public units(): Observable<any> {
    return this.http.get(`${this.THERMOSTAT_URL}/thermostats`);
  }

  public updateUnit(id: number | string, options: any): Observable<any> {
    return this.http.put(`${this.THERMOSTAT_URL}/thermostats/${id}`, options);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { AvailableSport } from '../models/available.sport';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SportsService {
  apiUrl = environment.apiUrl;
  model = 'sports';

  constructor(private http: HttpClient) {}

  getSportsList(): Observable<AvailableSport[]> {
    return this.http.get<AvailableSport[]>(`${this.getUrl()}/list-sports`);
  }

  getUrl() {
    return `${this.apiUrl}/${this.model}`;
  } 
}

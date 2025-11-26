import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { CreateSportSpace } from '@features/sport-spaces/models/create-sport-space';
import { Observable } from 'rxjs';
import { SportSpacesResponse } from '../models/sport-spaces.response';

@Injectable({
  providedIn: 'root',
})
export class SportSpacesService {
  apiUrl = environment.apiUrl;
  model = 'spaces';

  constructor(private http: HttpClient) {}

  createSpace(space: CreateSportSpace, image: File) {
    const formData = new FormData();

    formData.append('data', JSON.stringify(space));
    formData.append('image', image);

    return this.http.post(`${this.getUrl()}/create-space`, formData);
  }

  getAllSpaces(): Observable<SportSpacesResponse[]> {
    return this.http.get<SportSpacesResponse[]>(`${this.getUrl()}/list-spaces`);
  }

  getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }
}


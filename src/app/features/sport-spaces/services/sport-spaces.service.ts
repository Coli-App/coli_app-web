import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { CreateSportSpace } from '@features/sport-spaces/models/create-sport-space';
import { Observable } from 'rxjs';
import { SportSpacesResponse } from '../models/sport-spaces.response';
import { SpaceResponse } from '../models/space-response';
import { UpdateSportSpace } from '../models/update-sport-space';

@Injectable({
  providedIn: 'root',
})
export class SportSpacesService {
  apiUrl = environment.apiUrl;
  model = 'spaces';

  constructor(private http: HttpClient) {}

  createSpace(space: CreateSportSpace, image: File) {
    const formData = new FormData();

    // Crear objeto JSON con los datos (sin el archivo)
    const spaceData = {
      name: space.name,
      state: space.state,
      ubication: space.ubication,
      description: space.description,
      capacity: space.capacity,
      sports: space.sports,
      schedule: space.schedule,
    };

    console.log('📦 Datos del espacio (JSON):', spaceData);
    console.log('📎 Archivo:', image.name);

    // Opción 1: Enviar data como JSON string y el archivo separado
    formData.append('data', JSON.stringify(spaceData));
    formData.append('image', image);

    console.log('\n📦 FORMDATA COMPLETO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    formData.forEach((value, key) => {
      console.log(`  ${key}:`, typeof value === 'object' ? `[File: ${(value as File).name}]` : value);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return this.http.post(`${this.getUrl()}/create-space`, formData);
  }

  getAllSpaces(): Observable<SportSpacesResponse[]> {
    return this.http.get<SportSpacesResponse[]>(`${this.getUrl()}/list-spaces`);
  }

  getSpaceById(id: number): Observable<SpaceResponse> {
    return this.http.get<SpaceResponse>(`${this.getUrl()}/${id}`);
  }

  updateSpace(id: number, space: UpdateSportSpace, image?: File): Observable<any> {
    const formData = new FormData();

    const spaceData: any = {};
    if (space.name !== undefined) spaceData.name = space.name;
    if (space.state !== undefined) spaceData.state = space.state;
    if (space.ubication !== undefined) spaceData.ubication = space.ubication;
    if (space.description !== undefined) spaceData.description = space.description;
    if (space.capacity !== undefined) spaceData.capacity = space.capacity;
    if (space.sports !== undefined) spaceData.sports = space.sports;

    console.log('📦 Actualización de espacio - Datos JSON:', spaceData);
    if (image) {
      console.log('📎 Nueva imagen:', image.name);
    }

    formData.append('data', JSON.stringify(spaceData));
    if (image) {
      formData.append('image', image);
    }

    return this.http.put(`${this.getUrl()}/edit-space/${id}`, formData);
  }

  deleteSpace(id: number): Observable<any> {
    return this.http.delete(`${this.getUrl()}/delete-space/${id}`);
  }

  getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }
}


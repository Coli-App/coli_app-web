import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { CreateUser } from '../models/create.user';
import { Observable } from 'rxjs';
import { UserResponse } from '../models/user.response';
import { UpdateUser } from '../models/update.user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiUrl = environment.apiUrl;
  model = 'user';

  constructor(
    private http: HttpClient
  ) { }

  createUser(data: CreateUser): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.getUrl(), data);
  }

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.getUrl());
  }

  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.getUrl()}/${id}`);
  }

  updateUser(id: string, data: UpdateUser): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.getUrl()}/${id}`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.getUrl()}/${id}`);
  }

  getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }
}

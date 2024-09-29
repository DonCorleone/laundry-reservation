import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IReservation} from "../models/reservation";
import {ISubject} from "../models/subject";

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  private baseUrl = 'http://localhost:3000'; // json-server
  // private baseUrl = 'http://localhost:5263'; // dotNet
  // private baseUrl = 'https://laundrysignalr-init.onrender.com'; // render

  constructor(private httpClient: HttpClient) {
  }

  public getSubjects() {
    return this.httpClient.get<ISubject[]>(`${this.baseUrl}/api/Subjects`);
  }
}

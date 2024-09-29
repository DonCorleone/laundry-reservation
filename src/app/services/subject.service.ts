import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ISubject} from "../models/subject";
import {BehaviorSubject, take} from "rxjs";
// const baseUrl = 'http://localhost:3000'; // json-server
// const baseUrl = 'http://localhost:5263'; // dotNet
const baseUrl = 'https://laundrysignalr-init.onrender.com'; // render
@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private _subjects = new BehaviorSubject<ISubject[] | null>(null);
  subjects$ = this._subjects.asObservable();

  constructor(private httpClient: HttpClient) {
    this.httpClient.get<ISubject[]>(`${baseUrl}/api/Subjects`).pipe(
      take(1)).subscribe(subjects => this._subjects.next(subjects))
  }
}

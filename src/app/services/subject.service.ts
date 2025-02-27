import {DestroyRef, inject, Injectable, isDevMode} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ISubject} from "../models/subject";
import {BehaviorSubject, take} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SubjectService {

  private baseUrl = 'https://laundrysignalr-init.onrender.com'; // render
  private _subjects = new BehaviorSubject<ISubject[] | null>(null);
  subjects$ = this._subjects.asObservable();
  constructor(private destroyRef: DestroyRef) {
    if (isDevMode()) {
      // this.baseUrl = 'http://localhost:3000'; // json-server
      // this.baseUrl = 'http://localhost:5263'; // dotNet
    }

    inject(HttpClient).get<ISubject[]>(`${this.baseUrl}/api/Subjects`).pipe(
      take(1)).subscribe(subjects => this._subjects.next(subjects))
  }
}

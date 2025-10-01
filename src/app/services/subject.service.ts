import {DestroyRef, inject, Injectable} from '@angular/core';
import {ISubject} from "../models/subject";
import {BehaviorSubject, take} from "rxjs";
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private _subjects = new BehaviorSubject<ISubject[] | null>(null);
  subjects$ = this._subjects.asObservable();
  private apiService = inject(ApiService);
  
  constructor(private destroyRef: DestroyRef) {
    this.apiService.get<ISubject[]>('/api/Subjects').pipe(
      take(1)).subscribe(subjects => this._subjects.next(subjects))
  }
}

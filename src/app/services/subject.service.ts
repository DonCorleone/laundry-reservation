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
  private isLoaded = false;
  
  constructor(private destroyRef: DestroyRef) {
    // Don't load data in constructor - wait for explicit call
  }
  
  public loadSubjects(): void {
    if (this.isLoaded) {
      return; // Already loaded
    }
    
    this.apiService.get<ISubject[]>('/api/Subjects').pipe(
      take(1)
    ).subscribe({
      next: subjects => {
        this._subjects.next(subjects);
        this.isLoaded = true;
      },
      error: err => {
        console.error('Error loading subjects:', err);
        this._subjects.next([]);
      }
    });
  }
  
  public refreshSubjects(): void {
    this.isLoaded = false;
    this.loadSubjects();
  }
}

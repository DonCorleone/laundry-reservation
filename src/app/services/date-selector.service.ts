import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs'
@Injectable({
  providedIn: 'root'
})
export class DateSelectorService {
  private _selectedDate = new BehaviorSubject<Date | null>(null);
  selectedDate$ = this._selectedDate.asObservable();

  setSelectedDate(date: Date): void {
    this._selectedDate.next(date);
  }
}

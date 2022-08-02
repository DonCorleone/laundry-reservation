import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs'
@Injectable({
  providedIn: 'root'
})
export class DateSelectorService {
  selectedDate = new BehaviorSubject<Date>(new Date());
}

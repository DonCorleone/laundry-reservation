import {ISubject} from "./subject";
import {IHour} from "./hour";

export interface Tile {
  id: string;
  subject: ISubject;
  color: string;
  cols: number;
  rows: number;
  text: string;
  cellType: number;
  header: boolean;
  hour: IHour;
}

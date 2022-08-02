import { Component, OnInit } from '@angular/core';

interface machine {
  name: string;
}

@Component({
  selector: 'app-park',
  templateUrl: './park.component.html'
})
export class ParkComponent {
  machines: machine[] = [];

  constructor() {
    for (let i = 1; i <= 7; i++){
      const m: machine = {
        name: `machine ${i}`
      }
      this.machines.push(m);
    }
  }
}

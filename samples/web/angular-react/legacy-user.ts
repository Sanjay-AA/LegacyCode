import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  template: `
    <div>
      <h2>{{ username }} Profile</h2>
      <button (click)="onIncrementCount()">Points: {{ points }}</button>
    </div>
  `
})
export class UserProfileComponent implements OnInit {
  username: string = 'JohnDoe';
  points: number = 0;

  ngOnInit() {
    this.points = 10;
  }

  onIncrementCount() {
    this.points++;
  }
}

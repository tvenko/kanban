import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html',
  styleUrls: ['./main-navbar.component.css']
})
export class MainNavbarComponent implements OnInit {

  route: string;

  constructor(private router: Router, private location: Location) {}

  ngOnInit() {
  }

  isActiveRoute(route: string) {
    if (this.location.path() !== null) {
      return route === this.location.path();
    }
    return false;
  }

  isAdmin() {
    let user = JSON.parse(localStorage.getItem('user'));
    return user.roles.includes("admin");
  }

}

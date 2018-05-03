import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { Location } from '@angular/common';
import {MessageService} from '../services/message.service';

@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html',
  styleUrls: ['./main-navbar.component.css']
})
export class MainNavbarComponent implements OnInit {

  route: string;
  username: string;
  id: string;

  constructor(private router: Router, private location: Location, private messageService: MessageService) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user'));
    this.username = user.email;
  }

  isActiveRoute(route: string) {
    if (this.location.path() !== null) {
      this.id = this.location.path().split('/')[2];
      return route === '/' + this.location.path().split('/')[1];
    }
    return false;
  }

  isAdmin() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user.roles.includes('admin');
  }

  editBoard() {
    this.messageService.filter('editBoard');
    console.log('edit board');
  }

  addProjectToBoard() {
    this.messageService.filter('addProject');
    console.log('add project to board');
  }

  copyBoard() {
    this.messageService.filter('copyBoard');
    console.log('copy board');
  }

}

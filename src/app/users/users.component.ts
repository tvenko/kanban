import {Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UsersService} from '../shared/services/users.service';
import {User} from '../shared/models/user.interface';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {

  @ViewChild('closeEditUserModal') closeEditUserModal: ElementRef;
  @ViewChild('closeNewUserModal') closeNewUserModal: ElementRef;
  @ViewChild('notificationNewUser') notificationNewUser: ElementRef;
  @ViewChild('notificationUpdateUser') notificationUpdateUser: ElementRef;

  hover = [];
  editedUser: User;
  error: string;
  users: User[];
  editUserForm: FormGroup;
  newUserForm: FormGroup;
  test: any;

  constructor(private usersService: UsersService) { }

  ngOnInit() {
    this.editUserForm = new FormGroup({
      'firstName': new FormControl(null, Validators.required),
      'lastName': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.email, Validators.required]),
      'password': new FormControl(null, Validators.required),
      'developer': new FormControl(null),
      'productOwner': new FormControl(null),
      'kanbanMaster': new FormControl(null),
      'admin': new FormControl(null)
    });
    this.newUserForm = new FormGroup({
      'firstName': new FormControl(null, Validators.required),
      'lastName': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.email, Validators.required]),
      'password': new FormControl(null, Validators.required),
      'developer': new FormControl(null),
      'productOwner': new FormControl(null),
      'kanbanMaster': new FormControl(null),
      'admin': new FormControl(null)
    });
    this.usersService.getUsers().subscribe(users => {
      this.users = <User[]> users;
      for (let i = 0; i < this.users.length; i++) {
        this.hover[i] = false;
      }
    }, err => {
      console.log('error geting users from backend');
    });
  }

  editUser(user: User) {
    this.editedUser = user;
    this.editUserForm.setValue({
      firstName: user.name,
      lastName: user.surname,
      email: user.email,
      password: user.password,
      developer: user.roles.includes('developer'),
      productOwner: user.roles.includes('product owner'),
      kanbanMaster: user.roles.includes('kanban master'),
      admin: user.roles.includes('admin')
    });
  }

  postEditUser() {
    const index = this.users.indexOf(this.editedUser);
    const roles = [];
    if (this.editUserForm.get('developer').value) {
      roles.push('developer');
    }
    if (this.editUserForm.get('productOwner').value) {
      roles.push('product owner');
    }
    if (this.editUserForm.get('kanbanMaster').value) {
      roles.push('kanban master');
    }
    if (this.editUserForm.get('admin').value) {
      roles.push('admin');
    }
    if (roles.length > 0) {
      this.users[index] = {
        id_user: this.editedUser.id_user,
        name: this.editUserForm.get('firstName').value,
        surname: this.editUserForm.get('lastName').value,
        email: this.editUserForm.get('email').value,
        password: this.editUserForm.get('password').value,
        roles: roles,
        activate: this.editedUser.activate
      };
      this.editedUser = null;
      this.error = null;
      // ne vem kako drugace zapreti modal zato simuliram klik na X
      this.closeEditUserModal.nativeElement.click();
      this.notificationUpdateUser.nativeElement.click();
      // TODO: update user in database
    } else {
      this.error = 'Izbrati morate vsaj eno uporabniško vlogo';
    }
  }

  postNewUser() {
    const roles = [];
    if (this.newUserForm.get('developer').value) {
      roles.push('developer');
    }
    if (this.newUserForm.get('productOwner').value) {
      roles.push('product owner');
    }
    if (this.newUserForm.get('kanbanMaster').value) {
      roles.push('kanban master');
    }
    if (this.newUserForm.get('admin').value) {
      roles.push('admin');
    }
    if (roles.length > 0) {
      const newUser: User = {
        id_user: null,
        name: this.newUserForm.get('firstName').value,
        surname: this.newUserForm.get('lastName').value,
        email: this.newUserForm.get('email').value,
        password: this.newUserForm.get('password').value,
        roles: roles,
        activate: false
      };
      this.error = null;
      // ne vem kako drugace zapreti modal zato simuliram klik na X
      this.users.push(newUser);
      this.closeNewUserModal.nativeElement.click();
      this.notificationNewUser.nativeElement.click();
      // TODO: send new user in database
    } else {
      this.error = 'Izbrati morate vsaj eno uporabniško vlogo';
    }
  }

  lockUser(user: User) {
    user.activate = false;
    // TODO: save to database
  }

  unlockUser(user: User) {
    user.activate = true;
    // TODO: save to database
  }

}

import {Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UsersService} from '../shared/services/users.service';
import {User} from '../shared/models/user.interface';

declare var UIkit: any;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {

  hover = [];
  editedUser: User;
  error: string;
  users: User[];
  editUserForm: FormGroup;
  newUserForm: FormGroup;

  constructor(private usersService: UsersService) { }

  ngOnInit() {
    this.editUserForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'surname': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.email, Validators.required]),
      'password': new FormControl(null, Validators.required),
      'developer': new FormControl(null),
      'productOwner': new FormControl(null),
      'kanbanMaster': new FormControl(null),
      'admin': new FormControl(null)
    });
    this.newUserForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'surname': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.email, Validators.required]),
      'password': new FormControl(null, Validators.required),
      'developer': new FormControl(null),
      'productOwner': new FormControl(null),
      'kanbanMaster': new FormControl(null),
      'admin': new FormControl(null)
    });
    this.getUsers();
  }

  getUsers() {
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
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: user.password,
      developer: user.roles.includes('developer'),
      productOwner: user.roles.includes('product owner'),
      kanbanMaster: user.roles.includes('kanban master'),
      admin: user.roles.includes('admin')
    });
  }

  postEditUser() {
    const roles = [];
    if (this.editUserForm.get('developer').value) {
      roles.push(1);
    }
    if (this.editUserForm.get('productOwner').value) {
      roles.push(2);
    }
    if (this.editUserForm.get('kanbanMaster').value) {
      roles.push(3);
    }
    if (this.editUserForm.get('admin').value) {
      roles.push(4);
    }
    if (roles.length > 0) {
      const user: User = {
        id: this.editedUser.id,
        name: this.editUserForm.get('name').value,
        surname: this.editUserForm.get('surname').value,
        email: this.editUserForm.get('email').value,
        password: this.editUserForm.get('password').value,
        roles: roles,
        activate: this.editedUser.activate
      };
      console.log(user.id, this.editedUser.id);
      this.usersService.updateUser(user, user.id).subscribe(res => {
        UIkit.modal('#edit-user-modal').hide();
        UIkit.notification(
          'Uporabnik ' + user.name + ' ' + user.surname + ' je uspešno posodobljen',
          {status: 'success', timeout: 2000}
        );
        this.getUsers();
        this.editedUser = null;
        this.error = null;
      }, err => {
        this.error = 'Uporabnika ' + user.name + ' ' + user.surname +
          ' ni bilo mogoče posodobiti. Nekaj se je zalomilo na strežniku, prosimo poskusite kasneje.';
      });
    } else {
      this.error = 'Izbrati morate vsaj eno uporabniško vlogo';
    }
  }

  postNewUser() {
    const roles = [];
    if (this.newUserForm.get('developer').value) {
      roles.push(1);
    }
    if (this.newUserForm.get('productOwner').value) {
      roles.push(2);
    }
    if (this.newUserForm.get('kanbanMaster').value) {
      roles.push(3);
    }
    if (this.newUserForm.get('admin').value) {
      roles.push(4);
    }
    if (roles.length > 0) {
      const newUser: User = {
        id: null,
        name: this.newUserForm.get('name').value,
        surname: this.newUserForm.get('surname').value,
        email: this.newUserForm.get('email').value,
        password: this.newUserForm.get('password').value,
        roles: roles,
        activate: true
      };
      this.usersService.postUser(newUser).subscribe(res => {
        this.error = null;
        this.users.push(newUser);
        UIkit.modal('#new-user-modal').hide();
        UIkit.notification('Nov uporabnik uspešno dodan', {status: 'success', timeout: 2000});
        this.getUsers();
      }, err => {
        this.error = 'Uporabnika ni bilo mogoče registrirati. Nekaj se je zalomilo na strežniku, prosimo poskusite kasneje.';
      });
    } else {
      this.error = 'Izbrati morate vsaj eno uporabniško vlogo';
    }
  }

  lockUser(user: User) {
    const lockedUser: User = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: user.password,
      roles: this.rolesMapper(user.roles),
      activate: false
    };
    this.usersService.updateUser(lockedUser, lockedUser.id).subscribe(
      res => user.activate = false,
      err => console.log('ERROR locking user')
      );
  }

  unlockUser(user: User) {
    const unlockedUser: User = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: user.password,
      roles: this.rolesMapper(user.roles),
      activate: true
    };
    this.usersService.updateUser(unlockedUser, unlockedUser.id).subscribe(
      res => user.activate = true,
      err => console.log('ERROR unlocking user')
    );
  }

  closeModal() {
    this.editedUser = null;
    this.error = null;
  }

  private rolesMapper(roles: string[]) {
    const mappedRoles = [];
    console.log(roles[0]);
    for (const role of roles) {
      console.log(role);
      switch (role) {
        case 'developer': {
          mappedRoles.push(1);
          break;
        }
        case 'product owner': {
          mappedRoles.push(2);
          break;
        }
        case 'kanban master': {
          mappedRoles.push(3);
          break;
        }
        case 'admin': {
          mappedRoles.push(4);
          break;
        }
      }
    }
    return mappedRoles;
  }
}

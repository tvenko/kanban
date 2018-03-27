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
  test: any;

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
        name: this.editUserForm.get('nameame').value,
        surname: this.editUserForm.get('surname').value,
        email: this.editUserForm.get('email').value,
        password: this.editUserForm.get('password').value,
        roles: roles,
        activate: this.editedUser.activate
      };
      this.editedUser = null;
      this.error = null;
      UIkit.modal('edit-user-modal').hide();
      UIkit.notification(
        'Uporabnik ' + this.editedUser.name + ' ' + this.editedUser.surname + 'je uspešno posodobljen',
        {status: 'success', timeout: 2000}
        );
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
      }, err => {
        this.error = 'Uporabnika ni bilo mogoče registrirati. Nekaj se je zalomilo na strežniku, prosimo poskusite kasneje.';
      });
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

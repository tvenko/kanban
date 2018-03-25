import {Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {

  @ViewChild('closeEditUserModal') closeEditUserModal: ElementRef;
  @ViewChild('closeNewUserModal') closeNewUserModal: ElementRef;

  hover = [];
  editedUser: User;
  error: string;
  users: User[] = [
    new User('Janez', 'Novak', ['developer', 'kanban master'], 'janez@mail.com', false),
    new User('Micka', 'Kovac', ['developer'], 'micka@mail.com', false),
    new User('Tina', 'Kabina', ['product owner'], 'tina@mail.com', true),
    new User('Jaka', 'Kaka', ['developer', 'kanban master', 'product owner', 'admin'], 'jaka.zelo.dolg.mail@mail.com', false),
    new User('Janez', 'Novak', ['developer', 'kanban master'], 'janez@mail.com', false),
    new User('Micka', 'Kovac', ['developer'], 'micka@mail.com', false),
    new User('Tina', 'Kabina', ['product owner'], 'tina@mail.com', true),
    new User('Jaka', 'Kaka', ['developer', 'kanban master', 'product owner', 'admin'], 'jaka.zelo.dolg.mail@mail.com', false),
    new User('Janez', 'Novak', ['developer', 'kanban master'], 'janez@mail.com', false),
    new User('Micka', 'Kovac', ['developer'], 'micka@mail.com', false),
    new User('Tina', 'Kabina', ['product owner'], 'tina@mail.com', true),
    new User('Jaka', 'Kaka', ['developer', 'kanban master', 'product owner', 'admin'], 'jaka.zelo.dolg.mail@mail.com', false),
    new User('Janez', 'Novak', ['developer', 'kanban master'], 'janez@mail.com', false),
    new User('Micka', 'Kovac', ['developer'], 'micka@mail.com', false),
    new User('Tina', 'Kabina', ['product owner'], 'tina@mail.com', true),
    new User('Jaka', 'Kaka', ['developer', 'kanban master', 'product owner', 'admin'], 'jaka.zelo.dolg.mail@mail.com', false)
  ];
  editUserForm: FormGroup;
  newUserForm: FormGroup;

  constructor() { }

  ngOnInit() {
    this.editUserForm = new FormGroup({
      'firstName': new FormControl(null, Validators.required),
      'lastName': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.email, Validators.required]),
      'developer': new FormControl(null),
      'productOwner': new FormControl(null),
      'kanbanMaster': new FormControl(null),
      'admin': new FormControl(null)
    });
    this.newUserForm = new FormGroup({
      'firstName': new FormControl(null, Validators.required),
      'lastName': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.email, Validators.required]),
      'developer': new FormControl(null),
      'productOwner': new FormControl(null),
      'kanbanMaster': new FormControl(null),
      'admin': new FormControl(null)
    });
    for (let i = 0; i < this.users.length; i++) {
      this.hover[i] = false;
    }
  }

  editUser(user: User) {
    this.editedUser = user;
    this.editUserForm.setValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
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
        firstName: this.editUserForm.get('firstName').value,
        lastName: this.editUserForm.get('lastName').value,
        email: this.editUserForm.get('email').value,
        roles: roles,
        locked: this.editedUser.locked
      };
      this.editedUser = null;
      this.error = null;
      // ne vem kako drugace zapreti modal zato simuliram klik na X
      this.closeEditUserModal.nativeElement.click();
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
        firstName: this.newUserForm.get('firstName').value,
        lastName: this.newUserForm.get('lastName').value,
        email: this.newUserForm.get('email').value,
        roles: roles,
        locked: false
      };
      this.error = null;
      // ne vem kako drugace zapreti modal zato simuliram klik na X
      this.users.push(newUser);
      this.closeNewUserModal.nativeElement.click();
      // TODO: send new user in database
    } else {
      this.error = 'Izbrati morate vsaj eno uporabniško vlogo';
    }
  }

  lockUser(user: User) {
    user.locked = true;
    // TODO: save to database
  }

  unlockUser(user: User) {
    user.locked = false;
    // TODO: save to database
  }

}

class User {

  firstName: string;
  lastName: string;
  roles;
  email: string;
  locked: boolean;

  constructor(firstName: string, lastName: string, roles: any, email: string, locked: boolean) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.roles = roles;
    this.email = email;
    this.locked = locked;
  }

}

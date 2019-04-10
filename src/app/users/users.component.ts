import {Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UsersService} from '../shared/services/users.service';
import {User} from '../shared/models/user.interface';
import {Router} from '@angular/router';

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

  constructor(private usersService: UsersService,
              private router: Router) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user.roles.includes('admin')) {
      this.router.navigate(['/boards-list']);
    }
    this.editUserForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'surname': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.email, Validators.required]),
      'password': new FormControl(null),
      'passwordMatch': new FormControl(null, this.matchEditPassword.bind(this)),
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
      'passwordMatch': new FormControl(null, [Validators.required, this.matchNewPassword.bind(this)]),
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
      password: null,
      passwordMatch: null,
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
        is_active: this.editedUser.is_active
      };
      console.log(user.id, this.editedUser.id);
      this.usersService.updateUser(user, user.id).subscribe(res => {
        // if the user updates his info, update the user cookie and refresh the page
        const sessionUser = JSON.parse(localStorage.getItem('user'));
        if (sessionUser['id'] === user.id) {
          sessionUser['roles'] = this.usersService.reverseRolesMapper(roles);
          localStorage.setItem('user', JSON.stringify(sessionUser));
          window.location.reload();
        } else {
          UIkit.modal('#edit-user-modal').hide();
          UIkit.notification(
            'Uporabnik ' + user.name + ' ' + user.surname + ' je uspešno posodobljen',
            {status: 'success', timeout: 2000}
          );
          this.getUsers();
          this.editedUser = null;
          this.error = null;
          this.editUserForm.reset();
        }
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
        is_active: true
      };
      this.usersService.postUser(newUser).subscribe(res => {
        this.error = null;
        this.users.push(newUser);
        UIkit.modal('#new-user-modal').hide();
        UIkit.notification('Nov uporabnik uspešno dodan', {status: 'success', timeout: 2000});
        this.newUserForm.reset();
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
      roles: this.usersService.rolesMapper(user.roles),
      is_active: false
    };
    this.usersService.updateUser(lockedUser, lockedUser.id).subscribe(
      res => { user.is_active = false;
              // if the user locks himself: logout
              const sessionUser = JSON.parse(localStorage.getItem('user'));
              if (sessionUser['id'] === user.id) {
                this.router.navigate(['/login']);
              }
       },
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
      roles: this.usersService.rolesMapper(user.roles),
      is_active: true
    };
    this.usersService.updateUser(unlockedUser, unlockedUser.id).subscribe(
      res => user.is_active = true,
      err => console.log('ERROR unlocking user')
    );
  }

  closeModal() {
    this.editedUser = null;
    this.error = null;
    this.newUserForm.reset();
    this.editUserForm.reset();
  }

  matchNewPassword(control: FormControl): {[s: string]: boolean} {
    if (this.newUserForm) {
      if (control.value !== this.newUserForm.controls.password.value) {
        return {'Passwords doesnt match': true};
      }
    }
    return null;
  }

  matchEditPassword(control: FormControl): {[s: string]: boolean} {
    if (this.editUserForm) {
      if (control.value !== this.editUserForm.controls.password.value) {
        return {'Passwords doesnt match': true};
      }
    }
    return null;
  }
}

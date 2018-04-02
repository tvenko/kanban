import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Config} from '../config/env.config';
import {User} from '../models/user.interface';


@Injectable()
export class UsersService {
  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get(Config.API + '/user/');
  }

  postUser(user: User) {
    return this.http.post(Config.API + '/user/', user);
  }

  updateUser(user: User, id: number) {
    return this.http.put(Config.API + '/user/' + id + '/', user);
  }

  rolesMapper(roles: string[]) {
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

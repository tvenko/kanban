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
    console.log(user);
    return this.http.post(Config.API + '/user/', user);
  }

  updateUser(user: User, id: number) {
    console.log(user, user.id);
    return this.http.put(Config.API + '/user/' + id + '/', user);
  }
}

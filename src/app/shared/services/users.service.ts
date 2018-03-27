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

}

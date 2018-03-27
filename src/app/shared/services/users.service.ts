import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Config} from '../config/env.config';


@Injectable()
export class UsersService {
  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get(Config.API + '/user/');
  }

}

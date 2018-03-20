import {HttpClient} from '@angular/common/http';


export class UsersService {
  constructor(private http: HttpClient) {}

  getUsers() {
  //  :TODO implement method
    return this.http.get('url').subscribe(data => data);
  }
}

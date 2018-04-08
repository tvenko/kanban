import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config} from '../config/env.config';
import {Column} from '../models/column.interface';

@Injectable()
export class BoardsService {
  constructor(private http: HttpClient) {}

  getBoards() {
    return this.http.get(Config.API + '/boards/');
  }

  getBoard(id: number) {
    return this.http.get(Config.API + '/boards/' + id + '/');
  }

  postColumn(column: Column) {
    console.log(column);
    return this.http.post(Config.API + '/columns/', column);
  }

  deleteColumn(id: number) {
    return this.http.delete(Config.API + '/columns/' + id + '/');
  }
}

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config} from '../config/env.config';
import {Column} from '../models/column.interface';
import {Board} from "../models/board.interface";

@Injectable()
export class BoardsService {
  constructor(private http: HttpClient) {}

  getBoards() {
    return this.http.get(Config.API + '/boards/');
  }

  getBoard(id: number) {
    return this.http.get(Config.API + '/boards/' + id + '/');
  }

  updateBoard(board: Board) {
    return this.http.put(Config.API + '/boards/' + board.id + '/', board);
  }

  postColumn(column: Column) {
    console.log(column);
    return this.http.post(Config.API + '/columns/', column);
  }

  deleteColumn(id: number) {
    console.log('delete id: ', id);
    return this.http.delete(Config.API + '/columns/' + id + '/');
  }
}

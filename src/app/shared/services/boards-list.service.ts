import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config} from '../config/env.config';

@Injectable()
export class BoardsListService {

  constructor(private http: HttpClient) { }

  getBoards(board_id) {
    return this.http.get(Config.API + '/user_projects/' + board_id + '/');
  }

  updateBoard(board) {
    return this.http.put(Config.API + '/board/', board);
  }

  postBoard(board) {
    return this.http.post(Config.API + '/board/', board);
  }

  deleteBoard(board_id) {
    return this.http.delete(Config.API + '/board/' + board_id + '/');
  }

}
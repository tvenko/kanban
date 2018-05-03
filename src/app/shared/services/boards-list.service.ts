import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config} from '../config/env.config';

@Injectable()
export class BoardsListService {

  constructor(private http: HttpClient) { }

  getBoards(user_id) {
    return this.http.get(Config.API + '/user_projects/' + user_id + '/');
  }

  updateBoard(board) {
    return this.http.put(Config.API + '/boards/' + board["id"] + '/', board);
  }

  copyBoard(board) {
    // To be determined.
    return this.http.post(Config.API + '/boards/' + board["id"] + '/', board);
  }

  postBoard(board) {
    // This should probably be changed.
    board["notify_overdue_n_days"] = -1;
    return this.http.post(Config.API + '/boards/', board);
  }

  deleteBoard(board_id) {
    return this.http.delete(Config.API + '/boards/' + board_id + '/');
  }

}

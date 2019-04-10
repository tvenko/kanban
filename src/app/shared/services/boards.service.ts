import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config} from '../config/env.config';
import {Column} from '../models/column.interface';
import {Board} from '../models/board.interface';
import {WipViolation} from '../models/wipViolation.interface';

@Injectable()
export class BoardsService {

  localColumns: Map<number, Column> = new Map<number, Column>();
  enumeratedColumns: Map<number, number> = new Map<number, number>();

  constructor(private http: HttpClient) {
    this.fillLocalColumns();
  }

  getBoards() {
    return this.http.get(Config.API + '/boards/');
  }

  getBoard(id: number) {
    this.fillEnumeratedColumns(id);
    return this.http.get(Config.API + '/boards/' + id + '/');
  }

  updateBoard(board: Board) {
    return this.http.put(Config.API + '/boards/' + board.id + '/', board);
  }

  getColumn(columnId: number) {
    return this.http.get(Config.API + '/columns/' + columnId + '/');
  }

  postColumn(column: Column) {
    console.log(column);
    return this.http.post(Config.API + '/columns/', column);
  }

  deleteColumn(id: number) {
    console.log('delete id: ', id);
    return this.http.delete(Config.API + '/columns/' + id + '/');
  }

  postWipViolation(violation) {
    console.log(violation);
    return this.http.post(Config.API + '/wip_violations/', violation);
  }

  fillLocalColumns() {
    this.http.get(Config.API + '/columns/').subscribe(columns => {
      for (const column of <Column[]>columns) {
        this.localColumns.set(column.id, column);
      }
    });
  }

  fillEnumeratedColumns(id: number) {
    this.http.get(Config.API + '/boards/' + id + '/').subscribe(board => {
      const board1 = <Board>board[0];
      console.log('board: ', board1);
      let index = 0;
      for (const column of board1.columns) {
        if (column.subcolumns !== null && column.subcolumns.length > 0) {
          for (const subcolmn of column.subcolumns) {
            this.enumeratedColumns.set(subcolmn.id, index);
            index++;
          }
        } else {
          this.enumeratedColumns.set(column.id, index);
          index++;
        }
      }
    });
  }

  getLocalColumns() {
    return this.localColumns;
  }
}

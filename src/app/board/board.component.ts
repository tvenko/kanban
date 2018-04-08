import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Column} from '../shared/models/column.interface';
import {BoardsService} from '../shared/services/boards.service';
import {Board} from '../shared/models/board.interface';

declare var UIkit: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  colors = ['#FFB300', '#FF3D00', '#29B6F6', '#8BC34A', '#ffd633'];
  board: Board;
  dataTransfer = new Map();
  newColumnForm: FormGroup;
  error: string;
  newColumnOffset: number = null;
  newSubcolumnParent: number = null;
  delColumn: Column = null;

  constructor(private boardsService: BoardsService) { }

  ngOnInit() {
    this.newColumnForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      wip: new FormControl(null, Validators.required),
      leftColumn: new FormControl(null),
      rightColumn: new FormControl(null),
      highPriority: new FormControl(null),
      testColumn: new FormControl(null)
    });
    this.getBoard();
  }

  getBoard() {
    this.boardsService.getBoard(1).subscribe(board => {
      console.log(board[0]);
      this.board = <Board>board[0];
    }, err => {
      console.log('Ni bilo mogoce dobiti table ' + err);
    });
  }

  onDragStart(event, card, column) {
    this.dataTransfer.set('card', card);
    this.dataTransfer.set('column', column);
  }

  onDrop(event, data, column) {
    const card = this.dataTransfer.get('card');
    const prevColumn = this.dataTransfer.get('column');
    this.dataTransfer.clear();
    column.cards.push(card);
    const index = prevColumn.cards.indexOf(card);
    if (index > 0) {
      if (prevColumn.cards.length > 1) {
        prevColumn.cards.splice(card, 1);
      } else {
        prevColumn.cards = null;
      }
    }
    console.log(this.dataTransfer);
    event.preventDefault();
  }

  allowDrop(event) {
    event.preventDefault();
  }

  addColumn(i: number, parentId: number) {
    console.log('offset: ' + i);
    this.newColumnOffset = i;
    this.newSubcolumnParent = parentId;
  }

  postColumn() {
    const newColumn: Column = {
      id: null,
      title: this.newColumnForm.get('name').value,
      wip_restriction: this.newColumnForm.get('wip').value,
      parent_column_id: this.newSubcolumnParent,
      display_offset: this.newColumnOffset,
      board_id: this.board.id,
      subcolumns: null
    };
    this.boardsService.postColumn(newColumn).subscribe(column => {
      UIkit.notification(
        'Stolpec ' + newColumn.title + ' je dodan na tablo.',
        {status: 'success', timeout: 2000}
      );
      this.setSpecialColumns(<Column>column).then(res => this.closeModal());
      this.getBoard();
    }, err => {
      this.error = 'ti šment nekaj se je moralo zalomiti, stolpca ni mogoče dodani na tablo.';
      console.log('stolpca ni bilo mogoce dodati na tablo.');
    });
  }

  setDeleteColumn(column: Column) {
    this.delColumn = column;
  }

  setSpecialColumns(column: Column) {
    return new Promise((resolve) => {
      if (this.newColumnForm.get('leftColumn').value) {
        //  :TODO update board.
      }
      if (this.newColumnForm.get('rightColumn').value) {
        //  :TODO update board.
      }
      if (this.newColumnForm.get('highPriority').value) {
        //  :TODO update board.
      }
      if (this.newColumnForm.get('testColumn').value) {
        //  :TODO update board.
      }
      resolve(); // :TODO fix that
    });
  }

  deleteColumn() {
    if (this.delColumn !== null) {
      console.log('delete ID: ' + this.delColumn.id);
      this.boardsService.deleteColumn(this.delColumn.id).subscribe(res => {
        UIkit.notification(
          'Stolpec ' + this.delColumn.title + ' je izbrisan.',
          {status: 'success', timeout: 2000}
        );
        this.getBoard();
        this.delColumn = null;
        UIkit.modal('#delete-column-modal').hide();
      }, err => {
        console.log(err);
        UIkit.notification(
          'Stolpca ' + this.delColumn.title + ' ni bilo mogoče izbrisati.',
          {status: 'warn', timeout: 2000}
        );
        this.delColumn = null;
        UIkit.modal('#delete-column-modal').hide();
      });
    }
  }

  closeModal() {
    this.newSubcolumnParent = null;
    this.newColumnOffset = null;
    this.error = null;
    UIkit.modal('#new-column-modal').hide();
    this.newColumnForm.reset();
  }
}

interface Card {
  id: number;
  title: string;
  content: string;
}

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

  colors = ['#FFB300', '#FF3D00', '#29B6F6', '#8BC34A', '#ffd633', '#884EA0'];
  board: Board;
  dataTransfer = new Map();
  newColumnForm: FormGroup;
  error: string;
  newColumnOffset: number = null;
  newSubcolumnParent: number = null;
  delColumn: Column = null;

  displayAddLeftColumn = false;
  displayAddRightColumn = false;
  displayAddTestColumn = false;

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

  addColumn(i: number, parentId: number) {
    this.newColumnOffset = i;
    this.newSubcolumnParent = parentId;
    this.specialColumnsValidation(this.newColumnOffset);
  }

  postColumn() {
    const newColumn: Column = {
      id: null,
      title: this.newColumnForm.get('name').value,
      wip_restriction: this.newColumnForm.get('wip').value,
      parent_column_id: this.newSubcolumnParent,
      display_offset: this.newColumnOffset,
      board_id: this.board.id,
      subcolumns: null,
      column_cards: null
    };
    this.boardsService.postColumn(newColumn).subscribe(column => {
      UIkit.notification(
        'Stolpec ' + newColumn.title + ' je dodan na tablo.',
        {status: 'success', timeout: 2000}
      );
      this.setSpecialColumns(<Column>column);
      this.getBoard();
    }, err => {
      this.error = 'ti šment nekaj se je moralo zalomiti, stolpca ni mogoče dodani na tablo.';
      console.log('stolpca ni bilo mogoce dodati na tablo.');
    });
  }

  setDeleteColumn(column: Column) {
    this.delColumn = column;
  }

  specialColumnsValidation(offset: number) {
    const rightId = this.board.type_right_border_column_id;
    const leftId = this.board.type_left_border_column_id;
    const testId = this.board.type_acceptance_testing_column_id;

    this.displayAddLeftColumn = rightId == null ||
                                this.getColumnById(rightId).display_offset > offset;
    this.displayAddRightColumn = leftId == null ||
                                this.getColumnById(leftId).display_offset < offset;
    this.displayAddTestColumn = leftId == null && rightId == null ||
                                rightId == null && this.getColumnById(leftId).display_offset < offset ||
                                rightId != null && this.getColumnById(rightId).display_offset < offset;
  }

  getColumnById(columnId: number) {
    for (const el of this.board.columns) {
      if (el.id === columnId) {
        return el;
      }
    }
    return null;
  }

  setSpecialColumns(column: Column) {
      if (this.newColumnForm.get('leftColumn').value) {
        this.board.type_left_border_column_id = column.id;
      }
      if (this.newColumnForm.get('rightColumn').value) {
        this.board.type_right_border_column_id = column.id;
      }
      if (this.newColumnForm.get('highPriority').value) {
        this.board.type_priority_column_id = column.id;
      }
      if (this.newColumnForm.get('testColumn').value) {
        this.board.type_acceptance_testing_column_id = column.id;
      }
      this.boardsService.updateBoard(this.board).subscribe(res => {
        console.log('uspesno posodobljeni stolpci');
        this.closeModal();
      }, err => {
        console.log(err);
        this.closeModal();
    });
  }

  showSpecialColumn(columnId: number) {
    let display = '';
    if (this.board.type_left_border_column_id === columnId) {
      display += 'levi mejni stolpec, ';
    }
    if (this.board.type_right_border_column_id === columnId) {
      display += 'desni mejni stolpec, ';
    }
    if (this.board.type_priority_column_id === columnId) {
      display += 'stolpec z prioriteto, ';
    }
    if (this.board.type_acceptance_testing_column_id === columnId) {
      display += 'testni stolpec, ';
    }
    if (display !== '') {
      return display.substring(0, display.length - 2);
    }
    return null;
  }

  setLeftColumn(columnId: number) {
    this.board.type_left_border_column_id = columnId;
    this.boardsService.updateBoard(this.board).subscribe(res => this.getBoard());
  }

  setRightColumn(columnId: number) {
    this.board.type_right_border_column_id = columnId;
    this.boardsService.updateBoard(this.board).subscribe(res => this.getBoard());
  }

  setTestColumn(columnId: number) {
    this.board.type_acceptance_testing_column_id = columnId;
    this.boardsService.updateBoard(this.board).subscribe(res => this.getBoard());
  }

  setPriorityColumn(columnId: number) {
    this.board.type_priority_column_id = columnId;
    this.boardsService.updateBoard(this.board).subscribe(res => this.getBoard());
  }

  deleteColumn() {
    if (this.delColumn !== null) {
      const specialText = this.showSpecialColumn(this.delColumn.id);
      if (specialText === null) {
        this.boardsService.deleteColumn(this.delColumn.id).subscribe(res => {
          UIkit.notification(
            'Stolpec ' + this.delColumn.title + ' je izbrisan.',
            {status: 'success', timeout: 2000}
          );
          this.getBoard();
          this.delColumn = null;
          this.error = null;
          UIkit.modal('#delete-column-modal').hide();
        }, err => {
          console.log(err);
          UIkit.notification(
            'Stolpca ' + this.delColumn.title + ' ni bilo mogoče izbrisati.',
            {status: 'warn', timeout: 2000}
          );
          this.delColumn = null;
          this.error = null;
          UIkit.modal('#delete-column-modal').hide();
        });
      } else {
        this.error = 'Stolpec ima vloge: ' + specialText + '. Preden lahko zbrišete stolpec morate te vloge dodeliti drugemu stolpcu.';
      }
    }
  }

  closeModal() {
    this.newSubcolumnParent = null;
    this.newColumnOffset = null;
    this.error = null;
    UIkit.modal('#new-column-modal').hide();
    this.newColumnForm.reset();
  }

  closeDeleteModal() {
    this.error = null;
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
}

interface Card {
  id: number;
  title: string;
  content: string;
}

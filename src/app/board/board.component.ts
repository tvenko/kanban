import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Column} from '../shared/models/column.interface';
import {BoardsService} from '../shared/services/boards.service';

declare var UIkit: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  colors = ['#FFB300', '#FF3D00', '#29B6F6', '#8BC34A', '#ffd633'];
  columns = [
    {title: 'Backlog',
      cards: [{id: 1, title: 'naslov', content: 'to je vsebina'},
              {id: 2, title: 'naslov', content: 'to je vsebina'},
              {id: 3, title: 'naslov', content: 'to je vsebina'}]},
    {title: 'Analysis',
      cards: [{id: 1, title: 'naslov', content: 'to je vsebina'},
              {id: 2, title: 'naslov', content: 'to je vsebina'}]},
    {title: 'Code',
      cards: [{id: 1, title: 'naslov', content: 'to je vsebina'}]},
    {title: 'Test',
      cards: [{id: 1, title: 'naslov', content: 'to je vsebina'},
              {id: 2, title: 'naslov', content: 'to je vsebina'},
              {id: 3, title: 'naslov', content: 'to je vsebina'}]},
    {title: 'Accept',
      cards: [{id: 1, title: 'naslov', content: 'to je vsebina'},
              {id: 2, title: 'naslov', content: 'to je vsebina'},
              {id: 3, title: 'naslov', content: 'to je vsebina'},
              {id: 4, title: 'naslov', content: 'to je vsebina'}]}
  ];
  dataTransfer = new Map();
  newColumnForm: FormGroup;
  error: string;

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

  postColumn() {
    const newColumn: Column = {
      id: null,
      name: this.newColumnForm.get('name').value,
      wip: this.newColumnForm.get('wip').value,
      leftColumn: this.newColumnForm.get('leftColumn').value,
      rightColumn: this.newColumnForm.get('rightColumn').value,
      highPriority: this.newColumnForm.get('highPriority').value,
      testColumn: this.newColumnForm.get('highPriority').value,
      parent: null,
      offset: 0
    };
    this.boardsService.postColumn(newColumn).subscribe(res => {
      UIkit.modal('#new-column-modal').hide();
      UIkit.notification(
        'Stolpec ' + newColumn.name + ' je dodan na tablo',
        {status: 'success', timeout: 2000}
      );
      this.error = null;
      this.newColumnForm.reset();
    }, err => {
      this.error = 'ti šment nekaj se je moralo zalomiti, stolpca ni mogoče dodani na tablo.';
      console.log('stolpca ni bilo mogoce dodati na tablo.');
    });
  }

  closeModal() {
    this.newColumnForm.reset();
  }
}

interface Card {
  id: number;
  title: string;
  content: string;
}

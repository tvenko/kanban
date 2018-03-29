import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() {
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

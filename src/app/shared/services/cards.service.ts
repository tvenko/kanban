import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config} from '../config/env.config';
import {Card} from '../models/card.interface';

@Injectable()
export class CardsService {

  constructor(private http: HttpClient) { }

  getCards() {
    return this.http.get(Config.API + '/cards/');
  }


  postCard(card: Card) {
    return this.http.post(Config.API + '/cards/', card);
  }

  updateCard(card: Card) {
    return this.http.put(Config.API + '/cards/' + card.card_id + '/', card);
  }

  deleteCard(cardId: number) {
    return this.http.delete(Config.API + '/cards/' + cardId + '/');
  }

  getDetailedCard(cardId: number){
    return this.http.get(Config.API + '/about_card/' + cardId + '/');
  }


}


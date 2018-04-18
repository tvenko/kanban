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

  /*deleteGroup(id:number){
    return this.http.delete(Config.API + '/groups/' + id + '/');
  }*/

  postCard(card: Card) {
    return this.http.post(Config.API + '/cards/', card);
  }

  /*updateGroup(group:Group){
    return this.http.put(Config.API + '/groups/' + group.id + "/", group);
  }*/


}


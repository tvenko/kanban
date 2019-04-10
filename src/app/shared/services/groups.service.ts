import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config} from '../config/env.config';
import {Group} from '../models/group.interface';

@Injectable()
export class GroupsService {

  constructor(private http: HttpClient) { }

  getGroups() {
    return this.http.get(Config.API + '/groups/');
  }

  deleteGroup(id:number){
    return this.http.delete(Config.API + '/groups/' + id + '/');
  }

  postGroup(group: Group) {
    return this.http.post(Config.API + '/groups/', group);
  }

  updateGroup(group:Group){
    return this.http.put(Config.API + '/groups/' + group.id + "/", group);
  }


}


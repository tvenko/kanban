import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config} from '../config/env.config';
import {Project} from '../models/project.interface';

@Injectable()
export class ProjectsService {

  constructor(private http: HttpClient) { }

/*  getGroups() {
    return this.http.get(Config.API + '/groups/');
  }

  deleteGroup(id:number){
    return this.http.delete(Config.API + '/groups/' + id + '/');
  }
*/
  postProject(project: Project) {
    return this.http.post(Config.API + '/projects/', project);
  }

/*  updateGroup(group:Group){
    return this.http.put(Config.API + '/groups/' + group.id + "/", group);
  }*/


}


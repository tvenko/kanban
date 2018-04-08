import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config} from '../config/env.config';
import {Project} from '../models/project.interface';

@Injectable()
export class ProjectsService {

  constructor(private http: HttpClient) { }

  getProjects() {
    return this.http.get(Config.API + '/projects/');
  }

  deleteProject(id:number){
    return this.http.delete(Config.API + '/projects/' + id + '/');
  }

  postProject(project: Project) {
    return this.http.post(Config.API + '/projects/', project);
  }

  updateProject(project:Project){
    return this.http.put(Config.API + '/projects/' + project.id + "/", project);
  }


}


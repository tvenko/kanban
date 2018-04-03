import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  projectsForm:FormGroup;
  projectsModalTitle:String;

  constructor() { }

  ngOnInit() {

    this.projectsForm = new FormGroup({
      'code-name': new FormControl(null, Validators.required),
      'name': new FormControl(null, Validators.required),
      'buyer': new FormControl(null, Validators.required),
      'start-date': new FormControl(null, Validators.required),
      'end-date': new FormControl(null, Validators.required),

    });
  }

  loadModal(){
    this.projectsModalTitle = "Nov projekt";
  }

  cancelProject(){

  }

}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Project } from '../shared/models/project.interface';
import { ProjectsService } from '../shared/services/projects.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {

  cardsModalTitle:String;
  newCardForm:FormGroup;
  projects:Project[] =[];

  isCurrentUserAdmin:boolean;
  isCurrentUserKanbanMaster:boolean;
  isCurrentUserProductOwner:boolean;
  currentUserId:number;

  constructor() { }

  ngOnInit() {

    //TODO: Vloge znotraj izbrane skupine, ne na sploh!
    let user = JSON.parse(localStorage.getItem('user'));
    this.isCurrentUserKanbanMaster = user.roles.includes("kanban master");
    this.isCurrentUserAdmin = user.roles.includes("admin");
    this.isCurrentUserProductOwner = user.roles.includes("product owner")
    this.currentUserId = user["id"];

    this.newCardForm = new FormGroup({
      'title': new FormControl(null, Validators.required),
      'description': new FormControl(null, Validators.required),
      'priority': new FormControl(null, Validators.required),
      'project': new FormControl(null, Validators.required),
      'typeSilver': new FormControl(),

    });
    this.newCardForm.get('typeSilver').disable();
  }

  loadModal(){
    
    if(this.isCurrentUserProductOwner){
      this.cardsModalTitle ="Nova kartica (nujna zahteva)";
    }else{
      this.cardsModalTitle = "Nova kartica";
    }
    /*this.projectsForm.reset();
    this.selectedProject = null;
    this.loadGroups();*/
  }

  closeModal(){
    
  }

  cancelCard(){

  }

  saveCard(){

  }

}

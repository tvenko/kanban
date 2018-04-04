import { Component, OnInit , ViewChild, ElementRef} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {GroupsService} from '../shared/services/groups.service';
import {Group, GroupMember} from '../shared/models/group.interface';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  projectsForm:FormGroup;
  projectsModalTitle:String;
  sl:any;
  today:Date;
  groups:Group[];

  constructor(private groupsService: GroupsService) { }

  ngOnInit() {

    this.today = new Date();

    this.projectsForm = new FormGroup({
      'code-name': new FormControl(null, Validators.required),
      'name': new FormControl(null, Validators.required),
      'buyer': new FormControl(null, Validators.required),
      'project-dates': new FormControl(null, Validators.required),
      "project-group": new FormControl(null, Validators.required)
    });

    this.sl = {
      firstDayOfWeek: 1,
      dayNames: ["Nedelja", "Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota"],
      dayNamesShort: ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"],
      dayNamesMin: ["Ne","Po","To","Sr","Če","Pe","So"],
      monthNames: [ "Januar","Februar","Marec","April","Maj","Junij","Julij","Avgust","September","Oktober","November","December" ],
      monthNamesShort: [ "Jan", "Feb", "Mar", "Apr", "Maj", "Jun","Jul", "Avg", "Sep", "Okt", "Nov", "Dec" ],
      today: 'Danes',
      clear: 'Počisti'
    };
  }

  loadModal(){
    this.projectsModalTitle = "Nov projekt";
    this.projectsForm.reset();
    this.loadGroups();

  }

  loadGroups() {
    this.groupsService.getGroups().subscribe(groups => {
      this.groups = <Group[]> groups;
      this.groups.sort(function (a, b) {
        return a.id - b.id;
      });
    }, err => {
      console.log('error geting groups from backend');
    });                                          
  }

  cancelProject(){

  }

  closeModal(){

  }

  saveProject(){

    
  }

}

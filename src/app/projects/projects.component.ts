import { Component, OnInit , ViewChild, ElementRef} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {GroupsService} from '../shared/services/groups.service';
import {Group, GroupMember} from '../shared/models/group.interface';
import { Project } from '../shared/models/project.interface';
import { ProjectsService } from '../shared/services/projects.service';
declare var UIkit: any;

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

  constructor(private groupsService: GroupsService, private projectsService: ProjectsService) { }

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
      dateFormat:"yyyy-mm-dd",
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
    //New project
    //Create object
    const project: Project = {
      id_project:this.projectsForm.get("code-name").value,
      active:true,
      title:this.projectsForm.get("name").value,
      developer_group_id:(<Group>this.projectsForm.get("project-group").value).id.toString(),
      board_id:null,
      started_at:(<Date>this.projectsForm.get("project-dates").value[0]).getFullYear()+"-"+(<Date>this.projectsForm.get("project-dates").value[0]).getMonth() + "-"+(<Date>this.projectsForm.get("project-dates").value[0]).getDate(),
      ended_at:(<Date>this.projectsForm.get("project-dates").value[1]).getFullYear()+"-"+(<Date>this.projectsForm.get("project-dates").value[1]).getMonth() + "-"+(<Date>this.projectsForm.get("project-dates").value[1]).getDate(),
      group_data:this.projectsForm.get("project-group").value
    };
    //Send request
    this.projectsService.postProject(project).subscribe(res => {        
      UIkit.modal('#new-project-modal').hide();
      UIkit.notification('Projekt dodana.', {status: 'success', timeout: 2000});
      UIkit.modal('#new-project-modal').hide();
      this.loadGroups();
    }, err => {
      UIkit.notification('Napaka pri dodajanju novega projekta.', {status: 'danger', timeout: 2000});
      console.log(err);
    });  

    UIkit.modal('#new-project-modal').hide();
  }

}

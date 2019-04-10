import { Component, OnInit , ViewChild, ElementRef} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {GroupsService} from '../shared/services/groups.service';
import {Group, GroupMember} from '../shared/models/group.interface';
import { Project } from '../shared/models/project.interface';
import { ProjectsService } from '../shared/services/projects.service';
import { subscribeOn } from 'rxjs/operator/subscribeOn';
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
  projects:Project[];
  isCurrentUserAdmin = false;
  isCurrentUserKanbanMaster = false;
  currentUserId = null;
  selectedProject:Project;

  constructor(private groupsService: GroupsService, private projectsService: ProjectsService) { }

  ngOnInit() {
    let user = JSON.parse(localStorage.getItem('user'));
    this.isCurrentUserKanbanMaster = user.roles.includes("kanban master");
    this.isCurrentUserAdmin = user.roles.includes("admin");
    this.currentUserId = user["id"];
    this.today = new Date();

    this.projectsForm = new FormGroup({
      'code-name': new FormControl(null, Validators.required),
      'name': new FormControl(null, Validators.required),
      'buyer': new FormControl(null, Validators.required),
      'project-start-date': new FormControl(null, Validators.required),
      'project-end-date': new FormControl(null, Validators.required),
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

    this.loadProjects();
  }

  loadModal(){
    this.projectsModalTitle = "Nov projekt";
    this.projectsForm.reset();
    this.selectedProject = null;
    this.loadGroups();

  }

  loadProjects() {
    this.projectsService.getProjects().subscribe(projects => {
      
      if (!this.isCurrentUserAdmin) {
        projects = Object.values(projects).filter((project, index, array) => {
          let isMember = false;
          <Project>project.group_data.users.forEach( (user) => {
            if (user["id"] == this.currentUserId) {
              isMember = true;
            }
          });
          return isMember;
        });
      }
      this.projects = <Project[]> projects;
      this.projects.sort(function (a, b) {
        return a.id - b.id;
        
      });
    }, err => {
      console.log('error geting projects from backend');
    });                         
                    
  }


  loadGroups() {
    this.groups = [];
    this.groupsService.getGroups().subscribe(groups => {
        groups = Object.values(groups).filter((group, index, array) => {
        let isKanbanmaster = false;
        <Project>group.users.forEach( (user) => {
          if (user["id"] == this.currentUserId) {
            if ((<GroupMember>user).allowed_group_roles.includes(3)){
              isKanbanmaster = true;
            }
            
          }
        });
        return isKanbanmaster;
      });
      this.groups = <Group[]> groups;
      this.groups.sort(function (a, b) {
        return a.id - b.id;
      });

    }, err => {
      console.log('error geting groups from backend');
    });                                          
  }

  resetEndDate(){
    this.projectsForm.get("project-end-date").setValue(null);
  }

  dateDifference(project:Project){
    return ((new Date(project.ended_at)).valueOf() - (new Date(project.started_at)).valueOf())/1000/60/60/24;
  }

  cancelProject(){
    this.loadProjects();
  }

  closeModal(){

  }

  deleteProject(project:Project){
    //project.card_active = true; //IZBRIŠI!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
    if(project.card_active){
      let confirmDelete = confirm('Označim projekt kot neaktiven?');
      if(confirmDelete){
        project.active = false;
        this.projectsService.updateProject(project).subscribe(res => {        
          UIkit.notification('Projekt označen kot neaktiven.', {status: 'success', timeout: 2000});
          this.loadProjects();
        }, err => {
          UIkit.notification('Napaka pri urejanju projekta.', {status: 'danger', timeout: 2000});
          console.log(err);
        });  
      }
    }else{
      let confirmDelete = confirm('Zbrišem projekt?');
      if (confirmDelete) {
        this.projectsService.deleteProject(project.id).subscribe(msg => {
          this.loadProjects();
          UIkit.notification('Projekt izbrisan.', {status: 'warning', timeout: 2000});
        }, err => {
          console.log('error deleting project from backend');
        });
      }
    }
  }

  unlockProject(project:Project){
    let confirmDelete = confirm('Označim projekt kot aktiven?');
    if(confirmDelete){
      project.active = true;
      this.projectsService.updateProject(project).subscribe(res => {        
        UIkit.notification('Projekt označen kot aktiven.', {status: 'success', timeout: 2000});
        this.loadProjects();
      }, err => {
        UIkit.notification('Napaka pri urejanju projekta.', {status: 'danger', timeout: 2000});
        console.log(err);
      });  
    }   
  }

  editProject(project:Project){
    this.groups = [];
    this.loadGroups();
    this.selectedProject=project;
    this.projectsModalTitle = "Uredi projekt"
    this.projectsForm.get("code-name").setValue(project.project_id);
    this.projectsForm.get("name").setValue(project.title);
    this.projectsForm.get("buyer").setValue(project.subscriber_name);
    this.projectsForm.get("project-group").setValue(project.group_data.id);
    this.projectsForm.get("project-start-date").setValue(new Date(project.started_at));
    this.projectsForm.get("project-end-date").setValue(new Date(project.ended_at));
  }


  saveProject(){
    if(this.selectedProject == null){
      //New project
      //Create object
      const project: Project = {
        id:null,
        project_id:this.projectsForm.get("code-name").value,
        active:true,
        title:this.projectsForm.get("name").value,
        developer_group_id:(<Group>this.projectsForm.get("project-group").value).id.toString(),
        board_id:null,
        started_at:(<Date>this.projectsForm.get("project-start-date").value).getFullYear()+"-"+((<Date>this.projectsForm.get("project-start-date").value).getMonth()+1) + "-"+(<Date>this.projectsForm.get("project-start-date").value).getDate(),
        ended_at:(<Date>this.projectsForm.get("project-end-date").value).getFullYear()+"-"+((<Date>this.projectsForm.get("project-end-date").value).getMonth()+1) + "-"+(<Date>this.projectsForm.get("project-end-date").value).getDate(),
        group_data:this.projectsForm.get("project-group").value,
        subscriber_name:this.projectsForm.get("buyer").value,
        card_active:false
        // group_data:this.groups.filter(group => group.id == this.projectsForm.get("project-group").value)[0]
      };
      //Send request
      this.projectsService.postProject(project).subscribe(res => {        
        UIkit.modal('#new-project-modal').hide();
        UIkit.notification('Projekt dodan.', {status: 'success', timeout: 2000});
        UIkit.modal('#new-project-modal').hide();
        this.loadProjects();
      }, err => {
        UIkit.notification('Napaka pri dodajanju novega projekta.', {status: 'danger', timeout: 2000});
        console.log(err);
      });  

      UIkit.modal('#new-project-modal').hide();
    }else{

    //Update project
    //Create object
    const project: Project = {
      id:this.selectedProject.id,
      project_id:this.selectedProject.project_id,
      active:this.selectedProject.active,
      title:this.projectsForm.get("name").value,
      developer_group_id:this.projectsForm.get("project-group").value.toString(),
      board_id:this.selectedProject.board_id,
      started_at:(<Date>this.projectsForm.get("project-start-date").value).getFullYear()+"-"+((<Date>this.projectsForm.get("project-start-date").value).getMonth()+1) + "-"+(<Date>this.projectsForm.get("project-start-date").value).getDate(),
      ended_at:(<Date>this.projectsForm.get("project-end-date").value).getFullYear()+"-"+((<Date>this.projectsForm.get("project-end-date").value).getMonth()+1) + "-"+(<Date>this.projectsForm.get("project-end-date").value).getDate(),
      group_data:this.groups.filter(group => this.projectsForm.get("project-group").value == group.id)[0],
      subscriber_name:this.projectsForm.get("buyer").value,
      card_active:this.selectedProject.card_active
      
    };
    //Send request
    this.projectsService.updateProject(project).subscribe(res => {        
      UIkit.modal('#edit-project-modal').hide();
      UIkit.notification('Projekt urejen.', {status: 'success', timeout: 2000});
      UIkit.modal('#edit-project-modal').hide();
      this.loadProjects();
    }, err => {
      UIkit.notification('Napaka pri urejanju projekta.', {status: 'danger', timeout: 2000});
      console.log(err);
    });  

    UIkit.modal('#edit-project-modal').hide();
    }

  }

}

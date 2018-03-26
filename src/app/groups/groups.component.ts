import { Component, OnInit } from '@angular/core';
import { User, } from './extraClasses';
import { UserRole } from './extraClasses';
import { Role } from './extraClasses';
import { Group } from './extraClasses';
import { FormControl, FormGroup, Validators } from '@angular/forms';
declare var UIkit: any;

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})


export class GroupsComponent implements OnInit {
  
  users: User[];
  roles: Role[];
  selectedUser:User;
  members:UserRole[];
  groups:Group[];
  selectedGroup:Group;
  groupName:string;
  groupNameInput:FormControl; 

  constructor() { 
    this.users = [];
    this.roles = [];
    this.members =[];
    this.groups = [];
    this.selectedGroup = null;
    this.selectedUser = null;
  }

  ngOnInit() {
    this.loadGroups();
    this.groupNameInput = new FormControl(null, Validators.required)
  }

  loadGroups(){
    //TODO: get groups from backend
    /*this.groups.push(new Group("Legvani", [new UserRole(this.users[0], [this.roles[0], this.roles[2]]),
                                           new UserRole(this.users[1], [this.roles[1]]),
                                           new UserRole(this.users[2], [this.roles[2]]),
                                           new UserRole(this.users[3], [this.roles[2]])]));*/
  }

  deleteGroup(group:Group){
    var confirmDelete = confirm("Zbrišem skupino?");
    if (confirmDelete) {
      //TODO: delete and get 
      this.groups = this.groups.filter(obj => obj !== group);
      UIkit.notification('Skupina izbrisana.', {status: 'danger', timeout: 2000});
    }
  }

  editGroup(group:Group){
    //TODO: CARD TITLE: UREDI SKUPINO
    //TODO: VČASIH NE DELA UREJANJE
    this.selectedGroup = group;
    this.groupNameInput.setValue(group.name);
    this.members = group.members;
  }

  //******** NEW GROUP MODAL *********//

  loadModal(){
    this.groupNameInput.setValue("");
    this.selectedGroup = null;
    this.loadRoles();
    this.loadUsers();
    this.resetRoles();
    this.selectedUser = null;
    this.members = [];
  }

  loadRoles(){
    this.roles = [new Role("KanbanMaster", 0), new Role("Product owner", 1), new Role("Razvijalec", 2)];
  }

  loadUsers(){
    this.users = [
      {id:1, firstName: "Rok", lastName: 'Šolar', email:"rs5234@student.uni-lj.si", active: true, roles:[0,1,2] },
      {id:2, firstName: "Matej", lastName: 'Lokvan', email:"ml1213@student.uni-lj.si", active: true, roles:[0,2] },
      {id:3, firstName: "Miha", lastName: 'Rais', email:"3fwerfwer@student.uni-lj.si", active: true, roles:[2] },
      {id:4, firstName: "Janez", lastName: 'Bučman', email:"awew@student.uni-lj.si", active: true, roles:[2] },
      {id:5, firstName: "Luka", lastName: 'Kotel', email:"2342hd4@student.uni-lj.si", active: false, roles:[2] },
    ];
  }

  //Add selected member with selected roles to group
  addMemberToGroup(){
    //Check restrictions (only one KanbanMaster and only one Produt owner and at least one role is selected)
    var roleSelected = false;
    this.roles.forEach(role => {
      if (role.checked){
        roleSelected = true;
      }
    });
    if (!roleSelected){
      alert("Izberi vsaj eno vlogo.")
    }else if(this.members.filter(obj => obj.user == this.selectedUser).length != 0){
      alert("Uporabnik je v skupini.")
    }else if (this.roles[0].checked && this.members.filter(obj => obj.roles.includes(this.roles[0])).length != 0){
      alert("Vloga KanbanMaster je že zasedena!")
    }else if (this.roles[1].checked && this.members.filter(obj => obj.roles.includes(this.roles[1])).length != 0){
      alert("Vloga Product owner je že zasedena!");
    }else{
      this.members.push(new UserRole(this.selectedUser,  this.roles.filter(function(role) { return role.checked; })));
    } 
    //Reset roles
    this.resetRoles();
  }
  
  removeMemberfromGroup($event, member:UserRole){
    $event.stopPropagation();
    this.members = this.members.filter(obj => obj !== member);
  }

  resetRoles(){
    this.roles.forEach(role => {
      role.checked = false;
    });
  }

  saveGroup(){
    if (this.groupNameInput.value == ""){
      alert("Vnesi ime skupine.");
    }else if (this.members.filter(obj => obj.roles.includes(this.roles[0])).length == 0 || this.members.filter(obj => obj.roles.includes(this.roles[1])).length == 0 || this.members.filter(obj => obj.roles.includes(this.roles[2])).length == 0){
      alert("Skupina mora vsebovati enega Product ownerja, enega KanbanMastra ter vsaj enega razvijalca.");
    }else{
      if(this.selectedGroup != null){
        //Update group
        this.groups = this.groups.filter(obj => obj !== this.selectedGroup);
        this.groups.push(new Group(this.groupName, this.members, 10));
        UIkit.modal("#new-group-modal").hide();
        UIkit.notification('Skupina urejena.', {status: 'success', timeout: 2000});
        UIkit.modal("#new-group-modal").hide();
      }else{
        //New group
        this.groups.push(new Group(this.groupName, this.members, 10));
        UIkit.modal("#new-group-modal").hide();
        UIkit.notification('Skupina dodana.', {status: 'success', timeout: 2000});
        UIkit.modal("#new-group-modal").hide();
      }


    }
  } 

}

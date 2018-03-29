import { Component, OnInit } from '@angular/core';
//import { User, } from './extraClasses';
import { UserRole } from './extraClasses';
import { Role } from './extraClasses';
//import { Group } from './extraClasses';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {GroupsService} from '../shared/services/groups.service';
import {Group, GroupMember} from '../shared/models/group.interface';
import { forEach } from '@angular/router/src/utils/collection';
import {User} from '../shared/models/user.interface';
import { UsersService } from '../shared/services/users.service';
declare var UIkit: any;

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})


export class GroupsComponent implements OnInit {

  users: User[];
  roles: {[name:string] : boolean;} = {};
  selectedUser: User;
  members: GroupMember[];
  groups: Group[];
  selectedGroup: Group;
  groupName: string;
  groupNameInput: FormControl;
  groupModalTitle: string;

  constructor(private groupsService: GroupsService, private usersService: UsersService) {
    this.users = [];
    this.members = [];
    this.groups = [];
    this.selectedGroup = null;
    this.selectedUser = null;
  }

  ngOnInit() {
    this.loadGroups();
    this.groupNameInput = new FormControl(null, Validators.required);
  }

  loadGroups() {
    this.groupsService.getGroups().subscribe(groups => {
      this.groups = <Group[]> groups;
    }, err => {
      console.log('error geting groups from backend');
    });                                          
  }

  deleteGroup(group: Group) {
    let confirmDelete = confirm('Zbrišem skupino?');
    if (confirmDelete) {
      //TODO: delete and get
      //this.groups = this.groups.filter(obj => obj !== group);
      this.groupsService.deleteGroup(group.id).subscribe(msg => {
        this.loadGroups();
        UIkit.notification('Skupina izbrisana.', {status: 'warning', timeout: 2000});
      }, err => {
        console.log('error deleting group from backend');
      });
    }
  }

  editGroup(group: Group) {
    
    this.groupModalTitle = "Uredi skupino";
    this.selectedGroup = group;
    this.groupNameInput.setValue(group.title);
    this.members = group.users;
  }

  //******** NEW GROUP MODAL *********//

  loadModal() {
    this.groupNameInput.setValue('');
    this.groupModalTitle = "Nova skupina";
    this.selectedGroup = null;
    this.loadRoles();
    this.loadUsers();
    this.resetRoles();
    this.selectedUser = null;
    this.members = [];
  }

  loadRoles() {
    //this.roles = [new Role('KanbanMaster', 0), new Role('Product owner', 1), new Role('Razvijalec', 2)];
    this.roles = {
      "developer" : false,
      "kanban master" : false ,
      "product owner" : false ,
    };
  }

  loadUsers() {
    this.usersService.getUsers().subscribe(users => {
      this.users = <User[]> users;
    }, err => {
      console.log('error geting users from backend');
    });
    /*this.users = [
      {id: 1, firstName: 'Rok', lastName: 'Šolar', email: 'rs5234@student.uni-lj.si', active: true, roles: [0, 1, 2] },
      {id: 2, firstName: 'Matej', lastName: 'Lokvan', email: 'ml1213@student.uni-lj.si', active: true, roles: [0, 2] },
      {id: 3, firstName: 'Miha', lastName: 'Rais', email: '3fwerfwer@student.uni-lj.si', active: true, roles: [2] },
      {id: 4, firstName: 'Janez', lastName: 'Bučman', email: 'awew@student.uni-lj.si', active: true, roles: [2] },
      {id: 5, firstName: 'Luka', lastName: 'Kotel', email: '2342hd4@student.uni-lj.si', active: false, roles: [2] },
    ];*/
  }

  //Add selected member with selected roles to group
  addMemberToGroup() {
    //Check restrictions (only one KanbanMaster and only one Produt owner and at least one role is selected)
    let selectedRoles:string[] = [];
    for (let role in this.roles) {
      if (this.roles[role]){
         selectedRoles.push(role);
      }
    }
    if (selectedRoles.length == 0) {
      alert('Izberi vsaj eno vlogo.');
    } else if (this.members.filter(obj => obj.id == this.selectedUser.id).length != 0) {
      alert('Uporabnik je v skupini.');
    } else if (this.roles["kanban master"] && this.members.filter(obj => obj.allowed_group_roles.includes("kanban master")).length != 0) {
      alert('Vloga KanbanMaster je že zasedena!');
    } else if (this.roles["product owner"] && this.members.filter(obj => obj.allowed_group_roles.includes("product owner")).length != 0) {
      alert('Vloga Product owner je že zasedena!');
    } else {
      //TODO: kako dodam userja
      const groupMember: GroupMember = {
        group_active: true,
        allowed_group_roles:selectedRoles,
        id:this.selectedUser.id,
        email:this.selectedUser.email,
        activate:this.selectedUser.activate,
        name:this.selectedUser.name,
        surname:this.selectedUser.surname,
        password:this.selectedUser.password};

      this.members.push(groupMember);

      //this.members.push(new GroupMember(this.selectedUser,  this.roles.filter(function(role) { return role.checked; })));
    }
    //Reset roles
    this.resetRoles();
  }

  removeMemberfromGroup($event, member: GroupMember) {
    $event.stopPropagation();
    //New group (remove user)
    if(this.groupModalTitle == "Nova skupina"){
      this.members = this.members.filter(obj => obj !== member);
    //Editing group (set unactive)
    }else{
      if(member.allowed_group_roles.length == 1 && member.allowed_group_roles[0] == "developer"){
         member.group_active = false;
      }else{
        alert("Odstranitev uporabnika z vlogo KanbanMaster ali Product owner ni mogoča.")
      }
    }
  }

  addMemberBackToGroup($event, member: UserRole){
    $event.stopPropagation();
    member.active = true;
  }

  resetRoles() {
    for (let role in this.roles) {
      this.roles[role] = false;
    }
  }

  saveGroup() {
    if (this.groupNameInput.value == '') {
      alert('Vnesi ime skupine.');
    } else if (this.members.filter(obj => obj.allowed_group_roles.includes("kanban master")).length == 0 || this.members.filter(obj => obj.allowed_group_roles.includes("product owner")).length == 0 || this.members.filter(obj => obj.allowed_group_roles.includes("developer")).length == 0) {
      alert('Skupina mora vsebovati enega Product ownerja, enega KanbanMastra ter vsaj enega razvijalca.');
    } else {
      if (this.selectedGroup != null) {
        //Update group
        //TODO: update groups
        /*this.groups = this.groups.filter(obj => obj !== this.selectedGroup);
        this.groups.push(new Group(this.groupName, this.members, 10));
        UIkit.modal('#new-group-modal').hide();
        UIkit.notification('Skupina urejena.', {status: 'success', timeout: 2000});
        UIkit.modal('#new-group-modal').hide();*/
      } else {
        //New group
        //TODO: post groups
        //this.groups.push(new Group(this.groupName, this.members, 10));
        const group: Group = {
          id:null,
          title:this.groupName,
          users:this.members
          };
          this.groupsService.postGroup(group).subscribe(res => {        
            UIkit.modal('#new-group-modal').hide();
            UIkit.notification('Skupina dodana.', {status: 'success', timeout: 2000});
            UIkit.modal('#new-group-modal').hide();
          }, err => {
            console.log('Error saving new group');
          });  

      }
      //TODO: get groups
      this.loadGroups();
    }
  }

}

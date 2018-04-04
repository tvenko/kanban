import { Component, OnInit } from '@angular/core';
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
  roles: {[id:number] : boolean;} = {};
  selectedUser: User;
  members: GroupMember[];
  groups: Group[];
  selectedGroup: Group;
  groupName: string;
  groupNameInput: FormControl;
  userSelectDropdown: FormControl;
  groupModalTitle: string;
  roleNames = ["", "Razvijalec", "Product owner", "Kanban master"];
  isCurrentUserAdmin = false;
  currentUserId = null;

  constructor(private groupsService: GroupsService, private usersService: UsersService) {
    this.users = [];
    this.members = [];
    this.groups = [];
    this.selectedGroup = null;
    this.selectedUser = null;
  }

  ngOnInit() {
    let user = JSON.parse(localStorage.getItem('user'));
    this.isCurrentUserAdmin = user.roles.includes("admin");
    this.currentUserId = user["id"];
    this.loadGroups();
    this.groupNameInput = new FormControl(null, Validators.required);
    this.userSelectDropdown = new FormControl(null);
  }

  loadGroups() {
    this.groupsService.getGroups().subscribe(groups => {
      if (!this.isCurrentUserAdmin) {
        groups = Object.values(groups).filter((group, index, array) => {
          let isMember = false;
          group.users.forEach( (user) => {
            if (user["id"] == this.currentUserId) {
              isMember = true;
            }
          });
          return isMember;
        });
      }

      this.groups = <Group[]> groups;
      this.groups.sort(function (a, b) {
        return a.id - b.id;
      });
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
    this.selectedUser = null;
    this.users = [];
    this.resetRoles();
    this.loadUsers();
    this.groupModalTitle = "Uredi skupino";
    this.selectedGroup = group;
    this.groupNameInput.setValue(group.title);
    this.members = group.users;
    document.getElementById("userSelectDropdown").nodeValue = "null";
  }

  //******** NEW GROUP MODAL *********//

  loadModal() {
    document.getElementById("userSelectDropdown").nodeValue = "null";
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
      1 : false, //Developer
      2 : false, //Product owner
      3 : false, //Kanban master
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
    let selectedRoles:number[] = [];
    for (let role in this.roles) {
      if (this.roles[role]){
        selectedRoles.push(parseInt(role));
      }
    }
    console.log(selectedRoles);

    if (selectedRoles.length == 0) {
      alert('Izberi vsaj eno vlogo.');
   /*  }else if (this.members.filter(obj => obj.id == this.selectedUser.id).length != 0) {
      alert('Uporabnik je v skupini.');*/
    } else if (this.roles[3] && this.members.filter(obj => obj.allowed_group_roles.includes(3) && obj.group_active && obj.id != this.selectedUser.id).length != 0) {
      alert('Vloga KanbanMaster je že zasedena!');
    } else if (this.roles[2] && this.members.filter(obj => obj.allowed_group_roles.includes(2) && obj.group_active && obj.id != this.selectedUser.id).length != 0) {
      alert('Vloga Product owner je že zasedena!');
    } else {
      if(this.members.filter(obj => obj.id == this.selectedUser.id).length != 0){
        if (!this.roles[3] && (this.members.filter(obj => obj.id == this.selectedUser.id))[0].allowed_group_roles.includes(3)){
          alert("Izbrani uporabnik mora imeti vlogo Kanban master");
        }else{
          
          this.members = this.members.filter(obj => obj.id != this.selectedUser.id)
          const groupMember: GroupMember = {
            group_active: true,
            allowed_group_roles:selectedRoles,
            id:this.selectedUser.id,
            email:this.selectedUser.email,
            is_active:this.selectedUser.is_active,
            name:this.selectedUser.name,
            surname:this.selectedUser.surname,
            password:this.selectedUser.password};
    
          this.members.push(groupMember);     
        }
      }else{
        const groupMember: GroupMember = {
          group_active: true,
          allowed_group_roles:selectedRoles,
          id:this.selectedUser.id,
          email:this.selectedUser.email,
          is_active:this.selectedUser.is_active,
          name:this.selectedUser.name,
          surname:this.selectedUser.surname,
          password:this.selectedUser.password};
  
        this.members.push(groupMember);           
      }
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
      if(!member.allowed_group_roles.includes(3)){
         member.group_active = false;
      }else{
        alert("Odstranitev uporabnika z vlogo KanbanMaster ni mogoča.")
      }
    }
  }

  addMemberBackToGroup($event, member: GroupMember){
    $event.stopPropagation();
    //Allow back to group if role is not taken
    if(member.allowed_group_roles.includes(2) && this.members.filter(obj => obj.allowed_group_roles.includes(2) && obj.group_active).length > 0
    || member.allowed_group_roles.includes(3) && this.members.filter(obj => obj.allowed_group_roles.includes(3) && obj.group_active).length > 0)
    {
      alert("Že obstaja uporabnik z to vlogo.")
    }else{
      member.group_active = true;
    }
    
  }

  resetRoles() {
    for (let role in this.roles) {
      this.roles[role] = false;
    }
  }

  saveGroup() {
    if (this.groupNameInput.value == '') {
      alert('Vnesi ime skupine.');
    } else if (this.members.filter(obj => obj.allowed_group_roles.includes(3) && obj.group_active).length == 0 || this.members.filter(obj => obj.allowed_group_roles.includes(2) && obj.group_active).length == 0 || this.members.filter(obj => obj.allowed_group_roles.includes(1) && obj.group_active).length == 0) {
      alert('Skupina mora vsebovati enega Product ownerja, enega KanbanMastra ter vsaj enega razvijalca.');
    } else {
      if (this.selectedGroup != null) {
        //Create object
        const group: Group = {
          id:this.selectedGroup.id,
          title:this.groupName,
          users:this.members
        };
        //Update group
        this.groupsService.updateGroup(group).subscribe(res => {        
          UIkit.modal('#new-group-modal').hide();
          UIkit.notification('Skupina urejena.', {status: 'success', timeout: 2000});
          UIkit.modal('#new-group-modal').hide();
          this.loadGroups();
        }, err => {
          UIkit.notification('Napaka pri urejanju skupine.', {status: 'danger', timeout: 2000});
          console.log(err);
        }); 

        UIkit.modal('#new-group-modal').hide();

      } else {
        //New group
        //Create object
        const group: Group = {
          id:null,
          title:this.groupName,
          users:this.members
        };
        //Send request
        this.groupsService.postGroup(group).subscribe(res => {        
          UIkit.modal('#new-group-modal').hide();
          UIkit.notification('Skupina dodana.', {status: 'success', timeout: 2000});
          UIkit.modal('#new-group-modal').hide();
          this.loadGroups();
        }, err => {
          UIkit.notification('Napaka pri dodajanju nove skupine.', {status: 'danger', timeout: 2000});
          console.log(err);
        });  

        UIkit.modal('#new-group-modal').hide();
      }    
    }

  }

    cancelGroup(){
      this.loadGroups();
    }
}

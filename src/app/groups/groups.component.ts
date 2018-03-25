import { Component, OnInit } from '@angular/core';
import { User } from './extraClasses';
import { SelectedUser } from './extraClasses';
import { Role } from './extraClasses';
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
  group:SelectedUser[];

  constructor() { 
    this.users = [];
    this.roles = [];
    this.group =[];
    this.selectedUser = null;
  }

  ngOnInit() {
  }


  //******** NEW GROUP MODAL *********//

  loadModal(){
    this.loadRoles();
    this.loadUsers();
    this.resetRoles();
    this.group = [];
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

  //On users drop down change
  userSelection(user){
    //save selection
    this.selectedUser = user;
    //reset roles
    this.resetRoles();
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
    }else if(this.group.filter(obj => obj.user == this.selectedUser).length != 0){
      alert("Uporabnik je v skupini.")
    }else if (this.roles[0].checked && this.group.filter(obj => obj.roles.includes(this.roles[0])).length != 0){
      alert("Vloga KanbanMaster je že zasedena!")
    }else if (this.roles[1].checked && this.group.filter(obj => obj.roles.includes(this.roles[1])).length != 0){
      alert("Vloga Product owner je že zasedena!");
    }else{
      this.group.push(new SelectedUser(this.selectedUser,  this.roles.filter(function(role) { return role.checked; })));
    } 
    //Reset roles
    this.resetRoles();
  }
  
  removeMemberfromGroup($event, member:SelectedUser){
    $event.stopPropagation();
    //TODO: don't close modal!
    this.group = this.group.filter(obj => obj !== member);
    
  }

  
  memberToString(member:SelectedUser){
    var temp = "";
    member.roles.forEach(role => {
      temp+=role.name + ", ";
    });
    return temp.substring(0, temp.length - 2) + ": " +member.user.firstName + " " + member.user.lastName;
  }

  resetRoles(){
    this.roles.forEach(role => {
      role.checked = false;
    });
  }

  saveGroup(){
    if (this.group.filter(obj => obj.roles.includes(this.roles[0])).length == 0 || this.group.filter(obj => obj.roles.includes(this.roles[1])).length == 0 || this.group.filter(obj => obj.roles.includes(this.roles[2])).length == 0){
      alert("Skupina mora vsebovati enega Product ownerja, enega KanbanMastra ter vsaj enega razvijalca.");
    }else{
      alert("Skupina dodana.");
      UIkit.modal("#new-group-modal").hide();
    }
  } 

}

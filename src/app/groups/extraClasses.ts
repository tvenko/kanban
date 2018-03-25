//TODO: bind Users roles to class Role

export class User {
  id:number;
  firstName:string;
  lastName:string;
  email:string;
  active: boolean;
  roles: Array<number>;

  constructor(id:number, firstName: string, lastName:string, email:string, active:boolean, roles:Array<number>) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.active = active;
    this.roles = roles;
  }
}

export class SelectedUser{
  user:User;
  roles:Role[];
  constructor(user, roles){
    this.roles = roles;
    this.user = user;
  }
}

export class Role{
  name:string;
  value:number;
  checked:boolean;
  constructor(name,value){
    this.name = name;
    this.value = value;
    this.checked = false;
  }

}
  
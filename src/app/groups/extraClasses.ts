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

export class UserRole{
  user:User;
  roles:Role[];
  constructor(user, roles){
    this.roles = roles;
    this.user = user;
  }
}

export class Role{
  name:string;
  id:number;
  checked:boolean;
  constructor(name,id){
    this.name = name;
    this.id = id;
    this.checked = false;
  }

}

export class Group{
  id:number;
  name:string;
  members:UserRole[];
  constructor(name:string, members:UserRole[], id:number){
    this.name = name;
    this.members = members;
    this.id = id;
  }

}
  
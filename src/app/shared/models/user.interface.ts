
export interface User {
  id_user: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  activate: boolean;
  roles: string[];
}

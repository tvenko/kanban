
export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  activate: boolean;
  roles: string[];
}

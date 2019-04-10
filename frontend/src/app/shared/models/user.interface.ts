
export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  is_active: boolean;
  roles: string[];
}

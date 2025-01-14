import pool from '../db';

export class User {
  id: number;
  email: string;
  password: string;
  role: string;
  name: string;

  constructor(id: number, email: string, password: string, role: string, name: string) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.role = role;
    this.name = name;
  }

}

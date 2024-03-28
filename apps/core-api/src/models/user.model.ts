interface Email {
  primary?: boolean;
  value: string;
  type?: string;
}

export class User {
  id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  emails?: Array<Email>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(userData: {
    id: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    emails?: Array<Email>;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = userData.id;
    this.userName = userData.userName;
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this.emails = userData.emails;
    this.active = userData.active;
    this.createdAt = userData.createdAt;
    this.updatedAt = userData.updatedAt;
  }
}

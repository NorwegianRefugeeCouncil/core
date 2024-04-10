interface Email {
  primary?: boolean;
  value: string;
  type?: string;
}

export class User {
  id: string;
  oktaId?: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  emails?: Array<Email>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(userData: {
    id: string;
    oktaId?: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    emails?: Array<Email>;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = userData.id;
    this.oktaId = userData.oktaId;
    this.userName = userData.userName;
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this.displayName = userData.displayName;
    this.emails = userData.emails;
    this.active = userData.active;
    this.createdAt = userData.createdAt;
    this.updatedAt = userData.updatedAt;
  }
}

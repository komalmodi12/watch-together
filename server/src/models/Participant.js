export const ROLES = {

  HOST:"host",
  MODERATOR:"moderator",
  PARTICIPANT:"participant",
};

export class Participant{
  constructor({userId, username, socketId, role = ROLES.PARTICIPANT}){

    this.userId = userId;
    this.username = username;
    this.socketId = socketId;
    this.role = role;
  }

  toJSON() {
    return {
      userId: this.userId,
      username: this.username,
      role: this.role,
    };
  }
}
export interface Role {
  name : string
}

export interface User {
  nickname : string;
  email : string;
  role : Role;
  notification : boolean;
}

export interface ResetPassword {
  newPassword: string;
  currentPassword: string;
  token: string;
}

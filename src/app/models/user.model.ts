export interface Role {
  name : string
}

export interface User {
  nickname : string;
  email : string;
  role : Role;
  notification : boolean;
}

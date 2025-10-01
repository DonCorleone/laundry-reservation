export interface User {
  sid: string;
  nickname: string;
  name: string;
  picture: string;
  updated_at: string;
  email: string;
  sub: string;
}

export interface ILaundryUser extends User {
  key: string;
  tenant?: string; // Optional tenant code from server config
}

export interface IUser {
  id: string;
  email: string;
  role: "REGULAR" | "ADMIN";
  canSeeNSFW: boolean;
  isProfileCompleted: boolean;
}

export interface IEditUserBody {
  canSeeNSFW?: boolean;
}

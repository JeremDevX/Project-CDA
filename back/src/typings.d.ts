declare namespace Express {
  export interface Request {
    token?: string;
    authUser?: {
      id: number;
      username: string;
      email: string;
    };
  }
}

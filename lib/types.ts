export interface Query {
  id: string;
  userId: string;
  question: string;
  createdAt: Date;
  sharePath?: string;
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface AuthResult {
  type: string
  message: string
}

export interface User {
  id: string
  email: string
  password: string
  salt: string
}

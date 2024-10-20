export interface Query extends Record<string, any> {
  id: string
  userId: string
  question: string
  createdAt: Date
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

export interface User extends Record<string, any> {
  id: string
  email: string
  password: string
  salt: string
}

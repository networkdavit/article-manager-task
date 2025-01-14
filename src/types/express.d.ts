import { UserDTO } from "../dtos/user.dto";

declare global {
  namespace Express {
    interface Request {
      user?: UserDTO;
    }
  }
}

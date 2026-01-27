import type { ServiceResponse } from "@/types/service";
import type { CreateUserDTO, User } from "../sdk/types";
import { AuthService } from "../services/auth-service";
import type { APIContext } from "astro";

export class RegisterAuthAction {
  public static async run(
    input: CreateUserDTO,
    context: APIContext,
  ): Promise<ServiceResponse<User>> {
    return AuthService.register(input);
  }
}

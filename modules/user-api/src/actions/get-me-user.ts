import type { ServiceResponse } from "@/types/service";
import type { User } from "../sdk/types";
import { UserService } from "../services/user-service";
import type { APIContext } from "astro";

export class GetMeUserAction {
  public static async run(
    input: any,
    context: APIContext,
  ): Promise<ServiceResponse<User>> {
    const userId = input.userId || (context.locals as any)?.actor?.id;

    if (!userId) {
      return { success: false, error: "user.service.error.missing_user_id" };
    }

    return UserService.get(userId);
  }
}

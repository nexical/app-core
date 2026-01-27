import { db } from "@/lib/core/db";
import type { ServiceResponse } from "@/types/service";
import type {
  ValidateResetTokenDTO,
  ValidateResetTokenResponseDTO,
} from "../sdk/types";
import type { APIContext } from "astro";

export const validateResetToken = async (
  input: ValidateResetTokenDTO,
): Promise<ValidateResetTokenResponseDTO> => {
  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token: input.token },
    });

    if (!resetToken || new Date() > resetToken.expires) {
      return { valid: false };
    }

    return {
      valid: true,
      email: resetToken.email,
    };
  } catch (e) {
    return { valid: false };
  }
};

export class ValidateResetTokenAuthAction {
  public static async run(
    input: ValidateResetTokenDTO,
    context: APIContext,
  ): Promise<ServiceResponse<ValidateResetTokenResponseDTO>> {
    return { success: true, data: {} as any };
  }
}

import bcrypt from 'bcryptjs';

// GENERATED CODE - DO NOT MODIFY
export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export const factories = {
  userUi: (index: number) => {
    return {
      name: `name_${index}`,
    };
  },
};

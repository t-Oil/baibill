import { z } from 'zod';

export const inviteSchema = z.object({
    inviteInput: z
        .string()
        .min(1, 'Email or User ID is required')
        .refine(
            (val) => {
                // Must be a valid email OR a number string
                const isEmail = z.string().email().safeParse(val).success;
                const isNumber = /^\d+$/.test(val);
                return isEmail || isNumber;
            },
            {
                message: 'Must be a valid email or user ID (numeric)',
            }
        ),
    roleId: z.number({ required_error: 'Role is required' }),
});

export type InviteSchema = z.infer<typeof inviteSchema>;

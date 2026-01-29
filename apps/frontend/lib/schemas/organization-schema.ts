import { z } from 'zod';

export const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  description: z.string().optional(),
});

export type OrganizationSchema = z.infer<typeof organizationSchema>;

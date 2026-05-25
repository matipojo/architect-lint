import { z } from 'zod';
import { STACKS } from './catalog-meta.js';

export const ConsumerConfigSchema = z.object({
  stacks: z.array(z.enum(STACKS)).min(1, 'At least one stack is required'),
  scope: z.enum(['changed', 'all']).default('changed'),
  preset: z.enum(['recommended', 'baseline', 'strict', 'all']).default('recommended'),
});

export type ConsumerConfig = z.infer<typeof ConsumerConfigSchema>;

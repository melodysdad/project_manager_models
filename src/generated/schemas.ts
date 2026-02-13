// Auto-generated from contracts/PRIMITIVES.md
// Do not edit manually

import { z } from "zod";

/**
 * Represents a person, system, or AI that can participate in conversations, decisions, and work.
 */
export const ActorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  display_name: z.string(),
  type: z.enum(['HUMAN', 'SYSTEM', 'AI']),
  community_id: z.string().uuid().optional(),
  external_identities: z.string(),
  avatar_url: z.string().optional(),
  created_at: z.union([z.date(), z.number()]),
  updated_at: z.union([z.date(), z.number()]),
}).strict();

export type Actor = z.infer<typeof ActorSchema>;

/**
 * Represents a group of Actors who participate in in conversations and tasks
 */
export const CommunitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
}).strict();

export type Community = z.infer<typeof CommunitySchema>;

/**
 * A commitment to perform work authorized by a ConversationCheckpoint
 */
export const TasksSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  checkpoint_id: z.string().uuid(),
  instructions: z.string(),
  assigned_to: z.string().uuid().optional(),
  created_at: z.union([z.date(), z.number()]),
}).strict();

export type Tasks = z.infer<typeof TasksSchema>;

/**
 * An immutable record of task progress or completion.
 */
export const TaskCheckpointSchema = z.object({
  id: z.string().uuid(),
  task_id: z.string().uuid(),
  type: z.enum(['WORK_STARTED', 'WORK_PAUSED', 'WORK_COMPLETED', 'WORK_REJECTED', 'WORK_APPROVED']),
  created_at: z.union([z.date(), z.number()]),
}).strict();

export type TaskCheckpoint = z.infer<typeof TaskCheckpointSchema>;


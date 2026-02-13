// Auto-generated from contracts/PRIMITIVES.md
// Do not edit manually

/**
 * Represents a person, system, or AI that can participate in conversations, decisions, and work.
 */
export interface Actor {
  id: string;
  name: string;
  display_name: string;
  type: 'HUMAN' | 'SYSTEM' | 'AI';
  community_id?: string;
  external_identities: string;
  avatar_url?: string;
  created_at: Date | number;
  updated_at: Date | number;
}

/**
 * Represents a group of Actors who participate in in conversations and tasks
 */
export interface Community {
  id: string;
  name: string;
  description?: string;
}

/**
 * A commitment to perform work authorized by a ConversationCheckpoint
 */
export interface Tasks {
  id: string;
  conversation_id: string;
  checkpoint_id: string;
  instructions: string;
  assigned_to?: string;
  created_at: Date | number;
}

/**
 * An immutable record of task progress or completion.
 */
export interface TaskCheckpoint {
  id: string;
  task_id: string;
  type: 'WORK_STARTED' | 'WORK_PAUSED' | 'WORK_COMPLETED' | 'WORK_REJECTED' | 'WORK_APPROVED';
  created_at: Date | number;
}


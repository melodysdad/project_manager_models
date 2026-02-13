/**
 * Zod validation schemas for GitHub webhook payloads
 * Use these to validate incoming webhook data at runtime
 */

import { z } from "zod";

/**
 * GitHub user/actor schema
 */
export const GitHubUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  node_id: z.string(),
  avatar_url: z.string().url(),
  gravatar_id: z.string(),
  url: z.string().url(),
  html_url: z.string().url(),
  followers_url: z.string().url(),
  following_url: z.string().url(),
  gists_url: z.string().url(),
  starred_url: z.string().url(),
  subscriptions_url: z.string().url(),
  organizations_url: z.string().url(),
  repos_url: z.string().url(),
  events_url: z.string().url(),
  received_events_url: z.string().url(),
  type: z.enum(["User", "Organization"]),
  user_view_type: z.string(),
  site_admin: z.boolean(),
});

/**
 * GitHub organization schema
 */
export const GitHubOrganizationSchema = z.object({
  login: z.string(),
  id: z.number(),
  node_id: z.string(),
  url: z.string().url(),
  repos_url: z.string().url(),
  events_url: z.string().url(),
  hooks_url: z.string().url(),
  issues_url: z.string().url(),
  members_url: z.string().url(),
  public_members_url: z.string().url(),
  avatar_url: z.string().url(),
  description: z.string().nullable(),
});

/**
 * Projects V2 object schema
 */
export const ProjectsV2Schema = z.object({
  id: z.number(),
  node_id: z.string(),
  owner: GitHubUserSchema,
  creator: GitHubUserSchema,
  title: z.string(),
  description: z.string().nullable(),
  public: z.boolean(),
  closed_at: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  number: z.number(),
  short_description: z.string().nullable(),
  deleted_at: z.string().nullable(),
  deleted_by: GitHubUserSchema.nullable(),
});

/**
 * Projects V2 Item schema
 */
export const ProjectsV2ItemSchema = z.object({
  id: z.number(),
  node_id: z.string(),
  owner: GitHubUserSchema,
  creator: GitHubUserSchema,
  title: z.string(),
  description: z.string().nullable(),
  public: z.boolean(),
  closed_at: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  number: z.number(),
  short_description: z.string().nullable(),
  deleted_at: z.string().nullable(),
  deleted_by: GitHubUserSchema.nullable(),
});

/**
 * Projects V2 Item Edited webhook schema
 *
 * Validates the complete webhook payload for projects_v2_item.edited events
 */
export const ProjectsV2ItemEditedPayloadSchema = z.object({
  action: z.enum(["edited", "created", "deleted", "reopened", "archived"]),
  projects_v2: ProjectsV2Schema,
  projects_v2_item: z
    .object({
      id: z.number(),
      node_id: z.string(),
    })
    .optional(),
  changes: z
    .record(
      z.object({
        from: z.unknown(),
        to: z.unknown(),
      })
    )
    .optional(),
  organization: GitHubOrganizationSchema,
  sender: GitHubUserSchema,
  installation: z
    .object({
      id: z.number(),
      node_id: z.string(),
    })
    .optional(),
  repository: z
    .object({
      id: z.number(),
      node_id: z.string(),
      name: z.string(),
      full_name: z.string(),
      private: z.boolean(),
    })
    .optional(),
});

/**
 * GitHub Issues webhook schema
 */
export const IssueSchema = z.object({
  url: z.string().url(),
  repository_url: z.string().url(),
  labels_url: z.string().url(),
  id: z.number(),
  node_id: z.string(),
  number: z.number(),
  title: z.string(),
  user: GitHubUserSchema,
  labels: z.array(
    z.object({
      id: z.number(),
      node_id: z.string(),
      url: z.string().url(),
      name: z.string(),
      color: z.string(),
      default: z.boolean(),
      description: z.string().nullable(),
    })
  ),
  state: z.enum(["open", "closed"]),
  locked: z.boolean(),
  assignee: GitHubUserSchema.nullable(),
  assignees: z.array(GitHubUserSchema),
  milestone: z.unknown().nullable(),
  comments: z.number(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  closed_at: z.string().datetime().nullable(),
  body: z.string().nullable(),
  author_association: z.string(),
  reactions: z.record(z.number()),
});

export const IssuesPayloadSchema = z.object({
  action: z.string(),
  issue: IssueSchema,
  organization: GitHubOrganizationSchema,
  repository: z.object({
    id: z.number(),
    node_id: z.string(),
    name: z.string(),
    full_name: z.string(),
    private: z.boolean(),
    owner: GitHubUserSchema,
    html_url: z.string().url(),
    description: z.string().nullable(),
    url: z.string().url(),
  }),
  sender: GitHubUserSchema,
});

/**
 * GitHub Pull Request schema
 */
export const PullRequestSchema = z.object({
  url: z.string().url(),
  id: z.number(),
  node_id: z.string(),
  html_url: z.string().url(),
  diff_url: z.string().url(),
  patch_url: z.string().url(),
  issue_url: z.string().url(),
  number: z.number(),
  state: z.enum(["open", "closed"]),
  locked: z.boolean(),
  title: z.string(),
  user: GitHubUserSchema,
  body: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  closed_at: z.string().datetime().nullable(),
  merged_at: z.string().datetime().nullable(),
  merge_commit_sha: z.string().nullable(),
  assignee: GitHubUserSchema.nullable(),
  assignees: z.array(GitHubUserSchema),
  requested_reviewers: z.array(GitHubUserSchema),
  draft: z.boolean(),
  commits: z.number(),
  additions: z.number(),
  deletions: z.number(),
  changed_files: z.number(),
});

export const PullRequestPayloadSchema = z.object({
  action: z.string(),
  number: z.number(),
  pull_request: PullRequestSchema,
  repository: z.object({
    id: z.number(),
    node_id: z.string(),
    name: z.string(),
    full_name: z.string(),
    private: z.boolean(),
    owner: GitHubUserSchema,
  }),
  sender: GitHubUserSchema,
});

/**
 * GitHub Push webhook schema
 */
export const CommitSchema = z.object({
  id: z.string(),
  tree_id: z.string(),
  distinct: z.boolean(),
  message: z.string(),
  timestamp: z.string().datetime(),
  url: z.string().url(),
  author: z.object({
    name: z.string(),
    email: z.string().email(),
    username: z.string(),
  }),
  committer: z.object({
    name: z.string(),
    email: z.string().email(),
    username: z.string(),
  }),
  added: z.array(z.string()),
  removed: z.array(z.string()),
  modified: z.array(z.string()),
});

export const PushPayloadSchema = z.object({
  ref: z.string(),
  before: z.string(),
  after: z.string(),
  repository: z.object({
    id: z.number(),
    node_id: z.string(),
    name: z.string(),
    full_name: z.string(),
    private: z.boolean(),
    owner: GitHubUserSchema,
  }),
  pusher: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  sender: GitHubUserSchema,
  created: z.boolean(),
  deleted: z.boolean(),
  forced: z.boolean(),
  compare: z.string().url(),
  commits: z.array(CommitSchema),
  head_commit: CommitSchema.nullable(),
});

/**
 * Helper function to validate and parse a GitHub webhook payload
 *
 * @example
 * ```typescript
 * try {
 *   const payload = validateGitHubPayload(
 *     body,
 *     ProjectsV2ItemEditedPayloadSchema
 *   );
 *   // payload is now fully typed and validated
 * } catch (error) {
 *   // handle validation error
 *   console.error('Invalid webhook payload:', error.errors);
 * }
 * ```
 */
export function validateGitHubPayload<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T {
  return schema.parse(data);
}

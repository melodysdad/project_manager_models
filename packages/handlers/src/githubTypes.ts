/**
 * GitHub webhook types
 * Based on official GitHub webhook documentation
 */

/**
 * GitHub user/actor object
 */
export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: "User" | "Organization";
  user_view_type: string;
  site_admin: boolean;
}

/**
 * GitHub organization object
 */
export interface GitHubOrganization {
  login: string;
  id: number;
  node_id: string;
  url: string;
  repos_url: string;
  events_url: string;
  hooks_url: string;
  issues_url: string;
  members_url: string;
  public_members_url: string;
  avatar_url: string;
  description: string | null;
}

/**
 * Projects V2 item object
 * Represents an issue/PR in a GitHub Project V2
 */
export interface ProjectsV2Item {
  id: number;
  node_id: string;
  owner: GitHubUser;
  creator: GitHubUser;
  title: string;
  description: string | null;
  public: boolean;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  number: number;
  short_description: string | null;
  deleted_at: string | null;
  deleted_by: GitHubUser | null;
}

/**
 * Projects V2 object
 */
export interface ProjectsV2 {
  id: number;
  node_id: string;
  owner: GitHubUser;
  creator: GitHubUser;
  title: string;
  description: string | null;
  public: boolean;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  number: number;
  short_description: string | null;
  deleted_at: string | null;
  deleted_by: GitHubUser | null;
}

/**
 * Projects V2 Item Edited webhook payload
 *
 * Fired when a project item is edited
 * https://docs.github.com/en/webhooks/webhook-events-and-payloads#projects_v2_item
 */
export interface ProjectsV2ItemEditedPayload {
  action: "edited" | "created" | "deleted" | "reopened" | "archived";
  projects_v2: ProjectsV2;
  projects_v2_item?: {
    id: number;
    node_id: string;
  };
  changes?: Record<string, { from: unknown; to: unknown }>;
  organization: GitHubOrganization;
  sender: GitHubUser;
  installation?: {
    id: number;
    node_id: string;
  };
  repository?: {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
  };
}

/**
 * GitHub Issues webhook payload
 */
export interface IssuesPayload {
  action: string;
  issue: {
    url: string;
    repository_url: string;
    labels_url: string;
    id: number;
    node_id: string;
    number: number;
    title: string;
    user: GitHubUser;
    labels: Array<{
      id: number;
      node_id: string;
      url: string;
      name: string;
      color: string;
      default: boolean;
      description: string | null;
    }>;
    state: "open" | "closed";
    locked: boolean;
    assignee: GitHubUser | null;
    assignees: GitHubUser[];
    milestone: unknown | null;
    comments: number;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    body: string | null;
    author_association: string;
    reactions: Record<string, number>;
  };
  organization: GitHubOrganization;
  repository: {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: GitHubUser;
    html_url: string;
    description: string | null;
    url: string;
  };
  sender: GitHubUser;
}

/**
 * GitHub Pull Request webhook payload
 */
export interface PullRequestPayload {
  action: string;
  number: number;
  pull_request: {
    url: string;
    id: number;
    node_id: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
    issue_url: string;
    number: number;
    state: "open" | "closed";
    locked: boolean;
    title: string;
    user: GitHubUser;
    body: string | null;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    merged_at: string | null;
    merge_commit_sha: string | null;
    assignee: GitHubUser | null;
    assignees: GitHubUser[];
    requested_reviewers: GitHubUser[];
    draft: boolean;
    commits: number;
    additions: number;
    deletions: number;
    changed_files: number;
  };
  repository: {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: GitHubUser;
  };
  sender: GitHubUser;
}

/**
 * GitHub Push webhook payload
 */
export interface PushPayload {
  ref: string;
  before: string;
  after: string;
  repository: {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: GitHubUser;
  };
  pusher: {
    name: string;
    email: string;
  };
  sender: GitHubUser;
  created: boolean;
  deleted: boolean;
  forced: boolean;
  compare: string;
  commits: Array<{
    id: string;
    tree_id: string;
    distinct: boolean;
    message: string;
    timestamp: string;
    url: string;
    author: {
      name: string;
      email: string;
      username: string;
    };
    committer: {
      name: string;
      email: string;
      username: string;
    };
    added: string[];
    removed: string[];
    modified: string[];
  }>;
  head_commit: {
    id: string;
    tree_id: string;
    distinct: boolean;
    message: string;
    timestamp: string;
    url: string;
    author: {
      name: string;
      email: string;
      username: string;
    };
    committer: {
      name: string;
      email: string;
      username: string;
    };
    added: string[];
    removed: string[];
    modified: string[];
  } | null;
}

import { graphql } from "@octokit/graphql";
import { Octokit } from "@octokit/rest";

export function githubGraphql<T>(
  token: string, query: string, vars: Record<string, unknown>,
): Promise<T> {
  return graphql<T>(query, { ...vars, headers: { authorization: `token ${token}` } });
}

export function githubRest(token: string): Octokit {
  return new Octokit({ auth: token });
}

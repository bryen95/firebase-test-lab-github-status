import { Octokit } from '@octokit/rest';
import { testLab } from "firebase-functions/v1";

// Validate and parse Test Lab event for GitHub status
function parseTestMatrixEvent(event: testLab.TestMatrix) {

  // Extract GitHub metadata from test matrix
  const gitHubMetadata = event.resultStorage?.gcsPath
    ?.match(/github-(\w+)-(\w+)-([0-9a-f]{40})/)
    ?.slice(1);

  if (!gitHubMetadata) {
    throw new Error(`Invalid GitHub metadata payload for test matrix ${event.testMatrixId}`);
  }

  return {
    owner: gitHubMetadata[0],
    repo: gitHubMetadata[1],
    commitSha: gitHubMetadata[2]
  };
}

// Determine GitHub status based on test matrix result
function determineStatus(event: testLab.TestMatrix): 'success' | 'failure' | 'pending' {
  const { state, outcomeSummary } = event;

  if (state === 'PENDING') return 'pending';

  switch (outcomeSummary) {
    case 'SUCCESS': return 'success';
    case 'FAILURE': return 'failure';
    default: return 'failure';
  }
}

export const testLabGitHubStatusUpdate = testLab.testMatrix().onComplete((matrix, context) =>
  async () => {
    try {
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
      });

      const { owner, repo, commitSha } = parseTestMatrixEvent(matrix);
      const status = determineStatus(matrix);

      await octokit.repos.createCommitStatus({
        owner,
        repo,
        sha: commitSha,
        state: status,
        context: 'firebase-test-lab/android-tests',
        description: 'Firebase Test Lab Instrumentation Tests'
      });
    } catch (error) {
      console.error(`GitHub status update failed for matrix ${matrix.testMatrixId}`, error);
      throw error;
    }
  }
);
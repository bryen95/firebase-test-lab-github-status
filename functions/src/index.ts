import { Octokit } from '@octokit/rest';
import { logger, testLab } from "firebase-functions/v1";

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

export const testLabGitHubStatusUpdate = testLab.testMatrix().onComplete((testMatrix) => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  const owner = process.env.GITHUB_OWNER;
  logger.log(owner);
  const repo = process.env.GITHUB_REPO;
  logger.log(repo);
  const commitSha = testMatrix.clientInfo.details['commitSha'];
  if (commitSha === undefined) {
    logger.log(`No commit SHA found in test matrix event: ${commitSha}`);
    return;
  }
  logger.log(commitSha);
  const status = determineStatus(testMatrix);
  logger.log(status);
  const targetUrl = `https://console.firebase.google.com/project/${process.env.GCP_PROJECT}/testlab/histories/`;
  logger.log(targetUrl);

  octokit.repos.createCommitStatus({
    owner,
    repo,
    sha: commitSha,
    state: status,
    target_url: targetUrl,
    context: 'Firebase Test Lab',
    description: 'Firebase Test Lab Instrumented Tests'
  }).catch((error) => {
    logger.error(`GitHub status update failed for matrix ${testMatrix.testMatrixId}`, error);
    throw error;
  })

  return null;
});

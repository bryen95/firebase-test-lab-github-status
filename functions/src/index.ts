import { Octokit } from '@octokit/rest';
import { logger } from "firebase-functions";
import { defineSecret } from 'firebase-functions/params';
import { testLab } from "firebase-functions/v2";

const ghToken = defineSecret('GITHUB_TOKEN');
const ghOwner = defineSecret('GITHUB_OWNER');
const ghRepo = defineSecret('GITHUB_REPO');

function determineStatus(state: string, outcomeSummary: string): 'success' | 'failure' | 'pending' {
  if (state === 'PENDING') return 'pending';

  switch (outcomeSummary) {
    case 'SUCCESS': return 'success';
    case 'FAILURE': return 'failure';
    default: return 'failure';
  }
}

export const testLabGitHubStatusUpdate = testLab.onTestMatrixCompleted(
  { secrets: [ghToken, ghOwner, ghRepo] },
  async (event) => {
    const { testMatrixId, state, outcomeSummary, clientInfo } = event.data;

    logger.log(testMatrixId);
    logger.log(state);
    logger.log(outcomeSummary);
    logger.log(clientInfo.details);
    logger.log(ghToken.value());
    logger.log(ghOwner.value());
    logger.log(ghRepo.value());

    const octokit = new Octokit({ auth: ghToken });

    const commitSha = clientInfo.details['commitSha'];
    if (commitSha === undefined) {
      logger.log(`No commit SHA found in test matrix event: ${commitSha}`);
      return;
    }
    logger.log(commitSha);
    const status = determineStatus(state, outcomeSummary);
    logger.log(status);
    const targetUrl = `https://console.firebase.google.com/project/${process.env.GCP_PROJECT}/testlab/histories/`;
    logger.log(targetUrl);

    octokit.repos.createCommitStatus({
      owner: ghOwner.value(),
      repo: ghRepo.value(),
      sha: commitSha,
      state: status,
      target_url: targetUrl,
      context: 'Firebase Test Lab',
      description: 'Firebase Test Lab Instrumented Tests'
    }).catch((error) => {
      logger.error(`GitHub status update failed for matrix ${testMatrixId}`, error);
      throw error;
    })

    return null;
  });

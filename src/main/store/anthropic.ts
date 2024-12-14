import { Anthropic } from '@anthropic-ai/sdk';
import { AnthropicBedrock } from '@anthropic-ai/bedrock-sdk';
import { fromIni } from '@aws-sdk/credential-providers';
import dotenv from 'dotenv';
import { log } from 'console';

dotenv.config();

async function createProvider() {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  let hasBedrockCreds = false;
  try {
    fromIni({ profile: 'bedrock' });
    hasBedrockCreds = true;
  } catch (e) {
    hasBedrockCreds = false;
    throw e;
  }

  // If neither credentials exist, throw error
  if (!anthropicApiKey && !hasBedrockCreds) {
    throw new Error(
      'No credentials found. Please provide either ANTHROPIC_API_KEY or valid AWS credentials.',
    );
  }

  if (anthropicApiKey) {
    return new Anthropic({
      apiKey: anthropicApiKey,
      baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
    });
  }

  // Fall back to Bedrock if AWS creds are available
  const region = process.env.AWS_REGION || 'us-west-2';
  const credentials = await fromIni({ profile: 'bedrock' })();
  return new AnthropicBedrock({
    baseURL: `https://bedrock-runtime.${region}.amazonaws.com`,
    awsRegion: region,
    ...credentials,
  });
}

export const anthropic = createProvider();

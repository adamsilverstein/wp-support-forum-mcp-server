import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { SupportFeedClient } from '../services/support-feed.js';

const GetSupportTopicsSchema = z.object({
  plugin_slug: z.string().describe('The WordPress plugin slug'),
  limit: z.number().optional().default(20).describe('Number of topics to retrieve (default: 20)')
});

export const getSupportTopicsTool: Tool = {
  name: 'get_support_topics',
  description: 'Get recent support topics and issues for a WordPress plugin from the support forum RSS feed',
  inputSchema: {
    type: 'object',
    properties: {
      plugin_slug: {
        type: 'string',
        description: 'The WordPress plugin slug (e.g., "mathml-block")'
      },
      limit: {
        type: 'number',
        description: 'Number of topics to retrieve (default: 20)',
        minimum: 1,
        maximum: 100
      }
    },
    required: ['plugin_slug']
  }
};

export async function handleGetSupportTopics(args: unknown) {
  const { plugin_slug, limit } = GetSupportTopicsSchema.parse(args);
  const client = new SupportFeedClient();
  
  try {
    const topics = await client.getRecentTopics(plugin_slug, limit);
    
    if (topics.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No support topics found for plugin '${plugin_slug}'`
          }
        ]
      };
    }

    const formattedTopics = topics.map(topic => ({
      title: topic.title,
      link: topic.link,
      date: topic.pubDate,
      description: topic.description?.substring(0, 200) + (topic.description?.length > 200 ? '...' : ''),
      author: topic.author
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            plugin: plugin_slug,
            total_topics: topics.length,
            topics: formattedTopics
          }, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { WordPressAPIClient } from '../services/wordpress-api.js';

const GetPluginInfoSchema = z.object({
  plugin_slug: z.string().describe('The WordPress plugin slug (e.g., "mathml-block")')
});

export const getPluginInfoTool: Tool = {
  name: 'get_plugin_info',
  description: 'Get detailed information about a WordPress plugin including ratings, downloads, and metadata',
  inputSchema: {
    type: 'object',
    properties: {
      plugin_slug: {
        type: 'string',
        description: 'The WordPress plugin slug (e.g., "mathml-block")'
      }
    },
    required: ['plugin_slug']
  }
};

export async function handleGetPluginInfo(args: unknown) {
  const { plugin_slug } = GetPluginInfoSchema.parse(args);
  const client = new WordPressAPIClient();
  
  try {
    const pluginInfo = await client.getPluginInfo(plugin_slug);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            name: pluginInfo.name,
            version: pluginInfo.version,
            author: pluginInfo.author,
            rating: pluginInfo.rating,
            total_ratings: pluginInfo.num_ratings,
            downloads: pluginInfo.downloaded,
            support_threads: pluginInfo.support_threads,
            wordpress_version: {
              requires: pluginInfo.requires,
              tested: pluginInfo.tested
            },
            php_version: pluginInfo.requires_php,
            homepage: pluginInfo.homepage,
            description: pluginInfo.description ? 
              (pluginInfo.description.length > 500 ? 
                pluginInfo.description.substring(0, 500) + '...' : 
                pluginInfo.description) : '',
            tags: Object.keys(pluginInfo.tags || {}).slice(0, 10)
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
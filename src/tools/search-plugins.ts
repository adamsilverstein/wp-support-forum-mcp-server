import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { WordPressAPIClient } from '../services/wordpress-api.js';

const SearchPluginsSchema = z.object({
  query: z.string().describe('Search query for WordPress plugins'),
  page: z.number().optional().default(1).describe('Page number (default: 1)'),
  per_page: z.number().optional().default(10).describe('Results per page (default: 10)')
});

export const searchPluginsTool: Tool = {
  name: 'search_plugins',
  description: 'Search for WordPress plugins by keyword or name',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query for WordPress plugins'
      },
      page: {
        type: 'number',
        description: 'Page number (default: 1)',
        minimum: 1
      },
      per_page: {
        type: 'number',
        description: 'Results per page (default: 10)',
        minimum: 1,
        maximum: 50
      }
    },
    required: ['query']
  }
};

export async function handleSearchPlugins(args: unknown) {
  const { query, page, per_page } = SearchPluginsSchema.parse(args);
  const client = new WordPressAPIClient();
  
  try {
    const results = await client.searchPlugins(query, page, per_page);
    
    if (!results.plugins || results.plugins.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No plugins found for query: "${query}"`
          }
        ]
      };
    }

    const formattedResults = {
      query,
      total_results: results.info?.results || 0,
      page: results.info?.page || page,
      pages: results.info?.pages || 1,
      plugins: results.plugins.map((plugin: any) => ({
        name: plugin.name,
        slug: plugin.slug,
        version: plugin.version,
        author: plugin.author,
        rating: plugin.rating,
        num_ratings: plugin.num_ratings,
        downloaded: plugin.downloaded,
        last_updated: plugin.last_updated,
        short_description: plugin.short_description,
        homepage: plugin.homepage,
        tags: Object.keys(plugin.tags || {}).slice(0, 5)
      }))
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(formattedResults, null, 2)
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
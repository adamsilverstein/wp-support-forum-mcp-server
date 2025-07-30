#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { getPluginInfoTool, handleGetPluginInfo } from './tools/plugin-info.js';
import { getSupportTopicsTool, handleGetSupportTopics } from './tools/support-topics.js';
import { analyzeTopIssuesTool, handleAnalyzeTopIssues } from './tools/top-issues.js';
import { searchPluginsTool, handleSearchPlugins } from './tools/search-plugins.js';

class WordPressSupportForumMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'wp-support-forum-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          getPluginInfoTool,
          getSupportTopicsTool,
          analyzeTopIssuesTool,
          searchPluginsTool,
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_plugin_info':
            return await handleGetPluginInfo(args);
          case 'get_support_topics':
            return await handleGetSupportTopics(args);
          case 'analyze_top_issues':
            return await handleAnalyzeTopIssues(args);
          case 'search_plugins':
            return await handleSearchPlugins(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool '${name}': ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Server is now running and will handle requests via stdio
    console.error('WP Support Forum MCP Server running on stdio');
  }
}

// Start the server
const server = new WordPressSupportForumMCPServer();
server.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
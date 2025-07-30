import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { SupportFeedClient } from '../services/support-feed.js';
import { IssueAnalyzer } from '../services/issue-analyzer.js';

const AnalyzeTopIssuesSchema = z.object({
  plugin_slug: z.string().describe('The WordPress plugin slug'),
  max_topics: z.number().optional().default(50).describe('Maximum number of topics to analyze (default: 50)')
});

export const analyzeTopIssuesTool: Tool = {
  name: 'analyze_top_issues',
  description: 'Analyze support topics to identify the most common issues and problems reported by users for a WordPress plugin',
  inputSchema: {
    type: 'object',
    properties: {
      plugin_slug: {
        type: 'string',
        description: 'The WordPress plugin slug (e.g., "mathml-block")'
      },
      max_topics: {
        type: 'number',
        description: 'Maximum number of topics to analyze (default: 50)',
        minimum: 10,
        maximum: 200
      }
    },
    required: ['plugin_slug']
  }
};

export async function handleAnalyzeTopIssues(args: unknown) {
  const { plugin_slug, max_topics } = AnalyzeTopIssuesSchema.parse(args);
  const feedClient = new SupportFeedClient();
  const analyzer = new IssueAnalyzer();
  
  try {
    const topics = await feedClient.getRecentTopics(plugin_slug, max_topics);
    
    if (topics.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No support topics found for analysis of plugin '${plugin_slug}'`
          }
        ]
      };
    }

    const analysis = analyzer.analyzeTopics(plugin_slug, topics);

    const summary = {
      plugin: analysis.plugin,
      total_topics_analyzed: analysis.totalTopics,
      top_keywords: analysis.commonKeywords.slice(0, 10),
      issue_categories: analysis.issueCategories.map(cat => ({
        category: cat.category,
        count: cat.count,
        percentage: analysis.totalTopics > 0 ? Math.round((cat.count / analysis.totalTopics) * 100) : 0,
        sample_topics: cat.topics.slice(0, 3).map(topic => ({
          title: topic.title,
          link: topic.link,
          date: topic.pubDate
        }))
      })),
      recent_issues: analysis.recentIssues.slice(0, 5).map(issue => ({
        title: issue.title,
        link: issue.link,
        date: issue.pubDate,
        description: issue.description?.substring(0, 150) + (issue.description?.length > 150 ? '...' : '')
      }))
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(summary, null, 2)
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
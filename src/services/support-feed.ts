import axios from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { SupportFeed, SupportTopic } from '../types/index.js';

const parseXML = promisify(parseString);

export class SupportFeedClient {
  async getFeedForPlugin(pluginSlug: string): Promise<SupportFeed> {
    const feedUrl = `https://wordpress.org/support/plugin/${pluginSlug}/feed/`;
    
    try {
      const response = await axios.get(feedUrl, {
        headers: {
          'User-Agent': 'WP-Support-Forum-MCP-Server/1.0.0'
        }
      });

      const parsed: any = await parseXML(response.data);
      const channel = parsed.rss?.channel?.[0];
      
      if (!channel) {
        throw new Error('Invalid RSS feed structure');
      }

      const items: SupportTopic[] = (channel.item || []).map((item: any) => ({
        title: item.title?.[0] || '',
        link: item.link?.[0] || '',
        description: item.description?.[0] || '',
        pubDate: item.pubDate?.[0] || '',
        guid: item.guid?.[0]?._ || item.guid?.[0] || '',
        author: item['dc:creator']?.[0] || undefined,
        category: item.category?.[0] || undefined
      }));

      return {
        title: channel.title?.[0] || '',
        description: channel.description?.[0] || '',
        link: channel.link?.[0] || '',
        items
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Support feed for plugin '${pluginSlug}' not found`);
      }
      throw new Error(`Failed to fetch support feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRecentTopics(pluginSlug: string, limit = 10): Promise<SupportTopic[]> {
    const feed = await this.getFeedForPlugin(pluginSlug);
    return feed.items.slice(0, limit);
  }
}
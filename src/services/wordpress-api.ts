import axios from 'axios';
import { PluginInfo } from '../types/index.js';

export class WordPressAPIClient {
  private baseURL = 'https://api.wordpress.org/plugins/info/1.0';

  async getPluginInfo(pluginSlug: string): Promise<PluginInfo> {
    try {
      const response = await axios.get(`${this.baseURL}/${pluginSlug}.json`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`Plugin '${pluginSlug}' not found`);
      }
      throw new Error(`Failed to fetch plugin info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchPlugins(query: string, page = 1, perPage = 10): Promise<any> {
    try {
      const response = await axios.get(`https://api.wordpress.org/plugins/info/1.1/`, {
        params: {
          action: 'query_plugins',
          request: {
            search: query,
            page,
            per_page: perPage,
            fields: {
              short_description: true,
              description: false,
              sections: false,
              tested: true,
              requires: true,
              rating: true,
              ratings: true,
              downloaded: true,
              downloadlink: false,
              last_updated: true,
              homepage: true,
              tags: true,
              author: true
            }
          }
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search plugins: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
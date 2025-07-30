export interface PluginInfo {
  name: string;
  slug: string;
  version: string;
  author: string;
  author_profile: string;
  requires: string;
  tested: string;
  requires_php: string;
  rating: number;
  ratings: Record<string, number>;
  num_ratings: number;
  support_threads: number;
  downloaded: number;
  description: string;
  installation: string;
  changelog: string;
  homepage: string;
  download_link: string;
  tags: Record<string, string>;
}

export interface SupportTopic {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  author?: string;
  category?: string;
}

export interface SupportFeed {
  title: string;
  description: string;
  link: string;
  items: SupportTopic[];
}

export interface TopIssuesAnalysis {
  plugin: string;
  totalTopics: number;
  commonKeywords: Array<{
    keyword: string;
    frequency: number;
    percentage: number;
  }>;
  recentIssues: SupportTopic[];
  issueCategories: Array<{
    category: string;
    count: number;
    topics: SupportTopic[];
  }>;
}
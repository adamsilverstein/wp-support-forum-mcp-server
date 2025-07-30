import { SupportTopic, TopIssuesAnalysis } from '../types/index.js';

export class IssueAnalyzer {
  private commonStopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'cannot', 'not', 'no', 'yes',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'wordpress', 'plugin',
    'how', 'what', 'when', 'where', 'why', 'which', 'who', 'please', 'help', 'thanks', 'thank'
  ]);

  analyzeTopics(pluginSlug: string, topics: SupportTopic[]): TopIssuesAnalysis {
    const keywords = this.extractKeywords(topics);
    const categories = this.categorizeIssues(topics);
    const recentIssues = topics.slice(0, 10);

    return {
      plugin: pluginSlug,
      totalTopics: topics.length,
      commonKeywords: keywords,
      recentIssues,
      issueCategories: categories
    };
  }

  private extractKeywords(topics: SupportTopic[]): Array<{ keyword: string; frequency: number; percentage: number }> {
    const wordCounts = new Map<string, number>();
    const totalWords = topics.length;

    topics.forEach(topic => {
      const text = `${topic.title} ${topic.description}`.toLowerCase();
      const words = text.match(/\b[a-z]{3,}\b/g) || [];
      
      words.forEach(word => {
        if (!this.commonStopWords.has(word)) {
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
      });
    });

    return Array.from(wordCounts.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([keyword, frequency]) => ({
        keyword,
        frequency,
        percentage: Math.round((frequency / totalWords) * 100)
      }));
  }

  private categorizeIssues(topics: SupportTopic[]): Array<{ category: string; count: number; topics: SupportTopic[] }> {
    const categories = new Map<string, SupportTopic[]>();

    topics.forEach(topic => {
      const category = this.classifyTopic(topic);
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(topic);
    });

    return Array.from(categories.entries())
      .map(([category, topicList]) => ({
        category,
        count: topicList.length,
        topics: topicList.slice(0, 5)
      }))
      .sort((a, b) => b.count - a.count);
  }

  private classifyTopic(topic: SupportTopic): string {
    const text = `${topic.title} ${topic.description}`.toLowerCase();

    if (this.containsKeywords(text, ['error', 'not working', 'broken', 'issue', 'problem', 'bug', 'fail'])) {
      return 'Errors & Bugs';
    }
    if (this.containsKeywords(text, ['how to', 'how do', 'tutorial', 'guide', 'help', 'usage'])) {
      return 'Usage Questions';
    }
    if (this.containsKeywords(text, ['feature', 'request', 'add', 'suggestion', 'enhancement', 'improvement'])) {
      return 'Feature Requests';
    }
    if (this.containsKeywords(text, ['compatibility', 'conflict', 'theme', 'update', 'version'])) {
      return 'Compatibility Issues';
    }
    if (this.containsKeywords(text, ['styling', 'css', 'appearance', 'display', 'layout', 'design'])) {
      return 'Styling & Display';
    }
    if (this.containsKeywords(text, ['install', 'setup', 'configuration', 'settings'])) {
      return 'Installation & Setup';
    }

    return 'General';
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }
}
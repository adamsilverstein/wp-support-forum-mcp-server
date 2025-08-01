# WordPress Support Forum MCP Server

A Model Context Protocol (MCP) server that provides tools for querying WordPress plugin support forums and analyzing common issues reported by users.

## Features

- **Plugin Information**: Get detailed metadata about WordPress plugins including ratings, downloads, and compatibility
- **Support Topics**: Fetch recent support topics from plugin forums via RSS feeds
- **Issue Analysis**: Analyze support topics to identify common problems and categorize issues
- **Plugin Search**: Search for WordPress plugins by keyword

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm package manager

### Installation

```bash
git clone https://github.com/adamsilverstein/wp-support-forum-mcp-server.git
cd wp-support-forum-mcp-server
npm install
npm run build
```

### Claude Desktop Configuration

Add this configuration to your Claude Desktop settings (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "wp-support-forum": {
      "command": "node",
      "args": ["/absolute/path/to/wp-support-forum-mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

Replace `/absolute/path/to/` with the actual path to your cloned repository.

### Development Mode

```bash
npm run dev
```

## Available Tools

### 1. get_plugin_info

Get detailed information about a WordPress plugin.

**Parameters:**
- `plugin_slug` (string, required): The WordPress plugin slug (e.g., "mathml-block")

**Example Query:**
> "Get information about the mathml-block plugin"

**Sample Response:**
```json
{
  "name": "MathML Block",
  "version": "1.2.0",
  "author": "Author Name",
  "rating": 4.5,
  "total_ratings": 42,
  "downloads": 15000,
  "support_threads": 8,
  "wordpress_version": {
    "requires": "5.0",
    "tested": "6.4"
  },
  "php_version": "7.4",
  "homepage": "https://example.com",
  "description": "A plugin for adding MathML blocks...",
  "tags": ["math", "latex", "education"]
}
```

<!-- Repeat for other tools as in your original -->

## Example Use Cases

- **Plugin Research:** Search for plugins related to mathematics.
- **Issue Analysis:** Analyze top issues for a plugin.
- **Plugin Evaluation:** Review ratings, downloads, and common problems.
- **Support Monitoring:** Monitor new support requests and trending problems.

## Project Structure

```text
src/
  index.ts              # Main MCP server
  types/
    index.ts            # TypeScript type definitions
  services/
    wordpress-api.ts    # WordPress.org API client
    support-feed.ts     # RSS feed parser
    issue-analyzer.ts   # Issue analysis logic
  tools/
    plugin-info.ts      # Plugin information tool
    support-topics.ts   # Support topics tool
    top-issues.ts       # Issue analysis tool
    search-plugins.ts   # Plugin search tool
```

## Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run the compiled server
- `npm run dev`: Development mode with auto-rebuild and restart using concurrently
- `npm run clean`: Remove compiled files

## Adding New Tools

1. Create a new tool file in `src/tools/`
2. Define the tool schema and handler function
3. Export the tool and handler
4. Add to the main server in `src/index.ts`

## API Limitations

- RSS feeds may not include all historical support topics
- Analysis is based on topic titles and descriptions only
- Rate limiting may apply to WordPress.org API requests
- Some plugins may not have active support forums

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.
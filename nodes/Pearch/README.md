# Pearch Node for n8n

This node allows you to interact with the Pearch API for search operations.

## Features

- **Submit Search**: Submit a search task for background execution
- **Get Search Status**: Check the status and results of a submitted search task
- **Bearer Token Authentication**: Secure API access using your API key

## Setup

### 1. Create Pearch API Credentials

1. In n8n, go to **Settings** → **Credentials**
2. Click **Add Credential**
3. Search for "Pearch API" and select it
4. Fill in the following details:
   - **Base URL**: Your Pearch API instance URL (e.g., `https://api.pearch.ai`)
   - **API Key**: Your Pearch API key for authentication
5. Click **Save**

### 2. Add the Pearch Node to Your Workflow

1. In your workflow, click the **+** button to add a new node
2. Search for "Pearch" and select the Pearch node
3. Configure the node parameters as needed

## Operations

### Submit Search

Submits a search task for background execution.

**Required Parameters:**
- **Query**: The search query to execute

**Optional Parameters:**
- **Limit**: Maximum number of results to return (default: 10)
- **Search Type**: Type of search to perform
- **Insights**: Whether to include insights in the search
- **High Freshness**: Whether to prioritize high freshness results
- **Show Emails**: Whether to include email addresses in results
- **Show Phone Numbers**: Whether to include phone numbers in results
- **Profile Scoring**: Whether to include profile scoring in results

**Output:**
Returns a task ID that can be used to check the search status:
```json
{
  "task_id": "uuid-string",
  "status": "pending",
  "message": "Search task submitted successfully"
}
```

### Get Search Status

Retrieves the status and results of a submitted search task.

**Required Parameters:**
- **Task ID**: The task ID returned from the submit search operation

**Output:**
Returns the current status and results (if completed):
```json
{
  "task_id": "uuid-string",
  "status": "completed",
  "created_at": "2024-01-01T00:00:00",
  "query": "search query",
  "result": [...],
  "duration": 1.5
}
```

## Working Example

### Successful API Request
Here's an example of a working API request that our node replicates:

```bash
curl --request POST \
     --url https://api.pearch.ai/v2/search/submit \
     --header 'accept: application/json' \
     --header 'authorization: Bearer YOUR_API_KEY' \
     --header 'content-type: application/json' \
     --data '{
  "query": "python developer with 5+ years of experience with experience in Django and React, also AWS, worked in JPMorgan.",
  "type": "fast",
  "insights": false,
  "high_freshness": false,
  "profile_scoring": true,
  "show_emails": false,
  "show_phone_numbers": false,
  "limit": 50
}'
```

## Usage Examples

### Example 1: Submit a Search and Wait for Results

1. **Pearch Node (Submit Search)**
   - Operation: Submit Search
   - Query: "software developers in San Francisco"
   - Limit: 20
   - Insights: true

2. **Wait Node** (optional)
   - Wait for a few seconds to allow processing

3. **Pearch Node (Get Search Status)**
   - Operation: Get Search Status
   - Task ID: `={{ $json.task_id }}`

### Example 2: Polling for Search Results

1. **Pearch Node (Submit Search)**
   - Submit your search query

2. **Loop Node**
   - Loop through the following nodes

3. **Pearch Node (Get Search Status)**
   - Check the status using the task ID

4. **IF Node**
   - Check if status is "completed"
   - If not, wait and loop back

5. **Wait Node**
   - Wait before checking again

## Error Handling

The node includes comprehensive error handling:
- Invalid task IDs
- API authentication errors
- Network timeouts
- Invalid parameters

## API Endpoints

- **POST** `/v2/search/submit` - Submit a search task
- **GET** `/v2/search/status/{task_id}` - Get search task status

## Authentication

Uses Bearer token authentication with your API key. The API key is automatically included in the Authorization header for all requests.

## Rate Limiting

Be mindful of your API rate limits when implementing polling mechanisms. Consider adding appropriate delays between status checks.

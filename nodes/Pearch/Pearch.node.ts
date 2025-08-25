import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class Pearch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pearch',
		name: 'pearch',
		icon: 'file:pearch.svg',
		group: ['transform'],
		version: 1,
		subtitle: 'Search and wait for results',
		description: 'Search for candidates using Pearch API with automatic result waiting',
		defaults: {
			name: 'Pearch',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'pearchApi',
				required: true,
			},
		],
		properties: [
			// Submit Search Operation Fields
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				required: true,
				default: '',
				description: 'Search query (e.g., "python developer with Django experience")',
				routing: {
					send: {
						property: 'query',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
				routing: {
					send: {
						property: 'limit',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Search Type',
				name: 'type',
				type: 'options',
				options: [
					{
						name: 'Fast',
						value: 'fast',
						description: 'Fast search with basic results',
					},
					{
						name: 'Pro',
						value: 'pro',
						description: 'Professional search with comprehensive results',
					},
				],
				default: 'fast',
				description: 'Search type: Fast for quick results, Pro for comprehensive analysis',
				routing: {
					send: {
						property: 'type',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Insights',
				name: 'insights',
				type: 'boolean',
				default: false,
				description: 'Whether to include AI-powered insights about candidates',
				routing: {
					send: {
						property: 'insights',
						type: 'body',
					},
				},
			},
			{
				displayName: 'High Freshness',
				name: 'highFreshness',
				type: 'boolean',
				default: false,
				description: 'Whether to prioritize recently updated candidate profiles',
				routing: {
					send: {
						property: 'high_freshness',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Show Emails',
				name: 'showEmails',
				type: 'boolean',
				default: false,
				description: 'Whether to include candidate email addresses in search results',
				routing: {
					send: {
						property: 'show_emails',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Show Phone Numbers',
				name: 'showPhoneNumbers',
				type: 'boolean',
				default: false,
				description: 'Whether to include candidate phone numbers in search results',
				routing: {
					send: {
						property: 'show_phone_numbers',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Profile Scoring',
				name: 'profileScoring',
				type: 'boolean',
				default: false,
				description: 'Whether to include AI-powered profile matching scores',
				routing: {
					send: {
						property: 'profile_scoring',
						type: 'body',
					},
				},
			},
			// Wait Settings
			{
				displayName: 'Max Wait Time (Seconds)',
				name: 'maxWaitTime',
				type: 'number',
				typeOptions: {
					minValue: 10,
					maxValue: 3600,
				},
				default: 600,
				description: 'Maximum time to wait for search completion (10 seconds to 1 hour)',
			},
			{
				displayName: 'Polling Interval (Seconds)',
				name: 'pollingInterval',
				type: 'number',
				typeOptions: {
					minValue: 2,
					maxValue: 60,
				},
				default: 15,
				description: 'How often to check search status (2-60 seconds)',
			},

		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];



		let item: INodeExecutionData;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				item = items[itemIndex];

				// Submit search and wait for results
					const query = this.getNodeParameter('query', itemIndex, '') as string;
					if (!query || query.trim() === '') {
						throw new NodeOperationError(this.getNode(), 'Query parameter is required and cannot be empty', { itemIndex });
					}
					const limit = this.getNodeParameter('limit', itemIndex, 10) as number;
					const type = this.getNodeParameter('type', itemIndex, '') as string;
					const insights = this.getNodeParameter('insights', itemIndex, false) as boolean;
					const highFreshness = this.getNodeParameter('highFreshness', itemIndex, false) as boolean;
					const showEmails = this.getNodeParameter('showEmails', itemIndex, false) as boolean;
					const showPhoneNumbers = this.getNodeParameter('showPhoneNumbers', itemIndex, false) as boolean;
					const profileScoring = this.getNodeParameter('profileScoring', itemIndex, false) as boolean;
					const maxWaitTime = this.getNodeParameter('maxWaitTime', itemIndex, 300) as number;
					const pollingInterval = this.getNodeParameter('pollingInterval', itemIndex, 5) as number;

					const body: any = {
						query,
						limit,
					};

					// Add optional parameters only if they have meaningful values
					if (type && type.trim() !== '') body.type = type;
					if (insights !== undefined) body.insights = insights;
					if (highFreshness !== undefined) body.high_freshness = highFreshness;
					if (showEmails !== undefined) body.show_emails = showEmails;
					if (showPhoneNumbers !== undefined) body.show_phone_numbers = showPhoneNumbers;
					if (profileScoring !== undefined) body.profile_scoring = profileScoring;

					// Get credentials
					const credentials = await this.getCredentials('pearchApi');
					if (!credentials) {
						throw new NodeOperationError(this.getNode(), 'Pearch API credentials not found', { itemIndex });
					}

					if (!credentials.baseUrl) {
						throw new NodeOperationError(this.getNode(), 'Base URL not found in credentials', { itemIndex });
					}

					if (!credentials.apiKey) {
						throw new NodeOperationError(this.getNode(), 'API Key not found in credentials', { itemIndex });
					}

					// Submit search
					const submitUrl = `${credentials.baseUrl}/v2/search/submit`;
					const submitResponse = await this.helpers.httpRequest({
						method: 'POST',
						url: submitUrl,
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${credentials.apiKey}`,
						},
						body,
					});

					// Extract task ID from response
					const taskId = submitResponse.task_id || submitResponse.id;
					if (!taskId) {
						throw new NodeOperationError(this.getNode(), 'No task ID received from submit response', { itemIndex });
					}

					// Wait for results with proper polling delays
					let finalResponse;
					const startTime = Date.now();

					while (true) {
						// Check if we've exceeded max wait time
						if (Date.now() - startTime > maxWaitTime * 1000) {
							throw new NodeOperationError(this.getNode(), `Search did not complete within ${maxWaitTime} seconds`, { itemIndex });
						}

						// Check status
						const statusUrl = `${credentials.baseUrl}/v2/search/status/${taskId}`;
						const statusResponse = await this.helpers.httpRequest({
							method: 'GET',
							url: statusUrl,
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${credentials.apiKey}`,
							},
						});

						// Check if results are ready
						if (statusResponse.status === 'completed' || statusResponse.status === 'done') {
							finalResponse = statusResponse;
							break;
						} else if (statusResponse.status === 'failed' || statusResponse.status === 'error') {
							throw new NodeOperationError(this.getNode(), `Search failed with status: ${statusResponse.status}`, { itemIndex });
						}
						const delayStart = Date.now();
						while (Date.now() - delayStart < pollingInterval * 1000) {
							await new Promise(resolve => resolve(undefined));
						}
					}

					item.json = finalResponse;

				returnData.push(item);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: this.getInputData(itemIndex)[0].json,
						error,
						pairedItem: itemIndex,
					});
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, { itemIndex });
				}
			}
		}

		return [returnData];
	}
}

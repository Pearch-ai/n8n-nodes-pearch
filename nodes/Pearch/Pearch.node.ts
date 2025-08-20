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
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Pearch API for search operations',
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
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Search',
						value: 'search',
					},
				],
				default: 'search',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['search'],
					},
				},
				options: [
					{
						name: 'Submit Search',
						value: 'submit',
						description: 'Submit a search task for background execution',
						action: 'Submit a search task',
						routing: {
							request: {
								method: 'POST',
								url: '/v2/search/submit',
							},
						},
					},
					{
						name: 'Get Search Status',
						value: 'status',
						description: 'Get the status of a submitted search task',
						action: 'Get search status',
						routing: {
							request: {
								method: 'GET',
								url: '=/v2/search/status/{{$parameter.taskId}}',
							},
						},
					},
				],
				default: 'submit',
			},
			// Submit Search Operation Fields
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				required: true,
				default: '',
				description: 'The search query to execute',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['submit'],
					},
				},
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
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['submit'],
					},
				},
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
				description: 'Type of search to perform',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['submit'],
					},
				},
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
				description: 'Whether to include insights in the search',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['submit'],
					},
				},
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
				description: 'Whether to prioritize high freshness results',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['submit'],
					},
				},
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
				description: 'Whether to include email addresses in results',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['submit'],
					},
				},
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
				description: 'Whether to include phone numbers in results',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['submit'],
					},
				},
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
				description: 'Whether to include profile scoring in results',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['submit'],
					},
				},
				routing: {
					send: {
						property: 'profile_scoring',
						type: 'body',
					},
				},
			},
			// Get Search Status Operation Fields
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				required: true,
				default: '',
				description: 'The task ID returned from submit search operation',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['status'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		let item: INodeExecutionData;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				item = items[itemIndex];

				if (resource === 'search') {
					if (operation === 'submit') {
						// Submit search operation
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

						// Test credentials loading
						let credentials;
						try {
							credentials = await this.getCredentials('pearchApi');
						} catch (credError) {
							throw new NodeOperationError(this.getNode(), `Failed to load credentials: ${credError.message}`, { itemIndex });
						}

						if (!credentials) {
							throw new NodeOperationError(this.getNode(), 'Pearch API credentials not found', { itemIndex });
						}

						if (!credentials.baseUrl) {
							throw new NodeOperationError(this.getNode(), 'Base URL not found in credentials', { itemIndex });
						}

						if (!credentials.apiKey) {
							throw new NodeOperationError(this.getNode(), 'API Key not found in credentials', { itemIndex });
						}

						const fullUrl = `${credentials.baseUrl}/v2/search/submit`;

						const response = await this.helpers.httpRequest({
							method: 'POST',
							url: fullUrl,
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${credentials.apiKey}`,
							},
							body,
						});

						// Response received successfully

						item.json = response;
					} else if (operation === 'status') {
						// Get search status operation
						const taskId = this.getNodeParameter('taskId', itemIndex, '') as string;

						if (!taskId) {
							throw new NodeOperationError(this.getNode(), 'Task ID is required for status operation', { itemIndex });
						}

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

						const fullUrl = `${credentials.baseUrl}/v2/search/status/${taskId}`;

						const response = await this.helpers.httpRequest({
							method: 'GET',
							url: fullUrl,
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${credentials.apiKey}`,
							},
						});

						item.json = response;
					}
				}

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

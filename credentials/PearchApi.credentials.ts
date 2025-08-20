import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PearchApi implements ICredentialType {
	name = 'pearchApi';
	displayName = 'Pearch API';
	documentationUrl = 'https://docs.pearch.ai';
	genericAuthType = 'generic';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.pearch.ai',
			required: true,
			description: 'The base URL of your Pearch API instance',
			placeholder: 'https://api.pearch.ai',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Pearch API key for authentication',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/v2/search/submit',
			method: 'POST',
			body: {
				query: 'test',
				limit: 1
			},
		},
	};
}

const { Pearch } = require('./dist/nodes/Pearch/Pearch.node');
const { PearchApi } = require('./dist/credentials/PearchApi.credentials');

module.exports = {
	nodes: [
		Pearch,
	],
	credentials: [
		PearchApi,
	],
};

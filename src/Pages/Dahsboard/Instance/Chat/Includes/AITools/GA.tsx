import { AssistantCreateParams } from 'openai/resources/beta/assistants/assistants';

const GA = (): AssistantCreateParams.AssistantToolsFunction => {
  return {
    type: 'function',
    function: {
      name: 'query_google_analytics',
      description:
        'Return Google Analytics (GA) data base on metrics and dimensions with option of date range, Google Analytics (GA) emphasizes events and user engagement metrics, providing a more granular view of user interactions.',
      parameters: {
        type: 'object',
        properties: {
          metrics: {
            type: 'array',
            items: {
              type: 'string',
            },
            description:
              'Metrics are quantitative measurements. The metric Sessions is the total number of sessions. The metric Pages/Session is the average number of pages viewed per session, e.g. "activeUsers", "totalRevenue" to retrieve. Valid Metrics (API Name) can be found at https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema#metrics',
          },
          dimensions: {
            type: 'array',
            items: {
              type: 'string',
            },
            description:
              'Dimensions are attributes of data. For example, the dimension City indicates the city, for example, "Paris" or "New York", from which a session originates. The dimension Page indicates the URL of a page that is viewed. Valid Dimensions (API Name) can be found at https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema#dimensions.',
          },
          startDate: {
            type: 'string',
            description:
              'The start date for fetching analytics data (YYYY-MM-DD).',
          },
          endDate: {
            type: 'string',
            description:
              'The end date for fetching analytics data (YYYY-MM-DD).',
          },
        },
        required: ['metrics', 'dimensions'],
      },
    },
  };
};
export default GA;

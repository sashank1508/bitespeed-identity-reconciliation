import swaggerJsdoc from 'swagger-jsdoc';
import { IdentifyRequest, IdentifyResponse } from '../types';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.API_TITLE || 'Bitespeed Identity Reconciliation API',
      version: process.env.API_VERSION || '1.0.0',
      description: `A sophisticated identity reconciliation service for FluxKart.com that links customer contacts across multiple purchases.

FEATURES:

• Smart Contact Linking: Automatically links contacts based on common email or phone number

• Primary/Secondary Hierarchy: Maintains oldest contact as primary, newer ones as secondary

• Contact Merging: Intelligently merges separate primary contacts when they share information

• Comprehensive Tracking: Consolidates all emails and phone numbers for a customer

BUSINESS LOGIC:
1. New customer → Creates primary contact
2. Existing phone/email → Links as secondary contact  
3. Bridging two primaries → Merges contacts (older becomes primary)`,
      
      contact: {
        name: 'Bitespeed Assignment',
        url: 'https://github.com/sashank1508/bitespeed-identity-reconciliation'
      }
    },
    servers: [
      {
        url: 'https://bitespeed-identity-reconciliation-qp87zd3u7.vercel.app',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        IdentifyRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'lorraine@hillvalley.edu',
              description: 'Customer email address'
            },
            phoneNumber: {
              type: 'string',
              example: '123456',
              description: 'Customer phone number'
            }
          },
          description: 'At least one of email or phoneNumber must be provided'
        },
        IdentifyResponse: {
          type: 'object',
          properties: {
            contact: {
              type: 'object',
              properties: {
                primaryContatctId: {
                  type: 'integer',
                  example: 1,
                  description: 'ID of the primary contact'
                },
                emails: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'email'
                  },
                  example: ['lorraine@hillvalley.edu', 'mcfly@hillvalley.edu'],
                  description: 'All email addresses linked to this contact (primary email first)'
                },
                phoneNumbers: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  example: ['123456'],
                  description: 'All phone numbers linked to this contact (primary phone first)'
                },
                secondaryContactIds: {
                  type: 'array',
                  items: {
                    type: 'integer'
                  },
                  example: [2, 3],
                  description: 'Array of all secondary contact IDs linked to the primary contact'
                }
              },
              required: ['primaryContatctId', 'emails', 'phoneNumbers', 'secondaryContactIds']
            }
          },
          required: ['contact']
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            message: {
              type: 'string',
              example: 'Bitespeed Identity Service is running'
            }
          }
        },
        TestResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'API is working!'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            env: {
              type: 'string',
              example: 'production'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'At least one of email or phoneNumber must be provided'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
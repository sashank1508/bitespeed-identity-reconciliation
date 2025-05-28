import { Router } from 'express';
import { IdentityController } from '../controllers/IdentityController';

const router = Router();
const identityController = new IdentityController();

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Simple API test endpoint
 *     description: Returns a simple message to verify the API is working
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: API is working successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestResponse'
 */
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

/**
 * @swagger
 * /identify:
 *   post:
 *     summary: Identify and reconcile customer contacts
 *     description: |
 *       Core endpoint that identifies and links customer contacts based on email or phone number.
 *       
 *       **Behavior:**
 *       - If no existing contacts match → Creates new primary contact
 *       - If existing contact matches → Links as secondary or returns consolidated data
 *       - If request bridges two primary contacts → Merges them (older becomes primary)
 *       
 *       **Examples:**
 *       1. New customer creates primary contact
 *       2. Same phone, different email creates secondary contact
 *       3. Email from Contact A + phone from Contact B merges the two contact chains
 *     tags: [Identity]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IdentifyRequest'
 *           examples:
 *             newCustomer:
 *               summary: New customer
 *               description: Creates a new primary contact
 *               value:
 *                 email: "lorraine@hillvalley.edu"
 *                 phoneNumber: "123456"
 *             linkingContact:
 *               summary: Linking contact
 *               description: Links to existing contact with same phone
 *               value:
 *                 email: "mcfly@hillvalley.edu"
 *                 phoneNumber: "123456"
 *             mergingContacts:
 *               summary: Merging contacts
 *               description: Merges two separate primary contacts
 *               value:
 *                 email: "george@hillvalley.edu"
 *                 phoneNumber: "717171"
 *             emailOnly:
 *               summary: Email only
 *               description: Query by email only
 *               value:
 *                 email: "mcfly@hillvalley.edu"
 *             phoneOnly:
 *               summary: Phone only
 *               description: Query by phone number only
 *               value:
 *                 phoneNumber: "123456"
 *     responses:
 *       200:
 *         description: Successfully identified and consolidated contact information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IdentifyResponse'
 *             examples:
 *               primaryContact:
 *                 summary: New primary contact
 *                 value:
 *                   contact:
 *                     primaryContatctId: 1
 *                     emails: ["lorraine@hillvalley.edu"]
 *                     phoneNumbers: ["123456"]
 *                     secondaryContactIds: []
 *               linkedContacts:
 *                 summary: Linked contacts
 *                 value:
 *                   contact:
 *                     primaryContatctId: 1
 *                     emails: ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"]
 *                     phoneNumbers: ["123456"]
 *                     secondaryContactIds: [2]
 *               mergedContacts:
 *                 summary: Merged contacts
 *                 value:
 *                   contact:
 *                     primaryContatctId: 11
 *                     emails: ["george@hillvalley.edu", "biffsucks@hillvalley.edu"]
 *                     phoneNumbers: ["919191", "717171"]
 *                     secondaryContactIds: [27]
 *       400:
 *         description: Bad request - missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "At least one of email or phoneNumber must be provided"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */
router.post('/identify', (req, res) => identityController.identify(req, res));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current status of the API service
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: Service is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Bitespeed Identity Service is running' });
});

export default router;
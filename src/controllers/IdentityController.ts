import { Request, Response } from 'express';
import { IdentityService } from '../models/IdentityService';
import { IdentifyRequest } from '../types';

export class IdentityController {
  private identityService: IdentityService;

  constructor() {
    this.identityService = new IdentityService();
  }

  async identify(req: Request, res: Response): Promise<void> {
    try {
      const { email, phoneNumber }: IdentifyRequest = req.body;

      // Validation
      if (!email && !phoneNumber) {
        res.status(400).json({
          error: 'At least one of email or phoneNumber must be provided'
        });
        return;
      }

      // Convert phoneNumber to string if it's a number
      const processedRequest: IdentifyRequest = {
        email: email || undefined,
        phoneNumber: phoneNumber ? String(phoneNumber) : undefined
      };

      const result = await this.identityService.identify(processedRequest);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in identify endpoint:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}
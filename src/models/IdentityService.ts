import Database from '../database';
import { Contact, IdentifyRequest, IdentifyResponse } from '../types';

export class IdentityService {
  private db: Database;

  constructor() {
    this.db = new Database();
  }

  async identify(request: IdentifyRequest): Promise<IdentifyResponse> {
    const { email, phoneNumber } = request;

    // Find existing contacts with matching email or phone
    const existingContacts = await this.db.findContactsByEmailOrPhone(email, phoneNumber);

    if (existingContacts.length === 0) {
      // No existing contacts - create new primary contact
      const newContact = await this.db.insertContact({
        email,
        phoneNumber,
        linkPrecedence: 'primary'
      });

      return this.buildResponse([newContact]);
    }

    // Get all primary contacts from the matches
    const primaryContacts = this.getPrimaryContacts(existingContacts);

    if (primaryContacts.length === 1) {
      // Single primary contact found
      const primaryContact = primaryContacts[0];
      
      // Check if we need to create a new secondary contact
      const needsNewSecondary = this.needsNewSecondaryContact(
        existingContacts, 
        email, 
        phoneNumber
      );

      if (needsNewSecondary) {
        await this.db.insertContact({
          email,
          phoneNumber,
          linkedId: primaryContact.id,
          linkPrecedence: 'secondary'
        });
      }

      // Get all linked contacts for response
      const allLinkedContacts = await this.db.findAllLinkedContacts(primaryContact.id);
      return this.buildResponse(allLinkedContacts);

    } else if (primaryContacts.length > 1) {
      // Multiple primary contacts found - need to merge them
      return await this.mergePrimaryContacts(primaryContacts, email, phoneNumber);
    }

    // Fallback - shouldn't reach here
    const allLinkedContacts = await this.db.findAllLinkedContacts(existingContacts[0].linkedId || existingContacts[0].id);
    return this.buildResponse(allLinkedContacts);
  }

  private getPrimaryContacts(contacts: Contact[]): Contact[] {
    const primaryContacts: Contact[] = [];
    const primaryIds = new Set<number>();

    for (const contact of contacts) {
      if (contact.linkPrecedence === 'primary') {
        primaryContacts.push(contact);
        primaryIds.add(contact.id);
      } else if (contact.linkedId && !primaryIds.has(contact.linkedId)) {
        // This is a secondary contact, we need to find its primary
        primaryIds.add(contact.linkedId);
      }
    }

    // If we found secondary contacts but not their primaries in our initial search,
    // we need to fetch the primary contacts
    return primaryContacts;
  }

  private needsNewSecondaryContact(
    existingContacts: Contact[], 
    email?: string, 
    phoneNumber?: string
  ): boolean {
    // Check if the exact combination already exists
    for (const contact of existingContacts) {
      if (contact.email === (email || null) && contact.phoneNumber === (phoneNumber || null)) {
        return false; // Exact match found, no need for new contact
      }
    }

    // Check if we have new information
    const hasNewEmail = Boolean(email && !existingContacts.some(c => c.email === email));
    const hasNewPhone = Boolean(phoneNumber && !existingContacts.some(c => c.phoneNumber === phoneNumber));

    return hasNewEmail || hasNewPhone;
  }

  private async mergePrimaryContacts(
    primaryContacts: Contact[], 
    email?: string, 
    phoneNumber?: string
  ): Promise<IdentifyResponse> {
    // Sort by creation date to find the oldest (which remains primary)
    primaryContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    const oldestPrimary = primaryContacts[0];
    const contactsToMakeSecondary = primaryContacts.slice(1);

    // Update other primary contacts to secondary
    for (const contact of contactsToMakeSecondary) {
      await this.db.updateContactToSecondary(contact.id, oldestPrimary.id);
      
      // Update all contacts that were linked to this primary
      await this.db.updateLinkedContacts(contact.id, oldestPrimary.id);
    }

    // Check if we need to create a new secondary contact with the request data
    const allLinkedContacts = await this.db.findAllLinkedContacts(oldestPrimary.id);
    
    const needsNewSecondary = this.needsNewSecondaryContact(
      allLinkedContacts, 
      email, 
      phoneNumber
    );

    if (needsNewSecondary) {
      await this.db.insertContact({
        email,
        phoneNumber,
        linkedId: oldestPrimary.id,
        linkPrecedence: 'secondary'
      });
    }

    // Get final state of all linked contacts
    const finalLinkedContacts = await this.db.findAllLinkedContacts(oldestPrimary.id);
    return this.buildResponse(finalLinkedContacts);
  }

  private buildResponse(contacts: Contact[]): IdentifyResponse {
    // Sort contacts by creation date
    contacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const primaryContact = contacts.find(c => c.linkPrecedence === 'primary');
    const secondaryContacts = contacts.filter(c => c.linkPrecedence === 'secondary');

    if (!primaryContact) {
      throw new Error('No primary contact found');
    }

    // Collect unique emails and phone numbers
    const emails: string[] = [];
    const phoneNumbers: string[] = [];

    // Add primary contact's info first
    if (primaryContact.email) emails.push(primaryContact.email);
    if (primaryContact.phoneNumber) phoneNumbers.push(primaryContact.phoneNumber);

    // Add secondary contacts' info
    for (const contact of secondaryContacts) {
      if (contact.email && !emails.includes(contact.email)) {
        emails.push(contact.email);
      }
      if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
        phoneNumbers.push(contact.phoneNumber);
      }
    }

    return {
      contact: {
        primaryContatctId: primaryContact.id, // Note: keeping the typo as per specs
        emails,
        phoneNumbers,
        secondaryContactIds: secondaryContacts.map(c => c.id)
      }
    };
  }
}
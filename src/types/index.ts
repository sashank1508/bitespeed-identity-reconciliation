export interface Contact {
  id: number;
  phoneNumber: string | null;
  email: string | null;
  linkedId: number | null;
  linkPrecedence: 'primary' | 'secondary';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface IdentifyRequest {
  email?: string;
  phoneNumber?: string;
}

export interface IdentifyResponse {
  contact: {
    primaryContatctId: number; // Note: keeping the typo as per assignment specs
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

export interface ContactInsert {
  phoneNumber?: string;
  email?: string;
  linkedId?: number;
  linkPrecedence: 'primary' | 'secondary';
}
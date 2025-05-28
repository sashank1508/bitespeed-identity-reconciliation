import sqlite3 from 'sqlite3';
import { Contact, ContactInsert } from '../types';

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database('contacts.db');
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS Contact (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phoneNumber TEXT,
        email TEXT,
        linkedId INTEGER,
        linkPrecedence TEXT CHECK(linkPrecedence IN ('primary', 'secondary')) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        deletedAt DATETIME,
        FOREIGN KEY (linkedId) REFERENCES Contact(id)
      )
    `;

    this.db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating Contact table:', err);
      } else {
        console.log('Contact table created or already exists');
      }
    });
  }

  async findContactsByEmailOrPhone(email?: string, phoneNumber?: string): Promise<Contact[]> {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT * FROM Contact 
        WHERE deletedAt IS NULL AND (
      `;
      const params: any[] = [];

      if (email && phoneNumber) {
        query += 'email = ? OR phoneNumber = ?';
        params.push(email, phoneNumber);
      } else if (email) {
        query += 'email = ?';
        params.push(email);
      } else if (phoneNumber) {
        query += 'phoneNumber = ?';
        params.push(phoneNumber);
      } else {
        resolve([]);
        return;
      }

      query += ') ORDER BY createdAt ASC';

      this.db.all(query, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const contacts: Contact[] = rows.map(row => ({
            ...row,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            deletedAt: row.deletedAt ? new Date(row.deletedAt) : null
          }));
          resolve(contacts);
        }
      });
    });
  }

  async findAllLinkedContacts(primaryId: number): Promise<Contact[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM Contact 
        WHERE deletedAt IS NULL AND (id = ? OR linkedId = ?)
        ORDER BY createdAt ASC
      `;

      this.db.all(query, [primaryId, primaryId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const contacts: Contact[] = rows.map(row => ({
            ...row,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            deletedAt: row.deletedAt ? new Date(row.deletedAt) : null
          }));
          resolve(contacts);
        }
      });
    });
  }

  async insertContact(contact: ContactInsert): Promise<Contact> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO Contact (phoneNumber, email, linkedId, linkPrecedence)
        VALUES (?, ?, ?, ?)
      `;

      const db = this.db; // Store reference to avoid context issues
      
      db.run(
        query,
        [contact.phoneNumber || null, contact.email || null, contact.linkedId || null, contact.linkPrecedence],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Fetch the inserted contact
            const selectQuery = 'SELECT * FROM Contact WHERE id = ?';
            const insertId = this.lastID;
            
            db.get(selectQuery, [insertId], (err: any, row: any) => {
              if (err) {
                reject(err);
              } else {
                const insertedContact: Contact = {
                  ...row,
                  createdAt: new Date(row.createdAt),
                  updatedAt: new Date(row.updatedAt),
                  deletedAt: row.deletedAt ? new Date(row.deletedAt) : null
                };
                resolve(insertedContact);
              }
            });
          }
        }
      );
    });
  }

  async updateContactToSecondary(contactId: number, linkedId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE Contact 
        SET linkedId = ?, linkPrecedence = 'secondary', updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      this.db.run(query, [linkedId, contactId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async updateLinkedContacts(oldPrimaryId: number, newPrimaryId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE Contact 
        SET linkedId = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE linkedId = ?
      `;

      this.db.run(query, [newPrimaryId, oldPrimaryId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  close(): void {
    this.db.close();
  }
}

export default Database;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    const dbPath = path.join(__dirname, '..', '..', 'data', 'users.db');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.init();
      }
    });
  }

  init() {
    // Tabla de usuarios (mantener para autenticación)
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Nueva tabla de contactos empresariales
    const createContactsTable = `
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        position TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        website TEXT,
        notes TEXT,
        status TEXT DEFAULT 'lead',
        priority TEXT DEFAULT 'medium',
        source TEXT,
        tags TEXT,
        assigned_to INTEGER,
        last_contact DATE,
        next_followup DATE,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `;

    // Tabla de interacciones/actividades
    const createActivitiesTable = `
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER,
        user_id INTEGER,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        activity_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `;

    this.db.run(createUsersTable, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
      } else {
        console.log('Users table ready');
        this.createDefaultAdmin();
      }
    });

    this.db.run(createContactsTable, (err) => {
      if (err) {
        console.error('Error creating contacts table:', err);
      } else {
        console.log('Contacts table ready');
        this.createSampleContacts();
      }
    });

    this.db.run(createActivitiesTable, (err) => {
      if (err) {
        console.error('Error creating activities table:', err);
      } else {
        console.log('Activities table ready');
      }
    });
  }

  createDefaultAdmin() {
    const bcrypt = require('bcrypt');
    const email = 'admin@admin.com';
    const password = 'admin123';

    this.getUserByEmail(email, (err, user) => {
      if (err || !user) {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.error('Error hashing admin password:', err);
            return;
          }

          const insertAdmin = `
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
          `;

          this.db.run(insertAdmin, ['Administrador', email, hashedPassword, 'admin'], (err) => {
            if (err) {
              console.error('Error creating default admin:', err);
            } else {
              console.log('Default admin created: admin@admin.com / admin123');
            }
          });
        });
      }
    });
  }

  createUser(userData, callback) {
    const { name, email, password, role = 'user' } = userData;
    const sql = `
      INSERT INTO users (name, email, password, role, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    this.db.run(sql, [name, email, password, role], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID, name, email, role });
      }
    });
  }

  getUserByEmail(email, callback) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    this.db.get(sql, [email], callback);
  }

  getUserById(id, callback) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    this.db.get(sql, [id], callback);
  }

  getAllUsers() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC';
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  updateUser(userData) {
    return new Promise((resolve, reject) => {
      const { id, name, email, role } = userData;
      const sql = `
        UPDATE users 
        SET name = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      this.db.run(sql, [name, email, role, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, name, email, role });
        }
      });
    });
  }

  deleteUser(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM users WHERE id = ?';
      this.db.run(sql, [userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  createSampleContacts() {
    // Verificar si ya existen contactos
    const checkContacts = 'SELECT COUNT(*) as count FROM contacts';
    this.db.get(checkContacts, [], (err, result) => {
      if (err || result.count > 0) return;

      const sampleContacts = [
        {
          name: 'Ana García López',
          email: 'ana.garcia@techcorp.com',
          phone: '+34 91 123 4567',
          company: 'TechCorp Solutions',
          position: 'Directora de Marketing',
          city: 'Madrid',
          country: 'España',
          status: 'cliente',
          priority: 'high',
          source: 'referido',
          tags: 'vip,marketing,tecnología'
        },
        {
          name: 'Carlos Rodríguez',
          email: 'carlos@innovatech.es',
          phone: '+34 93 987 6543',
          company: 'InnovaTech Barcelona',
          position: 'CEO',
          city: 'Barcelona',
          country: 'España',
          status: 'prospect',
          priority: 'high',
          source: 'web',
          tags: 'ceo,innovación,startup'
        },
        {
          name: 'María Fernández',
          email: 'maria.fernandez@globalcorp.com',
          phone: '+34 95 456 7890',
          company: 'Global Corp',
          position: 'Gerente de Ventas',
          city: 'Sevilla',
          country: 'España',
          status: 'lead',
          priority: 'medium',
          source: 'linkedin',
          tags: 'ventas,global,b2b'
        },
        {
          name: 'José Martínez',
          email: 'jose@startupvalencia.com',
          phone: '+34 96 321 0987',
          company: 'Startup Valencia',
          position: 'CTO',
          city: 'Valencia',
          country: 'España',
          status: 'lead',
          priority: 'low',
          source: 'evento',
          tags: 'startup,tecnología,cto'
        },
        {
          name: 'Isabel Sánchez',
          email: 'isabel.sanchez@consultingpro.es',
          phone: '+34 98 654 3210',
          company: 'Consulting Pro',
          position: 'Consultora Senior',
          city: 'Bilbao',
          country: 'España',
          status: 'inactivo',
          priority: 'low',
          source: 'email',
          tags: 'consultoría,senior,b2b'
        }
      ];

      sampleContacts.forEach(contact => {
        const sql = `
          INSERT INTO contacts (name, email, phone, company, position, city, country, status, priority, source, tags, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `;
        
        this.db.run(sql, [
          contact.name, contact.email, contact.phone, contact.company, 
          contact.position, contact.city, contact.country, contact.status, 
          contact.priority, contact.source, contact.tags
        ]);
      });
      
      console.log('Sample contacts created');
    });
  }

  // Métodos para gestión de contactos
  getAllContacts() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT c.*, u.name as assigned_to_name 
        FROM contacts c 
        LEFT JOIN users u ON c.assigned_to = u.id 
        ORDER BY c.created_at DESC
      `;
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  createContact(contactData) {
    return new Promise((resolve, reject) => {
      const {
        name, email, phone, company, position, address, city, country,
        website, notes, status = 'lead', priority = 'medium', source,
        tags, assigned_to, created_by
      } = contactData;

      const sql = `
        INSERT INTO contacts (
          name, email, phone, company, position, address, city, country,
          website, notes, status, priority, source, tags, assigned_to, created_by, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;

      this.db.run(sql, [
        name, email, phone, company, position, address, city, country,
        website, notes, status, priority, source, tags, assigned_to, created_by
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...contactData });
        }
      });
    });
  }

  updateContact(contactData) {
    return new Promise((resolve, reject) => {
      const {
        id, name, email, phone, company, position, address, city, country,
        website, notes, status, priority, source, tags, assigned_to
      } = contactData;

      const sql = `
        UPDATE contacts 
        SET name = ?, email = ?, phone = ?, company = ?, position = ?, 
            address = ?, city = ?, country = ?, website = ?, notes = ?,
            status = ?, priority = ?, source = ?, tags = ?, assigned_to = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      this.db.run(sql, [
        name, email, phone, company, position, address, city, country,
        website, notes, status, priority, source, tags, assigned_to, id
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...contactData });
        }
      });
    });
  }

  deleteContact(contactId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM contacts WHERE id = ?';
      this.db.run(sql, [contactId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  getContactStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'lead' THEN 1 ELSE 0 END) as leads,
          SUM(CASE WHEN status = 'prospect' THEN 1 ELSE 0 END) as prospects,
          SUM(CASE WHEN status = 'cliente' THEN 1 ELSE 0 END) as clients,
          SUM(CASE WHEN status = 'inactivo' THEN 1 ELSE 0 END) as inactive,
          SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
          COUNT(DISTINCT company) as companies
        FROM contacts
      `;
      
      this.db.get(sql, [], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = Database;

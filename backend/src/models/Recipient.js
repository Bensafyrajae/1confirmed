const db = require('../config/database');

class Recipient {
  static async create(recipientData) {
    const { 
      userId, 
      email, 
      firstName, 
      lastName, 
      phone, 
      company, 
      position,
      tags = [],
      notes,
      metadata = {}
    } = recipientData;
    
    try {
      const result = await db.query(
        `INSERT INTO recipients (
          user_id, email, first_name, last_name, phone, company, position,
          tags, notes, metadata, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING *`,
        [
          userId, email, firstName || '', lastName || '', phone, company, position,
          tags, notes, metadata
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating recipient:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM recipients WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding recipient by ID:', error);
      throw error;
    }
  }

  static async findByUserId(userId, options = {}) {
    const { 
      limit = 50, 
      offset = 0, 
      active = true,
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = options;

    try {
      let query = 'SELECT * FROM recipients WHERE user_id = $1';
      let params = [userId];

      if (active !== null) {
        query += ' AND is_active = $2';
        params.push(active);
      }

      query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      // Compter le total
      let countQuery = 'SELECT COUNT(*) FROM recipients WHERE user_id = $1';
      let countParams = [userId];
      
      if (active !== null) {
        countQuery += ' AND is_active = $2';
        countParams.push(active);
      }

      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      return {
        recipients: result.rows,
        total,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error finding recipients by user ID:', error);
      throw error;
    }
  }

  static async findByEmail(userId, email) {
    try {
      const result = await db.query(
        'SELECT * FROM recipients WHERE user_id = $1 AND email = $2',
        [userId, email]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding recipient by email:', error);
      throw error;
    }
  }

  static async update(id, userId, recipientData) {
    const { 
      email, 
      firstName, 
      lastName, 
      phone, 
      company, 
      position,
      tags,
      notes,
      isActive,
      metadata
    } = recipientData;
    
    try {
      const result = await db.query(
        `UPDATE recipients 
         SET email = $3, first_name = $4, last_name = $5, phone = $6, 
             company = $7, position = $8, tags = $9, notes = $10, 
             is_active = $11, metadata = $12, updated_at = NOW()
         WHERE id = $1 AND user_id = $2 
         RETURNING *`,
        [
          id, userId, email, firstName, lastName, phone, company, position,
          tags, notes, isActive, metadata
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating recipient:', error);
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      const result = await db.query(
        'DELETE FROM recipients WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting recipient:', error);
      throw error;
    }
  }

  static async bulkCreate(userId, recipientsData) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      const createdRecipients = [];
      
      for (const recipientData of recipientsData) {
        // Vérifier si l'email existe déjà
        const existing = await this.findByEmail(userId, recipientData.email);
        
        if (!existing) {
          const recipient = await this.create({
            ...recipientData,
            userId
          });
          createdRecipients.push(recipient);
        }
      }
      
      await client.query('COMMIT');
      return createdRecipients;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error bulk creating recipients:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async search(userId, searchTerm, options = {}) {
    const { limit = 20, offset = 0 } = options;

    try {
      const result = await db.query(
        `SELECT * FROM recipients 
         WHERE user_id = $1 AND is_active = true AND (
           email ILIKE $2 OR 
           first_name ILIKE $2 OR 
           last_name ILIKE $2 OR
           company ILIKE $2 OR
           position ILIKE $2 OR
           $3 = ANY(tags)
         )
         ORDER BY first_name, last_name 
         LIMIT $4 OFFSET $5`,
        [userId, `%${searchTerm}%`, searchTerm, limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Error searching recipients:', error);
      throw error;
    }
  }

  static async getByTags(userId, tags, options = {}) {
    const { limit = 50, offset = 0 } = options;

    try {
      const result = await db.query(
        `SELECT * FROM recipients 
         WHERE user_id = $1 AND is_active = true AND tags && $2
         ORDER BY first_name, last_name 
         LIMIT $3 OFFSET $4`,
        [userId, tags, limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting recipients by tags:', error);
      throw error;
    }
  }

  static async getAllTags(userId) {
    try {
      const result = await db.query(
        `SELECT DISTINCT unnest(tags) as tag 
         FROM recipients 
         WHERE user_id = $1 AND is_active = true
         ORDER BY tag`,
        [userId]
      );

      return result.rows.map(row => row.tag);
    } catch (error) {
      console.error('Error getting all tags:', error);
      throw error;
    }
  }

  static async optOut(id, userId) {
    try {
      const result = await db.query(
        `UPDATE recipients 
         SET opt_out = true, opt_out_date = NOW(), updated_at = NOW()
         WHERE id = $1 AND user_id = $2 
         RETURNING *`,
        [id, userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error opting out recipient:', error);
      throw error;
    }
  }

  static async optIn(id, userId) {
    try {
      const result = await db.query(
        `UPDATE recipients 
         SET opt_out = false, opt_out_date = NULL, updated_at = NOW()
         WHERE id = $1 AND user_id = $2 
         RETURNING *`,
        [id, userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error opting in recipient:', error);
      throw error;
    }
  }

  static async getStats(userId) {
    try {
      const result = await db.query(
        `SELECT 
           COUNT(*) as total,
           COUNT(CASE WHEN is_active = true THEN 1 END) as active,
           COUNT(CASE WHEN opt_out = true THEN 1 END) as opted_out,
           COUNT(CASE WHEN company IS NOT NULL AND company != '' THEN 1 END) as with_company
         FROM recipients 
         WHERE user_id = $1`,
        [userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error getting recipient stats:', error);
      throw error;
    }
  }

  static async getRecentlyAdded(userId, limit = 10) {
    try {
      const result = await db.query(
        `SELECT * FROM recipients 
         WHERE user_id = $1 AND is_active = true
         ORDER BY created_at DESC 
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting recently added recipients:', error);
      throw error;
    }
  }

  static async exists(userId, email) {
    try {
      const result = await db.query(
        'SELECT EXISTS(SELECT 1 FROM recipients WHERE user_id = $1 AND email = $2)',
        [userId, email]
      );
      return result.rows[0].exists;
    } catch (error) {
      console.error('Error checking recipient existence:', error);
      throw error;
    }
  }
}

module.exports = Recipient;
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password, firstName, lastName, companyName } = userData;
    
    try {
      const hashedPassword = await bcrypt.hash(password, 12);

      const result = await db.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, company_name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id, email, first_name, last_name, company_name, created_at`,
        [email, hashedPassword, firstName || '', lastName || '', companyName || '']
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT id, email, first_name, last_name, company_name, is_active, email_verified, email_verified_at, last_login_at, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async findByIdWithPassword(id) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by ID with password:', error);
      throw error;
    }
  }

  static async update(id, userData) {
    const { firstName, lastName, companyName } = userData;
    
    try {
      const result = await db.query(
        `UPDATE users 
         SET first_name = $2, last_name = $3, company_name = $4, updated_at = NOW()
         WHERE id = $1 
         RETURNING id, email, first_name, last_name, company_name, updated_at`,
        [id, firstName, lastName, companyName]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      const result = await db.query(
        'UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1 RETURNING id',
        [id, hashedPassword]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  static async updateLastLogin(id) {
    try {
      await db.query(
        'UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1',
        [id]
      );
      return true;
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  static async verifyEmail(id) {
    try {
      const result = await db.query(
        `UPDATE users 
         SET email_verified = true, email_verified_at = NOW(), updated_at = NOW() 
         WHERE id = $1 
         RETURNING id, email_verified, email_verified_at`,
        [id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  static async deactivate(id) {
    try {
      const result = await db.query(
        'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  static async activate(id) {
    try {
      const result = await db.query(
        'UPDATE users SET is_active = true, updated_at = NOW() WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  static async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await db.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async getAll(limit = 50, offset = 0) {
    try {
      const result = await db.query(
        `SELECT id, email, first_name, last_name, company_name, is_active, email_verified, last_login_at, created_at 
         FROM users 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const countResult = await db.query('SELECT COUNT(*) FROM users');
      const total = parseInt(countResult.rows[0].count);

      return {
        users: result.rows,
        total,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  static async search(searchTerm, limit = 20) {
    try {
      const result = await db.query(
        `SELECT id, email, first_name, last_name, company_name, is_active, created_at 
         FROM users 
         WHERE email ILIKE $1 
            OR first_name ILIKE $1 
            OR last_name ILIKE $1 
            OR company_name ILIKE $1
         ORDER BY created_at DESC 
         LIMIT $2`,
        [`%${searchTerm}%`, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  static async exists(email) {
    try {
      const result = await db.query(
        'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
        [email]
      );
      return result.rows[0].exists;
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  }

  static async isActive(id) {
    try {
      const result = await db.query(
        'SELECT is_active FROM users WHERE id = $1',
        [id]
      );
      return result.rows.length > 0 && result.rows[0].is_active;
    } catch (error) {
      console.error('Error checking user active status:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const result = await db.query(
        `SELECT 
           COUNT(*) as total_users,
           COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
           COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
           COUNT(CASE WHEN last_login_at IS NOT NULL THEN 1 END) as users_with_login,
           COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_signups
         FROM users`
      );

      const stats = result.rows[0];
      return {
        total_users: parseInt(stats.total_users),
        active_users: parseInt(stats.active_users),
        verified_users: parseInt(stats.verified_users),
        users_with_login: parseInt(stats.users_with_login),
        recent_signups: parseInt(stats.recent_signups)
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  static async getRecentSignups(limit = 10) {
    try {
      const result = await db.query(
        `SELECT id, email, first_name, last_name, company_name, created_at 
         FROM users 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting recent signups:', error);
      throw error;
    }
  }

  static async updateEmail(id, newEmail) {
    try {
      const result = await db.query(
        `UPDATE users 
         SET email = $2, email_verified = false, email_verified_at = NULL, updated_at = NOW()
         WHERE id = $1 
         RETURNING id, email`,
        [id, newEmail]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  }

  static async getByCompany(companyName, limit = 50) {
    try {
      const result = await db.query(
        `SELECT id, email, first_name, last_name, company_name, is_active, created_at 
         FROM users 
         WHERE company_name ILIKE $1 AND is_active = true
         ORDER BY first_name, last_name 
         LIMIT $2`,
        [`%${companyName}%`, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting users by company:', error);
      throw error;
    }
  }
}

module.exports = User;
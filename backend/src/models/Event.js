const db = require('../config/database');

class Event {
  static async create(eventData) {
    const { 
      userId, 
      title, 
      description, 
      eventDate, 
      location, 
      status = 'draft',
      maxParticipants,
      isPublic = false,
      registrationDeadline,
      tags = [],
      metadata = {}
    } = eventData;
    
    try {
      const result = await db.query(
        `INSERT INTO events (
          user_id, title, description, event_date, location, status,
          max_participants, is_public, registration_deadline, tags, metadata,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *`,
        [
          userId, title, description, eventDate, location, status,
          maxParticipants, isPublic, registrationDeadline, tags, metadata
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM events WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding event by ID:', error);
      throw error;
    }
  }

  static async findByUserId(userId, options = {}) {
    const { 
      limit = 20, 
      offset = 0, 
      status = null, 
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = options;

    try {
      let query = 'SELECT * FROM events WHERE user_id = $1';
      let params = [userId];

      if (status) {
        query += ' AND status = $2';
        params.push(status);
      }

      query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      // Compter le total
      let countQuery = 'SELECT COUNT(*) FROM events WHERE user_id = $1';
      let countParams = [userId];
      
      if (status) {
        countQuery += ' AND status = $2';
        countParams.push(status);
      }

      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      return {
        events: result.rows,
        total,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error finding events by user ID:', error);
      throw error;
    }
  }

  static async update(id, userId, eventData) {
    const { 
      title, 
      description, 
      eventDate, 
      location, 
      status,
      maxParticipants,
      isPublic,
      registrationDeadline,
      tags,
      metadata
    } = eventData;
    
    try {
      const result = await db.query(
        `UPDATE events 
         SET title = $3, description = $4, event_date = $5, location = $6, 
             status = $7, max_participants = $8, is_public = $9, 
             registration_deadline = $10, tags = $11, metadata = $12, updated_at = NOW()
         WHERE id = $1 AND user_id = $2 
         RETURNING *`,
        [
          id, userId, title, description, eventDate, location, status,
          maxParticipants, isPublic, registrationDeadline, tags, metadata
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      const result = await db.query(
        'DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  static async addParticipant(eventId, recipientId, status = 'invited') {
    try {
      const result = await db.query(
        `INSERT INTO event_participants (event_id, recipient_id, status, invited_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (event_id, recipient_id) 
         DO UPDATE SET status = $3, invited_at = NOW()
         RETURNING *`,
        [eventId, recipientId, status]
      );

      // Mettre à jour le compteur de participants
      await this.updateParticipantCount(eventId);

      return result.rows[0];
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  static async removeParticipant(eventId, recipientId) {
    try {
      const result = await db.query(
        'DELETE FROM event_participants WHERE event_id = $1 AND recipient_id = $2 RETURNING *',
        [eventId, recipientId]
      );

      // Mettre à jour le compteur de participants
      await this.updateParticipantCount(eventId);

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }

  static async getParticipants(eventId) {
    try {
      const result = await db.query(
        `SELECT ep.*, r.email, r.first_name, r.last_name, r.company
         FROM event_participants ep
         JOIN recipients r ON ep.recipient_id = r.id
         WHERE ep.event_id = $1
         ORDER BY ep.invited_at DESC`,
        [eventId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting participants:', error);
      throw error;
    }
  }

  static async updateParticipantCount(eventId) {
    try {
      await db.query(
        `UPDATE events 
         SET current_participants = (
           SELECT COUNT(*) FROM event_participants 
           WHERE event_id = $1 AND status IN ('confirmed', 'attended')
         )
         WHERE id = $1`,
        [eventId]
      );
    } catch (error) {
      console.error('Error updating participant count:', error);
      throw error;
    }
  }

  static async search(userId, searchTerm, options = {}) {
    const { limit = 20, offset = 0 } = options;

    try {
      const result = await db.query(
        `SELECT * FROM events 
         WHERE user_id = $1 AND (
           title ILIKE $2 OR 
           description ILIKE $2 OR 
           location ILIKE $2 OR
           $3 = ANY(tags)
         )
         ORDER BY created_at DESC 
         LIMIT $4 OFFSET $5`,
        [userId, `%${searchTerm}%`, searchTerm, limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  }

  static async getUpcoming(userId, limit = 10) {
    try {
      const result = await db.query(
        `SELECT * FROM events 
         WHERE user_id = $1 AND event_date > NOW() AND status = 'active'
         ORDER BY event_date ASC 
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw error;
    }
  }

  static async getStats(userId) {
    try {
      const result = await db.query(
        `SELECT 
           COUNT(*) as total,
           COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
           COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
           COUNT(CASE WHEN event_date > NOW() THEN 1 END) as upcoming,
           SUM(current_participants) as total_participants
         FROM events 
         WHERE user_id = $1`,
        [userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error getting event stats:', error);
      throw error;
    }
  }
}

module.exports = Event;
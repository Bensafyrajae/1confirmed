const db = require('../config/database');

class Message {
  static async create(messageData) {
    const { 
      userId, 
      eventId, 
      subject, 
      content, 
      messageType = 'email',
      scheduledAt,
      metadata = {}
    } = messageData;
    
    try {
      const result = await db.query(
        `INSERT INTO messages (
          user_id, event_id, subject, content, message_type, 
          scheduled_at, metadata, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *`,
        [userId, eventId, subject, content, messageType, scheduledAt, metadata]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM messages WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding message by ID:', error);
      throw error;
    }
  }

  static async findByUserId(userId, options = {}) {
    const { 
      limit = 20, 
      offset = 0, 
      status = null, 
      eventId = null,
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = options;

    try {
      let query = 'SELECT m.*, e.title as event_title FROM messages m LEFT JOIN events e ON m.event_id = e.id WHERE m.user_id = $1';
      let params = [userId];

      if (status) {
        query += ' AND m.status = $2';
        params.push(status);
      }

      if (eventId) {
        query += ` AND m.event_id = $${params.length + 1}`;
        params.push(eventId);
      }

      query += ` ORDER BY m.${sortBy} ${sortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      // Compter le total
      let countQuery = 'SELECT COUNT(*) FROM messages WHERE user_id = $1';
      let countParams = [userId];
      
      if (status) {
        countQuery += ' AND status = $2';
        countParams.push(status);
      }
      
      if (eventId) {
        countQuery += ` AND event_id = $${countParams.length + 1}`;
        countParams.push(eventId);
      }

      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      return {
        messages: result.rows,
        total,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error finding messages by user ID:', error);
      throw error;
    }
  }

  static async update(id, userId, messageData) {
    const { 
      subject, 
      content, 
      messageType,
      status,
      scheduledAt,
      metadata
    } = messageData;
    
    try {
      const result = await db.query(
        `UPDATE messages 
         SET subject = $3, content = $4, message_type = $5, status = $6,
             scheduled_at = $7, metadata = $8, updated_at = NOW()
         WHERE id = $1 AND user_id = $2 
         RETURNING *`,
        [id, userId, subject, content, messageType, status, scheduledAt, metadata]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      const result = await db.query(
        'DELETE FROM messages WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  static async send(messageId, recipientIds) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Mettre à jour le statut du message
      await client.query(
        'UPDATE messages SET status = $2, updated_at = NOW() WHERE id = $1',
        [messageId, 'sending']
      );

      // Créer les envois individuels
      const sendPromises = recipientIds.map(async (recipientId) => {
        // Récupérer les informations du destinataire
        const recipientResult = await client.query(
          'SELECT email FROM recipients WHERE id = $1',
          [recipientId]
        );

        if (recipientResult.rows.length > 0) {
          const recipientEmail = recipientResult.rows[0].email;
          
          return client.query(
            `INSERT INTO message_sends (message_id, recipient_id, recipient_email, status, created_at, updated_at)
             VALUES ($1, $2, $3, 'pending', NOW(), NOW())`,
            [messageId, recipientId, recipientEmail]
          );
        }
      });

      await Promise.all(sendPromises.filter(Boolean));

      // Mettre à jour les compteurs
      await client.query(
        `UPDATE messages SET 
         total_recipients = $2,
         status = 'sent',
         sent_at = NOW(),
         updated_at = NOW()
         WHERE id = $1`,
        [messageId, recipientIds.length]
      );

      await client.query('COMMIT');
      
      // Ici vous pourriez ajouter la logique d'envoi d'email réel
      // await this.processEmailSending(messageId);
      
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error sending message:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getSends(messageId) {
    try {
      const result = await db.query(
        `SELECT ms.*, r.first_name, r.last_name, r.company
         FROM message_sends ms
         JOIN recipients r ON ms.recipient_id = r.id
         WHERE ms.message_id = $1
         ORDER BY ms.sent_at DESC`,
        [messageId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting message sends:', error);
      throw error;
    }
  }

  static async updateSendStatus(sendId, status, errorMessage = null) {
    try {
      const updates = ['status = $2', 'updated_at = NOW()'];
      const params = [sendId, status];

      if (status === 'sent') {
        updates.push('sent_at = NOW()');
      } else if (status === 'delivered') {
        updates.push('delivered_at = NOW()');
      } else if (status === 'opened') {
        updates.push('opened_at = NOW()');
      } else if (status === 'clicked') {
        updates.push('clicked_at = NOW()');
      }

      if (errorMessage) {
        updates.push(`error_message = $${params.length + 1}`);
        params.push(errorMessage);
      }

      const query = `UPDATE message_sends SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
      
      const result = await db.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating send status:', error);
      throw error;
    }
  }

  static async getStats(userId) {
    try {
      const result = await db.query(
        `SELECT 
           COUNT(*) as total_messages,
           COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_messages,
           COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_messages,
           COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_messages,
           SUM(total_recipients) as total_recipients,
           SUM(successful_sends) as successful_sends,
           SUM(failed_sends) as failed_sends
         FROM messages 
         WHERE user_id = $1`,
        [userId]
      );

      const stats = result.rows[0];
      return {
        ...stats,
        total_messages: parseInt(stats.total_messages),
        sent_messages: parseInt(stats.sent_messages),
        draft_messages: parseInt(stats.draft_messages),
        scheduled_messages: parseInt(stats.scheduled_messages),
        total_recipients: parseInt(stats.total_recipients) || 0,
        successful_sends: parseInt(stats.successful_sends) || 0,
        failed_sends: parseInt(stats.failed_sends) || 0
      };
    } catch (error) {
      console.error('Error getting message stats:', error);
      throw error;
    }
  }

  static async getByEvent(eventId, userId) {
    try {
      const result = await db.query(
        `SELECT * FROM messages 
         WHERE event_id = $1 AND user_id = $2
         ORDER BY created_at DESC`,
        [eventId, userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting messages by event:', error);
      throw error;
    }
  }

  static async search(userId, searchTerm, options = {}) {
    const { limit = 20, offset = 0 } = options;

    try {
      const result = await db.query(
        `SELECT m.*, e.title as event_title 
         FROM messages m 
         LEFT JOIN events e ON m.event_id = e.id
         WHERE m.user_id = $1 AND (
           m.subject ILIKE $2 OR 
           m.content ILIKE $2 OR
           e.title ILIKE $2
         )
         ORDER BY m.created_at DESC 
         LIMIT $3 OFFSET $4`,
        [userId, `%${searchTerm}%`, limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }

  static async schedule(messageId, scheduledAt) {
    try {
      const result = await db.query(
        `UPDATE messages 
         SET status = 'scheduled', scheduled_at = $2, updated_at = NOW()
         WHERE id = $1 
         RETURNING *`,
        [messageId, scheduledAt]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error scheduling message:', error);
      throw error;
    }
  }

  static async getScheduled() {
    try {
      const result = await db.query(
        `SELECT * FROM messages 
         WHERE status = 'scheduled' AND scheduled_at <= NOW()
         ORDER BY scheduled_at ASC`
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting scheduled messages:', error);
      throw error;
    }
  }
}

module.exports = Message;
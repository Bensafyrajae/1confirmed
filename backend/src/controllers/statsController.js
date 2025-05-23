const { query } = require('../config/database');

const getStats = async (req, res) => {
  try {
    // Récupérer le nombre total de messages
    const totalMessagesResult = await query(
      'SELECT COUNT(*) FROM messages WHERE user_id = $1',
      [req.user.id]
    );

    // Récupérer le nombre de messages réussis
    const successfulMessagesResult = await query(
      'SELECT COUNT(*) FROM messages WHERE user_id = $1 AND status = $2',
      [req.user.id, 'sent']
    );

    // Récupérer le nombre de messages échoués
    const failedMessagesResult = await query(
      'SELECT COUNT(*) FROM messages WHERE user_id = $1 AND status = $2',
      [req.user.id, 'failed']
    );

    // Récupérer le nombre de templates
    const templatesResult = await query(
      'SELECT COUNT(*) FROM templates WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      totalMessages: parseInt(totalMessagesResult.rows[0].count),
      successfulMessages: parseInt(successfulMessagesResult.rows[0].count),
      failedMessages: parseInt(failedMessagesResult.rows[0].count),
      templatesCount: parseInt(templatesResult.rows[0].count)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

module.exports = {
  getStats
}; 
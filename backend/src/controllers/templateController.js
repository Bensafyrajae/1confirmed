const { query } = require('../config/database');

const getTemplates = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM templates WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des templates' });
  }
};

const createTemplate = async (req, res) => {
  const { name, content } = req.body;
  
  try {
    const result = await query(
      'INSERT INTO templates (name, content, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, content, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du template' });
  }
};

const updateTemplate = async (req, res) => {
  const { id } = req.params;
  const { name, content } = req.body;

  try {
    const result = await query(
      'UPDATE templates SET name = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [name, content, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du template' });
  }
};

const deleteTemplate = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM templates WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template non trouvé' });
    }

    res.json({ message: 'Template supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du template' });
  }
};

module.exports = {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate
}; 
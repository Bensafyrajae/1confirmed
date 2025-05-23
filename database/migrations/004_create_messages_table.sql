-- Migration: Création des tables pour les messages
-- Date: 2024-01-04
-- Description: Tables pour les messages et leur envoi

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'email' CHECK (message_type IN ('email', 'sms', 'push')),
    template_id UUID, -- Référence vers un template (à implémenter plus tard)
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    total_recipients INTEGER DEFAULT 0,
    successful_sends INTEGER DEFAULT 0,
    failed_sends INTEGER DEFAULT 0,
    metadata JSONB, -- Données supplémentaires (tracking, analytics, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les envois individuels de messages
CREATE TABLE IF NOT EXISTS message_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    error_message TEXT,
    tracking_data JSONB, -- Données de tracking (opens, clicks, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, recipient_id)
);

-- Table pour les templates de messages (optionnel pour plus tard)
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject_template VARCHAR(500),
    content_template TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'email',
    variables JSONB, -- Variables disponibles dans le template
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les messages
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_event_id ON messages(event_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_scheduled_at ON messages(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Index pour message_sends
CREATE INDEX IF NOT EXISTS idx_message_sends_message_id ON message_sends(message_id);
CREATE INDEX IF NOT EXISTS idx_message_sends_recipient_id ON message_sends(recipient_id);
CREATE INDEX IF NOT EXISTS idx_message_sends_status ON message_sends(status);
CREATE INDEX IF NOT EXISTS idx_message_sends_sent_at ON message_sends(sent_at);
CREATE INDEX IF NOT EXISTS idx_message_sends_recipient_email ON message_sends(recipient_email);

-- Index pour message_templates
CREATE INDEX IF NOT EXISTS idx_message_templates_user_id ON message_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_active ON message_templates(is_active);

-- Triggers pour updated_at
CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_sends_updated_at 
    BEFORE UPDATE ON message_sends 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at 
    BEFORE UPDATE ON message_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
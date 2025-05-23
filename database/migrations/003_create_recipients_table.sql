-- Migration: Création de la table recipients
-- Date: 2024-01-03
-- Description: Table pour les destinataires/participants

CREATE TABLE IF NOT EXISTS recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    company VARCHAR(255),
    position VARCHAR(255),
    tags TEXT[], -- Tags pour catégoriser les destinataires
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    opt_out BOOLEAN DEFAULT false, -- Pour le désabonnement
    opt_out_date TIMESTAMP,
    metadata JSONB, -- Données supplémentaires
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison pour les événements et participants
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'invited' CHECK (status IN ('invited', 'confirmed', 'declined', 'attended', 'no_show')),
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    attended_at TIMESTAMP,
    notes TEXT,
    UNIQUE(event_id, recipient_id)
);

-- Index pour les recipients
CREATE INDEX IF NOT EXISTS idx_recipients_user_id ON recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_recipients_email ON recipients(email);
CREATE INDEX IF NOT EXISTS idx_recipients_active ON recipients(is_active);
CREATE INDEX IF NOT EXISTS idx_recipients_tags ON recipients USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_recipients_opt_out ON recipients(opt_out);

-- Index pour event_participants
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_recipient_id ON event_participants(recipient_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON event_participants(status);

-- Triggers pour updated_at
CREATE TRIGGER update_recipients_updated_at 
    BEFORE UPDATE ON recipients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
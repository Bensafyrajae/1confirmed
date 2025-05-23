
const WhatsAppService = require('../services/whatsappService');
const logger = require('../utils/logger');

class WebhookController {
    async handleWhatsAppWebhook(req, res) {
        try {
            // Verify webhook signature
            const signature = req.headers['x-whatsapp-signature'];
            if (!WhatsAppService.verifyWebhook(signature, req.body)) {
                logger.warn('Invalid webhook signature:', {
                    signature,
                    body: req.body
                });
                return res.status(401).json({ error: 'Invalid signature' });
            }

            // Process the webhook
            await WhatsAppService.handleWebhookEvent(req.body);
            
            // Respond with success
            res.status(200).json({ status: 'processed' });
        } catch (error) {
            logger.error('Webhook processing error:', error);
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    }
}

module.exports = new WebhookController();
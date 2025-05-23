const axios = require('axios');

const sendWhatsAppMessage = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    const response = await axios.post(process.env.WHATSAPP_API_URL, {
      phone: phoneNumber,
      message: message
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi du message WhatsApp'
    });
  }
};

module.exports = {
  sendWhatsAppMessage
}; 
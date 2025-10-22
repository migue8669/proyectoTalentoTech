const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Configuración de transporte Gmail (contraseña de aplicación)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tu_correo@gmail.com',
    pass: 'tu_contraseña_app', // contraseña de aplicación
  },
});

// Endpoint para enviar código de recuperación
app.post('/enviar-codigo', (req, res) => {
  const { email, codigo } = req.body;

  const mailOptions = {
    from: '"Recuperación App" <tu_correo@gmail.com>',
    to: email,
    subject: 'Código de recuperación',
    text: `Tu código de recuperación es: ${codigo}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error enviando correo:', error);
      return res.status(500).json({ success: false, message: 'Error enviando correo' });
    }
    console.log('Correo enviado:', info.response);
    res.json({ success: true, message: 'Correo enviado' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

import nodemailer from 'nodemailer';

(async () => {
  try {
    console.log('Creando cuenta de prueba Ethereal...');
    const testAccount = await nodemailer.createTestAccount();

    console.log('Credenciales Ethereal generadas:');
    console.log(`  user: ${testAccount.user}`);
    console.log(`  pass: ${testAccount.pass}`);

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `Ethereal Test <${testAccount.user}>`,
      to: testAccount.user,
      subject: 'Prueba Ethereal - Cursala',
      html: `<p>Prueba de envío desde el repo <b>backend-public</b>. Hora: ${new Date().toISOString()}</p>`,
    });

    console.log('Mensaje enviado. Info:');
    console.log(info);

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      console.log('Preview URL:', preview);
    } else {
      console.log('No se generó URL de previsualización.');
    }
  } catch (err) {
    console.error('Error enviando con Ethereal:', err);
    process.exitCode = 1;
  }
})();

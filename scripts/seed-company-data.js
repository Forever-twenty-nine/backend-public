const mongoose = require('mongoose');
require('dotenv').config();

const CompanySpecificData = require('../dist/src/models/mongo/companySpecificData.model').default;

async function seedCompanyData() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Conectado a la base de datos');

    const existingData = await CompanySpecificData.findOne({});
    if (existingData) {
      console.log('Los datos de la compañía ya existen');
      return;
    }

    const companyData = new CompanySpecificData({
      privacyPolicy: 'Política de Privacidad: Esta es la política de privacidad de Cursala. Recopilamos información personal solo para proporcionar nuestros servicios de capacitación. No compartimos tu información con terceros sin tu consentimiento.',
      termsOfService: 'Términos de Servicio: Al usar Cursala, aceptas estos términos. Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado del servicio implica aceptación de los cambios.'
    });

    await companyData.save();
    console.log('Datos de la compañía creados exitosamente');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de la base de datos');
  }
}

seedCompanyData();
import { CURSALA_LOGO_BASE64 } from './cursala-logo';

export const emailTemplate = (title: string, data: Record<string, string>, link?: string) => {
  const rows = Object.entries(data)
    .map(
      ([key, value]) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e8f0f5; font-weight: 600; color: #00385b; width: 35%; vertical-align: top; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">${key}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e8f0f5; color: #262626; font-size: 14px;">${value}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; color: #262626;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 16px;">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,56,91,0.12);">

              <!-- Header -->
              <tr>
                <td align="center" style="padding: 32px 30px 24px; background-color: #00385b;">
                  <img src="${CURSALA_LOGO_BASE64}" alt="Cursala" width="60" height="60" style="display: block; margin: 0 auto 12px;"/>
                  <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 3px; color: #ffffff;">CURSALA</h1>
                  <p style="margin: 6px 0 0 0; font-size: 13px; color: #a8c8e0; letter-spacing: 1px;">CAPACITACIÓN PROFESIONAL</p>
                </td>
              </tr>

              <!-- Accent bar -->
              <tr>
                <td style="height: 4px; background: linear-gradient(90deg, #0081c2, #e6b800);"></td>
              </tr>

              <!-- Title band -->
              <tr>
                <td style="padding: 24px 30px 0; background-color: #ffffff;">
                  <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #0081c2;">${title}</h2>
                  <div style="width: 40px; height: 3px; background-color: #e6b800; margin-top: 8px; border-radius: 2px;"></div>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 20px 30px 30px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e8f0f5;">
                    ${rows}
                  </table>

                  ${
                    link
                      ? `
                  <div style="margin-top: 32px; text-align: center;">
                    <a href="${link}" style="background-color: #0081c2; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 14px; display: inline-block; letter-spacing: 0.5px;">
                      Ver en el Panel de Administración
                    </a>
                  </div>
                  `
                      : ''
                  }
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 30px; background-color: #00385b; text-align: center;">
                  <p style="margin: 0; color: #a8c8e0; font-size: 12px;">Este es un mensaje automático de la plataforma Cursala.</p>
                  <p style="margin: 6px 0 0 0; color: #a8c8e0; font-size: 12px;">&copy; ${new Date().getFullYear()} Cursala. Todos los derechos reservados.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

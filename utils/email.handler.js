const nodemailer = require("nodemailer");
const { APP_NAME } = require("./constants");

class EmailHandler {
  static async adminAccountMail(code, emailAddress) {
    const emailTitle = `Admin Account Created`;
    const emailSubTitle = `Please use the code below to verify your account and set your own password.`;
    const btnText = code;
    const belowText = "Check my portfolio 👇";
    const belowLink = `<a href=https://www.bassem.tech>bassem.tech`;
    const footerNote =
      "You received this email to set your admin account password. If you did not initiate this action, please ignore this email.";
    const footerLink = "https://www.bassem.tech";
    const html = this.generateFullHTML({
      link: "https://www.bassem.tech",
      emailTitle,
      emailSubTitle,
      btnText,
      belowText,
      belowLink,
      footerNote,
      footerLink,
    });
    // send email to admin with code link
    await EmailHandler.sendMail(`Admin Account Created`, emailAddress, html);
  }

  static async userAccountMail(code, emailAddress) {
    const emailTitle = `User Account Created`;
    const emailSubTitle = `Please use the code below to verify your account and set your own password.`;
    const btnText = code;
    const belowText = "Check my portfolio 👇";
    const belowLink = `<a href=https://www.bassem.tech>bassem.tech`;
    const footerNote =
      "You received this email to set your user account password. If you did not initiate this action, please ignore this email.";
    const footerLink = "https://www.bassem.tech";
    const html = this.generateFullHTML({
      link: "https://www.bassem.tech",
      emailTitle,
      emailSubTitle,
      btnText,
      belowText,
      belowLink,
      footerNote,
      footerLink,
    });
    // send email to user with code link
    await EmailHandler.sendMail(`User Account Created`, emailAddress, html);
  }

  static async sendMail(subject, emailAddress, html) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAILER_EMAIL,
          pass: process.env.MAILER_PASSWORD,
        },
      });
      const mailOptions = {
        from: APP_NAME + " <MAIL>",
        to: emailAddress,
        subject: subject,
        html: html,
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.log(err);
          return err;
        } else {
          console.log("Email sent: " + emailAddress + info.response);
          return "done";
        }
      });
    } catch (err) {
      console.log("Sending Email Failed: " + err);
    }
  }

  static generateFullHTML({
    link = process.env.FRONTEND_URL,
    logo = process.env.LOGO_URL,
    backgroundColor = "#ffffff",
    primaryColor = process.env.PRIMARY_COLOR,
    secondaryColor = "#ffffff",
    emailTitle,
    emailSubTitle,
    btnText,
    btnLink,
    belowText,
    belowLink,
    footerNote,
    footerLink,
  }) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <title>Email Confirmation</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style type="text/css">
        @media screen {
          @font-face {
            font-family: 'Source Sans Pro';
            font-style: normal;
            font-weight: 400;
            src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
          }
          @font-face {
            font-family: 'Source Sans Pro';
            font-style: normal;
            font-weight: 700;
            src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
          }
        }
        body,
        table,
        td,
        a {
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
        }
        table,
        td {
          mso-table-rspace: 0pt;
          mso-table-lspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
        a[x-apple-data-detectors] {
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          color: inherit !important;
          text-decoration: none !important;
        }
        div[style*="margin: 16px 0;"] {
          margin: 0 !important;
        }
        body {
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        table {
          border-collapse: collapse !important;
        }
        a {
          color: #1a82e2;
        }
        img {
          height: auto;
          line-height: 100%;
          text-decoration: none;
          border: 0;
          outline: none;
        }
      </style>
    </head>
    <body style="background-color: ${backgroundColor};">
      <!-- start body -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <!-- start logo -->
        ${
          logo ?
          `<tr>
          <td align="center" bgcolor="${backgroundColor}">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
              <tr>
                <td align="center" valign="top" style="padding: 36px 24px;">
                  <a href="${link}" target="_blank" style="display: inline-block;">
                    <img
                      src=${logo}
                      alt="Logo" border="0" width="350"
                      style="display: block; width: 250px; max-width: 250px; min-width: 144px;">
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ""
        }
        <!-- end logo -->
        <!-- start hero -->
        <tr>
          <td align="center" bgcolor="${backgroundColor}">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
              <tr>
                <td align="left" bgcolor="${secondaryColor}"
                  style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                  <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">${emailTitle}</h1>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- end hero -->
        <!-- start copy block -->
        <tr>
          <td align="center" bgcolor="${backgroundColor}">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
              <!-- start copy -->
              <tr>
                <td align="left" bgcolor="${secondaryColor}"
                  style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                  <p style="margin: 0;">${emailSubTitle}</p>
                </td>
              </tr>
              <!-- end copy -->
              <!-- start button -->
              <tr>
                <td align="left" bgcolor="${secondaryColor}">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" bgcolor="${secondaryColor}" style="padding: 12px;">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td id="mainButton" align="center" bgcolor="${primaryColor}" style="border-radius: 6px;">
                            ${
                              btnLink
                                ? `
                              <a href="${btnLink}" target="_blank" style="display: block; padding: 20px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: white; text-decoration: none !important; border-radius: 6px;">
                                ${btnText}
                              </a>
                              `
                                : `
                              <div style="display: block; padding: 20px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: white; text-decoration: none !important; border-radius: 6px;">
                                ${btnText}
                              </div>
                              `
                            }
                            </td>
                          </tr>
                        </table>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- end button -->
              <!-- start copy -->
              <tr>
                <td align="left" bgcolor="${secondaryColor}"
                  style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                  <p style="margin: 0;">${belowText}</p>
                  <p style="margin: 0;"><a href="${link}"
                      target="_blank">${belowLink}</a></p>
                </td>
              </tr>
              <!-- end copy -->
              <!-- start copy -->
              <tr>
                <td align="left" bgcolor="${secondaryColor}"
                  style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                  <p style="margin: 0;">Cheers,<br>${process.env.APP_NAME}.</p>
                </td>
              </tr>
              <!-- end copy -->
            </table>
          </td>
        </tr>
        <!-- end copy block -->
        <!-- start footer -->
        <tr>
          <td align="center" bgcolor="${backgroundColor}" style="padding: 24px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
              <!-- start permission -->
              <tr>
                <td align="center" bgcolor="${backgroundColor}"
                  style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                  <p style="margin: 0;">${footerNote}</p>
                </td>
              </tr>
              <!-- end permission -->
              <!-- start unsubscribe -->
              ${
                footerLink
                  ? `
                <tr>
                  <td align="center" bgcolor="${backgroundColor}"
                    style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                    <a href="${link}">
                      <p style="margin: 0;">${footerLink}</p>
                    </a>
                  </td>
                </tr>`
                  : ""
              }
              <!-- end unsubscribe -->
            </table>
          </td>
        </tr>
        <!-- end footer -->
      </table>
      <!-- end body -->
    </body>
    </html>`;

    return html;
  }
}

module.exports = EmailHandler;

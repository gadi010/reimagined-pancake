export const invitationEmailHTML = (inviteLink, userEmail) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>You're Invited!</title>
    <style>
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        background-color: #f7f8fa;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        padding: 30px 40px;
      }
      h2 {
        color: #111827;
        font-size: 22px;
        margin-bottom: 10px;
      }
      p {
        font-size: 15px;
        line-height: 1.6;
      }
      .button {
        display: inline-block;
        margin-top: 20px;
        padding: 12px 20px;
        background-color: #2563eb;
        color: white !important;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
      }
      .footer {
        margin-top: 30px;
        font-size: 13px;
        color: #6b7280;
        text-align: center;
      }
      .highlight {
        font-weight: 600;
        color: #111827;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>You're invited to join our project platform!</h2>
      <p>Hello <span class="highlight">${userEmail}</span>,</p>
      <p>
        The admin has invited you to join our platform.  
        To get started, click the button below and sign in using your GitHub account.
      </p>
      <a href="${inviteLink}" class="button">Accept Invitation</a>
      <p>If the button doesn’t work, you can also copy and paste the link below into your browser:</p>
      <p><a href="${inviteLink}">${inviteLink}</a></p>
      <div class="footer">
        © ${new Date().getFullYear()} Project Manager Inc.  
        <br />
        Please ignore this email if you did not request this invitation.
      </div>
    </div>
  </body>
</html>
`;

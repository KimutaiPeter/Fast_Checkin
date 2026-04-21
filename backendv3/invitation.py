import os
import resend

resend.api_key = "re_KZq7hzip_8vmdVZPZh1W5aU5Yy6fm9hsF"

def send_invite(email,id_index):
    params: resend.Emails.SendParams = {
    "from": "onboarding@resend.dev",
    "to": [email],
    "subject": "Invite to Join the Team",
    "html": html % id_index,
    }
    email = resend.Emails.send(params)
    print(email)



html="""
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Stellar Admin – You're Invited</title>
    <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
    <style type="text/css">
    
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%%;
            -ms-text-size-adjust: 100%%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            border-collapse: collapse;
        }

        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            outline: none;
            display: block;
        }

        body {
            margin: 0;
            padding: 0;
        }

        a {
            text-decoration: none;
        }

        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500;600&display=swap');

        @media only screen and (max-width:640px) {
            .outer-td {
                padding: 0 !important;
            }

            .shell {
                width: 100%% !important;
            }

            .hero-pad {
                padding: 40px 24px !important;
            }

            .hero-h1 {
                font-size: 32px !important;
            }

            .info-left {
                display: block !important;
                width: 100%% !important;
                border-right: none !important;
                box-sizing: border-box;
            }

            .info-right {
                display: block !important;
                width: 100%% !important;
                box-sizing: border-box;
            }

            .footer-td {
                padding: 32px 20px !important;
            }
        }
    </style>
</head>

<body style="margin:0; padding:0; background-color:#f7f9fb;">

    <!-- Preheader -->
    <div
        style="display:none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:#f7f9fb; mso-hide:all;">
        You've been invited to join the team. Accept within 72 hours.
    </div>

    <!-- ════════════════════════════════════════════════════════
       PAGE WRAPPER  bg-surface (#f7f9fb)
  ════════════════════════════════════════════════════════ -->
    <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#f7f9fb;">
        <tr>
            <td class="outer-td" align="center" valign="top" style="padding:48px 16px;">

                <!-- ══════════════════════════════════════════════════
             SHELL  max-w-2xl = 672px
        ══════════════════════════════════════════════════ -->
                <table role="presentation" class="shell" width="672" cellpadding="0" cellspacing="0" border="0"
                    style="width:672px; max-width:672px;">

                    <!-- ─────────────────────────────────────────────
               HEADER  bg-white
          ───────────────────────────────────────────────── -->
                    <tr>
                        <td style="background-color:#ffffff; padding:24px 32px; border-radius:0;">
                            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td valign="middle">
                                        <!-- text-2xl font-bold tracking-tighter text-blue-900 font-manrope -->
                                        <span style="font-family:'Manrope',Georgia,'Times New Roman',serif;
                                 font-size:24px; font-weight:800; color:#1e3a8a;
                                 letter-spacing:-0.05em; line-height:1;">
                                            Events
                                        </span>
                                    </td>
                                    <td align="right" valign="middle">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- ─────────────────────────────────────────────
               HERO CARD
               bg-surface-container-low = #f2f4f6
               rounded-xl overflow-hidden
               dot-pattern overlay opacity-[0.03]
          ───────────────────────────────────────────────── -->
                    <tr>
                        <td style="padding:0;">
                            <!-- Outer rounded card wrapper -->
                            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0"
                                style="background-color:#f2f4f6; border-radius:8px; overflow:hidden;">
                                <tr>
                                    <td class="hero-pad" align="center" style="padding:64px 48px 56px;
                             background-image:url('data:image/svg+xml,%%3Csvg xmlns%%3D%%22http%%3A%%2F%%2Fwww.w3.org%%2F2000%%2Fsvg%%22 width%%3D%%2220%%22 height%%3D%%2220%%22%%3E%%3Ccircle cx%%3D%%221%%22 cy%%3D%%221%%22 r%%3D%%221%%22 fill%%3D%%22%%232a55c9%%22 fill-opacity%%3D%%220.03%%22%%2F%%3E%%3C%%2Fsvg%%3E');
                             background-repeat:repeat;
                             background-size:20px 20px;">

                                        <!-- Icon badge  w-16 h-16 bg-primary-container/10 rounded-xl -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                                            style="margin:0 auto 32px;">
                                            <tr>
                                                <td align="center" valign="middle" style="width:64px; height:64px;
                                   background-color:rgba(0,62,179,0.10);
                                   border-radius:8px;">
                                                    <!-- mail FILL=1  text-primary=#002a81 text-3xl≈30px -->
                                                    <svg width="30" height="30" viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        style="display:inline-block;">
                                                        <path
                                                            d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
                                                            fill="#002a81" />
                                                    </svg>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- h1  text-4xl md:text-5xl font-extrabold text-primary tracking-tight leading-tight -->
                                        <h1 class="hero-h1" style="font-family:'Manrope',Georgia,serif;
                               font-size:48px;
                               font-weight:800;
                               color:#002a81;
                               line-height:1.1;
                               letter-spacing:-0.03em;
                               margin:0 0 24px 0;
                               padding:0;
                               text-align:center;">
                                            Ready to join<br />your team?
                                        </h1>

                                        <!-- p  text-on-surface-variant=#434653 text-lg max-w-md leading-relaxed -->
                                        <p style="font-family:'Inter',Helvetica,Arial,sans-serif;
                              font-size:18px;
                              line-height:1.75;
                              color:#434653;
                              max-width:448px;
                              margin:0 auto 40px;
                              text-align:center;
                              padding:0;">
                                            You've been invited to join the Events system. Access
                                            your professional workspace and start collaborating with your production
                                            team today.
                                        </p>

                                        <!-- CTA  bg-gradient-to-br from-[#002a81] to-[#003eb3] rounded-lg font-bold text-sm tracking-[0.05em] uppercase -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                                            style="margin:0 auto;">
                                            <tr>
                                                <td align="center" style="border-radius:4px;
                                   background:linear-gradient(135deg, #002a81 0%%, #003eb3 100%%);">
                                                    <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="#" style="height:54px;v-text-anchor:middle;width:224px;" arcsize="7%%" stroke="f" fillcolor="#002a81"><w:anchorlock/><center><![endif]-->
                                                    <a href="https://events.yote.me/invite/%s" style="display:inline-block;
                                    padding:16px 40px;
                                    font-family:'Inter',Helvetica,Arial,sans-serif;
                                    font-size:14px;
                                    font-weight:700;
                                    color:#ffffff;
                                    text-transform:uppercase;
                                    letter-spacing:0.05em;
                                    text-decoration:none;
                                    border-radius:4px;
                                    line-height:1.4;">
                                                        Accept Invitation
                                                    </a>
                                                    <!--[if mso]></center></v:roundrect><![endif]-->
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Workspace image  mt-16 h-64 rounded-xl shadow-2xl + primary/10 overlay -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:64px auto 0; width:100%%; max-width:576px;
                                  border-radius:8px; overflow:hidden;
                                  box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
                                            <tr>
                                                <td
                                                    style="padding:0; border-radius:8px; overflow:hidden; position:relative; line-height:0;">
                                                    
                                                </td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- ─────────────────────────────────────────────
               INFO SECTION
               mt-12  grid grid-cols-1 md:grid-cols-12 gap-8
          ───────────────────────────────────────────────── -->
                    <tr>
                        <td style="padding:32px 0 0 0;">
                            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0">
                                <tr>

                                    <!-- Left: md:col-span-8  bg-surface-container-lowest=#fff  p-8 rounded-xl -->
                                    <td class="info-left" valign="top" style="background-color:#ffffff;
                             padding:32px;
                             border-radius:8px 0 0 8px;
                             width:66.666%%;">

                                        <!-- h2 text-xl font-bold text-primary -->
                                        <h2 style="font-family:'Manrope',Georgia,serif;
                               font-size:20px; font-weight:700;
                               color:#002a81;
                               margin:0 0 16px 0; padding:0;
                               letter-spacing:-0.01em;">
                                            Next Steps
                                        </h2>

                                        <!-- p text-on-surface-variant leading-relaxed text-sm -->
                                        <p style="font-family:'Inter',Helvetica,Arial,sans-serif;
                              font-size:14px; line-height:1.75;
                              color:#434653;
                              margin:0 0 16px 0; padding:0;">
                                            Joining will take less than 2 minutes. You'll be asked to set your password
                                            and configure security protocols to ensure your account meets our
                                            administrative standards.
                                        </p>

                                        <!-- verified_user + text  text-xs font-semibold text-primary/70 uppercase tracking-wide -->
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td valign="middle" style="padding-right:10px;">
                                                    <svg width="16" height="16" viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg" style="display:block;">
                                                        <path
                                                            d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
                                                            fill="rgba(0,42,129,0.65)" />
                                                    </svg>
                                                </td>
                                                <td valign="middle" style="font-family:'Inter',Helvetica,Arial,sans-serif;
                                   font-size:11px; font-weight:600;
                                   color:rgba(0,42,129,0.65);
                                   text-transform:uppercase;
                                   letter-spacing:0.1em;">
                                                    Enterprise Grade Security Enabled
                                                </td>
                                            </tr>
                                        </table>

                                    </td>

                                    <!-- Right: md:col-span-4  bg-secondary-container/30  p-8 rounded-xl h-full -->
                                    <!-- secondary-container = #d4e3ff → /30 opacity ≈ mix with white → #edf2ff -->
                                    
                            </table>
                        </td>
                    </tr>

                    <!-- ─────────────────────────────────────────────
               FOOTER  bg-slate-50  border-t border-slate-200/20
          ───────────────────────────────────────────────── -->
                    

                </table>
                <!-- /shell -->

            </td>
        </tr>
    </table>

</body>

</html>
"""
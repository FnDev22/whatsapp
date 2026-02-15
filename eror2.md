2026-02-15 10:28:59.911 [info] [2026-02-15 10:28:59] DEBUG Creating transport: nodemailer (8.0.1; +https://nodemailer.com/; SMTP/8.0.1[client:8.0.1])
2026-02-15 10:28:59.912 [info] [2026-02-15 10:28:59] DEBUG Sending mail using SMTP/8.0.1[client:8.0.1]
2026-02-15 10:28:59.929 [info] [2026-02-15 10:28:59] DEBUG [2OGKYnnbXbw] Resolved smtp.gmail.com as 172.253.63.109 [cache miss]
2026-02-15 10:28:59.932 [info] [2026-02-15 10:28:59] INFO  [2OGKYnnbXbw] Connection established to 172.253.63.109:587
2026-02-15 10:28:59.996 [info] [2026-02-15 10:28:59] DEBUG [2OGKYnnbXbw] S: 220 smtp.gmail.com ESMTP 6a1803df08f44-8971cdd1541sm111706126d6.49 - gsmtp
2026-02-15 10:28:59.996 [info] [2026-02-15 10:28:59] DEBUG [2OGKYnnbXbw] C: EHLO [169.254.59.37]
2026-02-15 10:29:00.008 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250-smtp.gmail.com at your service, [13.222.132.160]
2026-02-15 10:29:00.008 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250-SIZE 35882577
2026-02-15 10:29:00.009 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250-8BITMIME
2026-02-15 10:29:00.009 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250-STARTTLS
2026-02-15 10:29:00.009 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250-ENHANCEDSTATUSCODES
2026-02-15 10:29:00.009 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250-PIPELINING
2026-02-15 10:29:00.009 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250-CHUNKING
2026-02-15 10:29:00.009 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250 SMTPUTF8
2026-02-15 10:29:00.009 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] C: STARTTLS
2026-02-15 10:29:00.019 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 220 2.0.0 Ready to start TLS
2026-02-15 10:29:00.024 [info] [2026-02-15 10:29:00] INFO  [2OGKYnnbXbw] Connection upgraded with STARTTLS
2026-02-15 10:29:00.025 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] C: EHLO [169.254.59.37]
2026-02-15 10:29:00.034 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250-smtp.gmail.com at your service, [13.222.132.160]
2026-02-15 10:29:00.034 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250-SIZE 35882577
2026-02-15 10:29:00.034 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250-8BITMIME
2026-02-15 10:29:00.034 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250-AUTH LOGIN PLAIN XOAUTH2 PLAIN-CLIENTTOKEN OAUTHBEARER XOAUTH
2026-02-15 10:29:00.034 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250-ENHANCEDSTATUSCODES
2026-02-15 10:29:00.034 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250-PIPELINING
2026-02-15 10:29:00.034 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250-CHUNKING
2026-02-15 10:29:00.035 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 250 SMTPUTF8
2026-02-15 10:29:00.035 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] SMTP handshake finished
2026-02-15 10:29:00.036 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] C: AUTH PLAIN AHJ1bWFoa29zdGpheWFvdHBAZ21haWwuY29tAC8qIHNlY3JldCAqLw==
2026-02-15 10:29:00.325 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 535-5.7.8 Username and Password not accepted. For more information, go to
2026-02-15 10:29:00.325 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] S: 535 5.7.8  https://support.google.com/mail/?p=BadCredentials 6a1803df08f44-8971cdd1541sm111706126d6.49 - gsmtp
2026-02-15 10:29:00.326 [info] [2026-02-15 10:29:00] INFO  [2OGKYnnbXbw] User "rumahkostjayaotp@gmail.com" failed to authenticate
2026-02-15 10:29:00.327 [info] [2026-02-15 10:29:00] DEBUG [2OGKYnnbXbw] Closing connection to the server using "end"
2026-02-15 10:29:00.327 [info] [2026-02-15 10:29:00] ERROR Send Error: Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to
2026-02-15 10:29:00.327 [info] [2026-02-15 10:29:00] ERROR 535 5.7.8  https://support.google.com/mail/?p=BadCredentials 6a1803df08f44-8971cdd1541sm111706126d6.49 - gsmtp
2026-02-15 10:29:00.332 [error] Error sending email: Error: Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to
535 5.7.8  https://support.google.com/mail/?p=BadCredentials 6a1803df08f44-8971cdd1541sm111706126d6.49 - gsmtp
    at t.exports._formatError (.next/server/chunks/[root-of-the-server]__d8ae39ba._.js:1:162312)
    at t.exports._actionAUTHComplete (.next/server/chunks/[root-of-the-server]__d8ae39ba._.js:1:173806)
    at t.exports.<anonymous> (.next/server/chunks/[root-of-the-server]__d8ae39ba._.js:1:158558)
    at t.exports._processResponse (.next/server/chunks/[root-of-the-server]__d8ae39ba._.js:1:164669)
    at t.exports._onData (.next/server/chunks/[root-of-the-server]__d8ae39ba._.js:1:161919)
    at TLSSocket._onSocketData (.next/server/chunks/[root-of-the-server]__d8ae39ba._.js:1:151888) {
  code: 'EAUTH',
  response: '535-5.7.8 Username and Password not accepted. For more information, go to\n' +
    '535 5.7.8  https://support.google.com/mail/?p=BadCredentials 6a1803df08f44-8971cdd1541sm111706126d6.49 - gsmtp',
  responseCode: 535,
  command: 'AUTH PLAIN'
}
2026-02-15 10:28:59.568 [info] [OTP Debug] Email User: rumahkostjayaotp@gmail.com Length: 26
2026-02-15 10:28:59.568 [info] [OTP Debug] Email Pass Type: string Length: 18
2026-02-15 10:28:59.568 [info] [OTP Debug] First char: i Last char: f
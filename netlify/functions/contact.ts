import { Handler } from "@netlify/functions";
import nodemailer from "nodemailer";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Successful preflight call." }),
    };
  } else if (event.httpMethod === "POST") {
    try {
      if (!event.body) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify("body is required"),
        };
      }

      const transporter = nodemailer.createTransport({
        port: 465,
        host: "mail.red.shared-server.net",
        auth: {
          user: "toiawase@ageokogyo.com",
          pass: `7NsT5gi6`,
        },
        tls: {
          rejectUnauthorized: false,
        },
        secure: true,
      });

      const req = JSON.parse(event.body);

      // 管理人に送るお問い合わせメッセージ通知メール
      const toHostMailData = {
        from: "toiawase@ageokogyo.com",
        to: "toiawase@ageokogyo.com",
        subject: `【お問い合わせ】${req.name}様より`,
        html: `
      <p>
        以下の内容でお問い合わせを承りました。
      </p>
      <p>-----------------------------------------</p>
      <h2>お問い合わせ内容</h2>
      <p>【問い合わせ種別】</p>
      <p>${req.contactKinds}</p>
      <p>【お名前】</p>
      <p>${req.name}</p>
      <p>【お名前（フリガナ）】</p>
      <p>${req.ruby}</p>
      <p>【メールアドレス】</p>
      <p>${req.email}</p>
      <p>【お問い合わせ内容】</p>
      <p>${req.content}</p>
      <p>-----------------------------------------</p>
    `,
      };

      // ゲストに送る自動受付メール
      const toGuestMailData = {
        from: "toiawase@ageokogyo.com",
        to: req.email,
        subject: `【お問い合わせ自動受付メール】`,
        html: `
            <p>
              お問い合わせありがとうございます。
              <br>以下の内容でお問い合わせを承りました。
            </p>
            <p>-----------------------------------------</p>
            <h2>お問い合わせ内容</h2>
            <p>【問い合わせ種別】</p>
            <p>${req.contactKinds}</p>
            <p>【お名前】</p>
            <p>${req.name}</p>
            <p>【お名前（フリガナ）】</p>
            <p>${req.ruby}</p>
            <p>【メールアドレス】</p>
            <p>${req.email}</p>
            <p>【お問い合わせ内容】</p>
            <p>${req.content}</p>
            <p>-----------------------------------------</p>
          `,
      };

      const [hostInfo, guestInfo] = await Promise.all([
        transporter.sendMail(toHostMailData),
        transporter.sendMail(toGuestMailData),
      ]);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ hostInfo, guestInfo }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message }),
      };
    }
  } else {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify("prohibit method"),
    };
  }
};

export { handler };

import { Handler } from "@netlify/functions";
import nodemailer from "nodemailer";

const handler: Handler = async (event) => {
  try {
    // 送信用アカウントの設定（ここではGmail）
    const transporter = nodemailer.createTransport({
      port: 465,
      host: "mail.red.shared-server.net",
      auth: {
        user: "mail@ageokogyo.com",
        pass: `C40kZhnK`,
      },
      tls: {
        rejectUnauthorized: false,
      },
      secure: true,
    });

    if (!event.body) {
      return {
        statusCode: 403,
        body: JSON.stringify("body is required"),
      };
    }

    const req = JSON.parse(event.body);

    // 管理人に送るお問い合わせメッセージ通知メール
    const toHostMailData = {
      from: "mail@ageokogyo.com",
      to: "mail@ageokogyo.com",
      subject: `【お問い合わせ】${req.body.name}様より`,
      html: `
      <p>
        以下の内容でお問い合わせを承りました。
      </p>
      <p>-----------------------------------------</p>
      <h2>お問い合わせ内容</h2>
      <p>【問い合わせ種別】</p>
      <p>${req.body.contactKinds}</p>
      <p>【お名前】</p>
      <p>${req.body.name}</p>
      <p>【お名前（フリガナ）】</p>
      <p>${req.body.ruby}</p>
      <p>【メールアドレス】</p>
      <p>${req.body.email}</p>
      <p>【お問い合わせ内容】</p>
      <p>${req.body.content}</p>
      <p>-----------------------------------------</p>
    `,
    };

    // ゲストに送る自動受付メール
    const toGuestMailData = {
      from: "mail@ageokogyo.com",
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
          <p>${req.body.contactKinds}</p>
          <p>【お名前】</p>
          <p>${req.body.name}</p>
          <p>【お名前（フリガナ）】</p>
          <p>${req.body.ruby}</p>
          <p>【メールアドレス】</p>
          <p>${req.body.email}</p>
          <p>【お問い合わせ内容】</p>
          <p>${req.body.content}</p>
          <p>-----------------------------------------</p>
        `,
    };

    const [hostInfo, guestInfo] = await Promise.all([
      transporter.sendMail(toHostMailData),
      transporter.sendMail(toGuestMailData),
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({ hostInfo, guestInfo }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export { handler };

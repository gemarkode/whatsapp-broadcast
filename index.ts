import { LocalAuth, Client, MessageMedia } from "whatsapp-web.js";
import qrCode from "qrcode-terminal";
import { readFileSync } from "fs";
import { startCase } from "lodash";

const $log = (...args: any[]) => console.log("[LOG]", ...args);

const template = `Hi [Nama],

Salam! Semoga harimu menyenangkan. Saya ingin mengajakmu untuk bergabung dalam Zoom meeting webinar yang sangat menarik yang diadakan oleh Gemarkode tentang Web Scraping. Topiknya sangat relevan dan saya yakin kamu akan mendapatkan banyak informasi berharga.

📅 Tanggal: [Tanggal]
🕒 Jam: [Jam]
📍 Tempat: Zoom Meeting
🔗 Link Zoom: [Masukkan link Zoom di sini]

Ini kesempatan bagus untuk memperluas pengetahuan kita dalam dunia Web Scraping dan mendengarkan pandangan dari para ahli. Apakah kamu tertarik untuk bergabung?

Dengan bergabung dalam acara ini, kamu akan mendapatkan:
- 🧠 Pengetahuan tentang Web Scraping
- 💬 Kesempatan untuk bertanya langsung kepada para ahli
- 📜 Mendapatkan sertifikat
- 🤝 Bergabung dengan komunitas Gemarkode

Terima kasih dan semoga kita bisa bertemu di acara tersebut!

Salam,
Tim Gemarkode`;

const date = "21 Januari 2024";
const time = "20:00 WIB";
const link = "https://zoom.us/j/1234567890?pwd=QWERTYUIOPASDFGHJKLZXCVBNM";

export const client = new Client({
  puppeteer: {
    headless: true,
    args: ["--no-sandbox"],
  },
  authStrategy: new LocalAuth(),
});

client.initialize();

client.on("qr", (qr) => {
  qrCode.generate(qr, { small: true });
});

client.on("ready", async () => {
  $log("Client is ready!");
  const poster = readFileSync("poster.jpg", "base64");

  const media = new MessageMedia("image/jpeg", poster);

  const data = JSON.parse(readFileSync("dummy.json", "utf8"));
  for (const contact of data) {
    let number = contact["No Wa"];
    // if start with 0, replace with 62
    if (number.startsWith("0")) {
      number = number.replace("0", "62");
    }

    // replace non numeric character
    number = number.replace(/[^0-9]/g, "");

    const chatId = number + "@c.us";
    const name = startCase(contact["Nama"]);

    await client.sendMessage(chatId, media, {
      caption: template
        .replace("[Nama]", name)
        .replace("[Tanggal]", date)
        .replace("[Jam]", time)
        .replace("[Masukkan link Zoom di sini]", link),
    });
    $log(`Message sent to ${name} (${chatId})`);
  }

  $log("Done! Press any key to exit");
  process.stdin.once("data", () => process.exit(0));
});

client.on("message", (msg) => {
  if (msg.body == "!ping") {
    msg.reply("pong");
  }
});

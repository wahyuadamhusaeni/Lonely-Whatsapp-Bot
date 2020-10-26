const moment = require("moment");
const venom = require("venom-bot");
const fs = require("fs");
const mime = require("mime-types");
const number_admin = ["6282226076210@c.us"];

venom
  .create()
  .then((client) => start(client))
  .catch((erro) => {
    console.log(`[ ${moment().format("HH:mm:ss")} ] Bot Error ! `);
  });

function start(client) {
  client.onIncomingCall(async (call) => {
    client.sendText(
      call.peerJid,
      "Maaf, Saya tidak bisa menerima panggilan dari anda !"
    );
  });

  client.onStateChange(async (state) => {
    if ("CONFLICT".includes(state)) client.useHere();
  });

  client.onMessage(async (message) => {
    if (message.body == "!menu") {
      client.sendText(
        message.from,
        `
            *SELAMAT DATANG 😎*
️*List Menu*
➡️ !menu1 = Fun Menu 🌞 
        `
      );
    } else if (message.body == "!menu1") {
      client.sendText(
        message.from,
        ` 
        *Welcome To Fun Menu*
   
*!sticker* = mengubah gambar menjadi Sticker
contoh : *kirim gambar dengan caption !sticker*
        
        `
      );
    }

    // Menu1
    else if (message.caption == "!sticker" && message.isMedia == true) {
      const buffer = await client.decryptFile(message);
      const fileName = `image.${mime.extension(message.mimetype)}`;
      await fs.writeFile(fileName, buffer, async (err) => {
        if (!err) {
          await client
            .sendImageAsSticker(message.from, `./${fileName}`)
            .catch((err) => {});
        }
      });
    }

    // Admin Menu
    else if (
      message.body == "!menu_admin" &&
      number_admin.includes(message.from)
    ) {
      client.sendText(
        message.from,
        `
                *SELAMAT DATANG Admin😎*
    ️*List Menu*

    ➡️ !admin_profile_name = Set Profile Name
    contoh : !admin_profile_name Profile Baru 

    ➡️ !admin_profile_photo = Set Profile photo
    contoh : kirim gambar dengan caption !admin_profile_photo

    ➡️ !admin_status = Set Status
    contoh : !admin_status status baru 

    ➡️ !admin_restart = Restart Service

    ➡️ !admin_info = Info Service


            `
      );
    } else if (
      message.body.startsWith("!admin_profile_name ") &&
      number_admin.includes(message.from)
    ) {
      let profile_name = message.body.replace(/!admin_profile_name/, "");
      await client.setProfileName(profile_name);
      await client.sendText(message.from, `Profile Name Berhasil Diganti !`);
    } else if (
      message.caption == "!admin_profile_photo" &&
      number_admin.includes(message.from) &&
      message.isMedia == true
    ) {
      const buffer = await client.decryptFile(message);
      const fileName = `profile_photo.${mime.extension(message.mimetype)}`;
      await fs.writeFile(fileName, buffer, async (err) => {
        if (!err) {
          await client.setProfilePic(`./${fileName}`);
          await client.sendText(
            message.from,
            `Profile Photo Berhasil Diganti !`
          );
        } else {
          await client.sendText(message.from, `Profile Photo Gagal Diganti !`);
        }
      });
    } else if (
      message.body.startsWith("!admin_status ") &&
      number_admin.includes(message.from)
    ) {
      let status = message.body.replace(/!admin_status/, "");
      await client.setProfileStatus(status);
      await client.sendText(message.from, `Status Berhasil Diganti !`);
    } else if (
      message.body == "!admin_restart" &&
      number_admin.includes(message.from)
    ) {
      await client.sendText(message.from, `Restart Service Sekarang !`);
      await client.restartService();
    } else if (
      message.body == "!admin_info" &&
      number_admin.includes(message.from)
    ) {
      let info_device = await client.getHostDevice();
      await client.sendText(
        message.from,
        `
Number    : ${info_device.me.user}
Server    : ${info_device.me.server}
Battery   : ${info_device.battery} %
      `
      );
    }
  });
}

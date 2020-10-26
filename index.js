const moment = require("moment");
const venom = require("venom-bot");
const fs = require("fs");
const mime = require("mime-types");
const axios = require("axios");
const number_admin = ["6282226076210@c.us"];
venom
  .create()
  .then((client) => start(client))
  .catch((erro) => {
    console.log(`[ ${moment().format("HH:mm:ss")} ] Bot Error ! `);
  });

async function start(client) {
  let info_device = await client.getHostDevice();
  let my_number = info_device.me._serialized;
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
    let is_admin_group = false;
    let iam_admin_group = false;

    if (message.isGroupMsg == true) {
      let admin_group = await client.getGroupAdmins(message.from);

      admin_group.forEach((admin) => {
        if (admin._serialized == message.author) {
          is_admin_group = true;
        }
      });

      admin_group.forEach((admin) => {
        if (admin._serialized == my_number) {
          iam_admin_group = true;
        }
      });
    }

    if (message.type == "sticker" && message.isGroupMsg == false) {
      await client.sendText(message.from, `Gak ngerti sticker 😭`);
    }

    if (message.body == "!menu") {
      client.sendText(
        message.from,
        `
            *SELAMAT DATANG 😎*
️*List Menu*

➡️ !admin = Menu Khusus Admin Grup🏅
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
            .then(async (re) => {
              fs.unlinkSync(`./${fileName}`);
            })
            .catch((err) => {});
        }
      });
    }

    // Admin Group
    else if (
      message.body == "!admin" &&
      message.isGroupMsg == true &&
      is_admin_group == true &&
      iam_admin_group == true
    ) {
      client.sendText(
        message.from,
        `
        *SELAMAT DATANG Admi Group 😎*
        ️*List Menu*
    *!kick* = Kick member grup.
    *!add* = Menambah member group.
    *!promote* = Promote admin grup.
    *!demote* = Menurunkan admin group.
    *!leave*  = Bot Keluar group.
          `
      );
    } else if (
      message.body.startsWith("!kick ") &&
      message.isGroupMsg == true &&
      is_admin_group == true &&
      iam_admin_group == true
    ) {
      let number = message.mentionedJidList;
      number.forEach(async (re) => {
        await client.removeParticipant(message.from, re);
      });
    } else if (
      message.body.startsWith("!add ") &&
      message.isGroupMsg == true &&
      is_admin_group == true &&
      iam_admin_group == true
    ) {
      let number = message.body.slice(5);
      if (number.indexOf("62") == -1) {
        const check_no = await client.checkNumberStatus(
          `${number.replace("0", "62")}@c.us`
        );

        if (check_no.status == 200) {
          await client
            .addParticipant(message.from, `${number.replace("0", "62")}@c.us`)
            .then(async (re) => {
              await client.sendMentioned(
                message.from,
                `[:] Selamat datang @` +
                  number +
                  `! jangan lupa baca Deskripsi group yah 😎👊🏻`,
                [number]
              );
            });
        } else {
          client.sendText(message.from, "[:] No Tidak Valid");
        }
      } else {
        client.sendText(message.from, "[:] Format nomor harus 0821xxxxxx");
      }
    } else if (
      message.body.startsWith("!promote ") &&
      message.isGroupMsg == true &&
      is_admin_group == true &&
      iam_admin_group == true
    ) {
      let number = message.mentionedJidList;
      number.forEach(async (re) => {
        await client
          .promoteParticipant(message.from, re)
          .then(async (response) => {
            await client.sendMentioned(
              message.from,
              `[:] @${re.replace(
                "@c.us",
                ""
              )}! sekarang anda adalah admin sob 🔥`,
              [`@${re.replace("@c.us", "")}`]
            );
          });
      });
    } else if (
      message.body.startsWith("!demote ") &&
      message.isGroupMsg == true &&
      is_admin_group == true &&
      iam_admin_group == true
    ) {
      let number = message.mentionedJidList;
      number.forEach(async (re) => {
        await client
          .demoteParticipant(message.from, re)
          .then(async (response) => {
            await client.sendMentioned(
              message.from,
              `[:] @${re.replace("@c.us", "")}! anda diturunkan dari admin 😔`,
              [`@${re.replace("@c.us", "")}`]
            );
          });
      });
    } else if (
      message.body == "!leave" &&
      message.isGroupMsg == true &&
      is_admin_group == true
    ) {
      await client
        .sendText(message.from, `Selamat Tinggal Semua 😭`)
        .then(async (re) => {
          await client.leaveGroup(message.from);
        });
    }

    // Admin Menu Settings
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
          await client
            .sendText(message.from, `Profile Photo Berhasil Diganti !`)
            .then(async (re) => {
              fs.unlinkSync(`./${fileName}`);
            });
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
Battery   : ${info_device.battery} %
      `
      );
    }
    // Simsimi
    else if (message.isGroupMsg == false) {
      await axios
        .get("http://api.kitabuat.com/simsimi/getapi")
        .then(async (response) => {
          if (response.data.status == true) {
            let api_key = response.data.data;
            const headers = {
              "Content-Type": "application/json",
              "x-api-key": api_key,
            };

            await axios
              .post(
                "https://wsapi.simsimi.com/190410/talk",
                {
                  utext: message.body,
                  lang: "id",
                  country: ["ID"],
                  atext_bad_prob_max: 0.5,
                },
                {
                  headers: headers,
                }
              )
              .then(async (re) => {
                console.log(
                  `[ ${moment().format("HH:mm:ss")} ]  => Bales Simsimi : ${
                    re.data.atext
                  }`
                );
                await client.sendText(message.from, re.data.atext);
              })
              .catch(async (error) => {
                console.log(
                  `[ ${moment().format("HH:mm:ss")} ]  => Simsimi Error `
                );
              });
          } else {
            console.log(
              `[ ${moment().format("HH:mm:ss")} ]  => Simsimi Error `
            );
            await client.sendText(message.from, "Simsimi Error Guys 😭");
          }
        })
        .catch(async (error) => {
          console.log(`[ ${moment().format("HH:mm:ss")} ]  => Simsimi Error `);
          await client.sendText(message.from, "Simsimi Error Guys 😭");
        });
    }
  });

  client.onAddedToGroup(async (notification) => {
    let number = await notification.id;
    await client.sendText(
      number,
      `Hai perkenalkan aku Lonely Bot, Salam Kenal`
    );
  });
}

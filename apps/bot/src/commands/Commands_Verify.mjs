// Generated by ReScript, PLEASE EDIT WITH CARE

import * as Env from "../Env.mjs";
import * as Uuid from "uuid";
import * as Decode from "../bindings/Decode.mjs";
import * as Canvas from "canvas";
import * as Qrcode from "qrcode";
import * as Js_dict from "rescript/lib/es6/js_dict.js";
import * as $$Promise from "@ryyppy/rescript-promise/src/Promise.mjs";
import * as Constants from "../Constants.mjs";
import * as Endpoints from "../Endpoints.mjs";
import * as Gist$Utils from "@brightidbot/utils/src/Gist.mjs";
import * as DiscordJs from "discord.js";
import * as Belt_Option from "rescript/lib/es6/belt_Option.js";
import * as Caml_option from "rescript/lib/es6/caml_option.js";
import * as Caml_exceptions from "rescript/lib/es6/caml_exceptions.js";
import * as Builders from "@discordjs/builders";
import * as Json$JsonCombinators from "@glennsl/rescript-json-combinators/src/Json.mjs";
import * as Json_Decode$JsonCombinators from "@glennsl/rescript-json-combinators/src/Json_Decode.mjs";

var VerifyHandlerError = /* @__PURE__ */Caml_exceptions.create("Commands_Verify.VerifyHandlerError");

var BrightIdError = /* @__PURE__ */Caml_exceptions.create("Commands_Verify.BrightIdError");

var Canvas$1 = {};

var QRCode = {};

Env.createEnv(undefined);

var config = Env.getConfig(undefined);

var config$1;

if (config.TAG === /* Ok */0) {
  config$1 = config._0;
} else {
  throw {
        RE_EXN_ID: Env.EnvError,
        _1: config._0,
        Error: new Error()
      };
}

function addRoleToMember(guildRole, member) {
  var guildMemberRoleManager = member.roles;
  return guildMemberRoleManager.add(guildRole, undefined);
}

function fetchVerification(uuid) {
  var endpoint = "" + Endpoints.brightIdVerificationEndpoint + "/" + Constants.context + "/" + uuid + "?timestamp=seconds";
  var params = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    timeout: 60000
  };
  return globalThis.fetch(endpoint, params).then(function (res) {
                return res.json();
              }).then(function (json) {
              var match = Json$JsonCombinators.decode(json, Decode.BrightId.data);
              var match$1 = Json$JsonCombinators.decode(json, Decode.BrightId.error);
              if (match.TAG === /* Ok */0) {
                return Promise.resolve(match._0.data);
              } else if (match$1.TAG === /* Ok */0) {
                return Promise.reject({
                            RE_EXN_ID: BrightIdError,
                            _1: match$1._0
                          });
              } else {
                return Promise.reject({
                            RE_EXN_ID: Json_Decode$JsonCombinators.DecodeError,
                            _1: match._0
                          });
              }
            });
}

function makeEmbed(verifyUrl) {
  var fields = [
    {
      name: "1. Get Verified in the BrightID app",
      value: "Getting verified requires you make connections with other trusted users. Given the concept is new and there are not many trusted users, this is currently being done through [Verification parties](https://www.brightid.org/meet \"https://www.brightid.org/meet\") that are hosted in the BrightID server and require members join a voice/video call."
    },
    {
      name: "2. Link to a Sponsored App (like 1hive, gitcoin, etc)",
      value: "You can link to these [sponsored apps](https://apps.brightid.org/ \"https://apps.brightid.org/\") once you are verified within the app."
    },
    {
      name: "3. Type the `/verify` command in an appropriate channel",
      value: "You can type this command in any public channel with access to the BrightID Bot, like the official BrightID server which [you can access here](https://discord.gg/gH6qAUH \"https://discord.gg/gH6qAUH\")."
    },
    {
      name: "4. Scan the DM\"d QR Code",
      value: "Open the BrightID app and scan the QR code. Mobile users can click [this link](" + verifyUrl + ")."
    },
    {
      name: "5. Click the button after you scanned the QR code",
      value: "Once you have scanned the QR code you can return to Discord and click the button to receive the appropriate BrightID role."
    }
  ];
  return new DiscordJs.MessageEmbed().setColor("#fb8b60").setTitle("How To Get Verified with Bright ID").setURL("https://www.brightid.org/").setAuthor("BrightID Bot", "https://media.discordapp.net/attachments/708186850359246859/760681364163919994/1601430947224.png", "https://www.brightid.org/").setDescription("Here is a step-by-step guide to help you get verified with BrightID.").setThumbnail("https://media.discordapp.net/attachments/708186850359246859/760681364163919994/1601430947224.png").addFields(fields).setTimestamp().setFooter("Bot made by the Shenanigan team", "https://media.discordapp.net/attachments/708186850359246859/760681364163919994/1601430947224.png");
}

function createMessageAttachmentFromUri(uri) {
  var canvas = Canvas.default.createCanvas(700, 250);
  return Qrcode.toCanvas(canvas, uri).then(function (param) {
              return Promise.resolve(new DiscordJs.MessageAttachment(canvas.toBuffer(), "qrcode.png", undefined));
            });
}

function getRolebyRoleId(guildRoleManager, roleId) {
  var guildRole = guildRoleManager.cache.get(roleId);
  if (!(guildRole == null)) {
    return guildRole;
  }
  throw {
        RE_EXN_ID: VerifyHandlerError,
        _1: "Could not find a role with the id " + roleId,
        Error: new Error()
      };
}

function makeVerifyActionRow(verifyUrl) {
  var roleButton = new DiscordJs.MessageButton().setLabel("Open QRCode in the BrightID app").setStyle("LINK").setURL(verifyUrl);
  var mobileButton = new DiscordJs.MessageButton().setCustomId("verify").setLabel("Click here after scanning QR Code in the BrightID app").setStyle("PRIMARY");
  return new DiscordJs.MessageActionRow().addComponents([
              mobileButton,
              roleButton
            ]);
}

function handleUnverifiedGuildMember(errorNum, interaction, uuid) {
  var deepLink = "" + Endpoints.brightIdAppDeeplink + "/" + uuid + "";
  var verifyUrl = "" + Endpoints.brightIdLinkVerificationEndpoint + "/" + uuid + "";
  switch (errorNum) {
    case 2 :
        return createMessageAttachmentFromUri(deepLink).then(function (attachment) {
                    var embed = makeEmbed(verifyUrl);
                    var row = makeVerifyActionRow(verifyUrl);
                    var options = {
                      embeds: [embed],
                      files: [attachment],
                      ephemeral: true,
                      components: [row]
                    };
                    return interaction.editReply(options).then(function (param) {
                                return Promise.resolve(undefined);
                              });
                  });
    case 3 :
        var options = {
          content: "I haven't seen you at a Bright ID Connection Party yet, so your brightid is not verified. You can join a party in any timezone at https://meet.brightid.org",
          ephemeral: true
        };
        return interaction.editReply(options).then(function (param) {
                    return Promise.resolve(undefined);
                  });
    case 4 :
        return createMessageAttachmentFromUri(deepLink).then(function (attachment) {
                    var embed = makeEmbed(verifyUrl);
                    var row = makeVerifyActionRow(verifyUrl);
                    var options = {
                      embeds: [embed],
                      files: [attachment],
                      ephemeral: true,
                      components: [row]
                    };
                    return interaction.editReply(options).then(function (param) {
                                var options = {
                                  content: "Whoops! You haven't received a sponsor. There are plenty of apps with free sponsors, such as the [EIDI Faucet](https://idchain.one/begin/). \n\n See all the apps available at https://apps.brightid.org \n\n Then scan the QR code above in the BrightID mobile app.",
                                  ephemeral: true
                                };
                                return interaction.followUp(options).then(function (param) {
                                            return Promise.resolve(undefined);
                                          });
                              });
                  });
    default:
      var options$1 = {
        content: "Something unexpected happened. Please try again later.",
        ephemeral: true
      };
      return interaction.editReply(options$1).then(function (param) {
                  return Promise.resolve(undefined);
                });
  }
}

function execute(interaction) {
  var guild = interaction.guild;
  var member = interaction.member;
  var guildRoleManager = guild.roles;
  var memberId = member.id;
  var uuid = Uuid.v5(memberId, config$1.uuidNamespace);
  return interaction.deferReply({
                ephemeral: true
              }).then(function (param) {
              var config$2 = Gist$Utils.makeGistConfig(config$1.gistId, "guildData.json", config$1.githubAccessToken);
              return $$Promise.$$catch(Gist$Utils.ReadGist.content(config$2, Decode.Gist.brightIdGuilds).then(function (guilds) {
                              var guildId = guild.id;
                              var guildData = Js_dict.get(guilds, guildId);
                              if (guildData !== undefined) {
                                var roleId = Belt_Option.getExn(Caml_option.valFromOption(guildData).roleId);
                                var guildRole = getRolebyRoleId(guildRoleManager, roleId);
                                return fetchVerification(uuid).then(function (contextId) {
                                            if (contextId.unique) {
                                              return addRoleToMember(guildRole, member).then(function (param) {
                                                          var options = {
                                                            content: "Hey, I recognize you! I just gave you the \`" + guildRole.name + "\` role. You are now BrightID verified in " + guild.name + " server!",
                                                            ephemeral: true
                                                          };
                                                          return interaction.editReply(options).then(function (param) {
                                                                      return Promise.resolve(undefined);
                                                                    });
                                                        });
                                            }
                                            var options = {
                                              content: "Hey, I recognize you, but your account seems to be linked to a sybil attack. You are not properly BrightID verified. If this is a mistake, contact one of the support channels",
                                              ephemeral: true
                                            };
                                            return interaction.editReply(options).then(function (param) {
                                                        return Promise.resolve(undefined);
                                                      });
                                          });
                              }
                              var options = {
                                content: "Hi, sorry about that. I couldn't retrieve the data for this server from BrightId"
                              };
                              return interaction.editReply(options).then(function (param) {
                                          return Promise.reject({
                                                      RE_EXN_ID: VerifyHandlerError,
                                                      _1: "Guild Id " + guildId + " could not be found in the gist"
                                                    });
                                        });
                            }), (function (e) {
                            if (e.RE_EXN_ID === BrightIdError) {
                              var match = e._1;
                              var errorMessage = match.errorMessage;
                              return handleUnverifiedGuildMember(match.errorNum, interaction, uuid).then(function (param) {
                                          return Promise.resolve((console.error("" + member.displayName + ": " + errorMessage + ""), undefined));
                                        });
                            }
                            if (e.RE_EXN_ID === VerifyHandlerError) {
                              return Promise.resolve((console.error(e._1), undefined));
                            }
                            if (e.RE_EXN_ID === Json_Decode$JsonCombinators.DecodeError) {
                              return Promise.resolve((console.error(e._1), undefined));
                            }
                            if (e.RE_EXN_ID !== $$Promise.JsError) {
                              return Promise.resolve((console.error("Verify Handler: Unknown error"), undefined));
                            }
                            var msg = e._1.message;
                            if (msg !== undefined) {
                              return Promise.resolve((console.error(msg), undefined));
                            } else {
                              return Promise.resolve((console.error("Verify Handler: Unknown error"), undefined));
                            }
                          }));
            });
}

var data = new Builders.SlashCommandBuilder().setName("verify").setDescription("Sends a BrightID QR code for users to connect with their BrightId");

var brightIdVerificationEndpoint = Endpoints.brightIdVerificationEndpoint;

var brightIdAppDeeplink = Endpoints.brightIdAppDeeplink;

var brightIdLinkVerificationEndpoint = Endpoints.brightIdLinkVerificationEndpoint;

var context = Constants.context;

export {
  brightIdVerificationEndpoint ,
  brightIdAppDeeplink ,
  brightIdLinkVerificationEndpoint ,
  context ,
  VerifyHandlerError ,
  BrightIdError ,
  Canvas$1 as Canvas,
  QRCode ,
  config$1 as config,
  addRoleToMember ,
  fetchVerification ,
  makeEmbed ,
  createMessageAttachmentFromUri ,
  getRolebyRoleId ,
  makeVerifyActionRow ,
  handleUnverifiedGuildMember ,
  execute ,
  data ,
}
/*  Not a pure module */

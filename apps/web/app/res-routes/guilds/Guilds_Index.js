// Generated by ReScript, PLEASE EDIT WITH CARE

import * as React from "react";
import * as Remix from "remix";
import * as Js_dict from "../../../../../node_modules/rescript/lib/es6/js_dict.js";
import * as $$Promise from "../../../../../node_modules/@ryyppy/rescript-promise/src/Promise.js";
import * as AuthServer from "../../AuthServer.js";
import * as Belt_Option from "../../../../../node_modules/rescript/lib/es6/belt_Option.js";
import * as DiscordServer from "../../DiscordServer.js";
import * as SidebarToggle from "../../components/SidebarToggle.js";
import * as ReactHotToast from "react-hot-toast";
import ReactHotToast$1 from "react-hot-toast";

function loader(param) {
  var guildId = Belt_Option.getExn(Js_dict.get(param.params, "guildId"));
  return $$Promise.$$catch(AuthServer.authenticator.isAuthenticated(param.request).then(function (user) {
                  if (user == null) {
                    return Promise.resolve({
                                guild: null,
                                isAdmin: false
                              });
                  } else {
                    return DiscordServer.fetchGuildFromId(guildId).then(function (guild) {
                                var userId = user.profile.id;
                                return DiscordServer.fetchGuildMemberFromId(guildId, userId).then(function (guildMember) {
                                            var memberRoles = (guildMember == null) ? [] : guildMember.roles;
                                            return DiscordServer.fetchGuildRoles(guildId).then(function (guildRoles) {
                                                        var isAdmin = DiscordServer.memberIsAdmin(guildRoles, memberRoles);
                                                        var isOwner = (guild == null) ? false : guild.owner_id === userId;
                                                        return Promise.resolve({
                                                                    guild: guild,
                                                                    isAdmin: isAdmin || isOwner
                                                                  });
                                                      });
                                          });
                              });
                  }
                }), (function (error) {
                return Promise.resolve({
                            guild: null,
                            isAdmin: false
                          });
              }));
}

function $$default(param) {
  var context = Remix.useOutletContext();
  var match = Remix.useLoaderData();
  var guild = match.guild;
  var icon = function (param) {
    var icon$1 = param.icon;
    if (icon$1 !== undefined) {
      return "https://cdn.discordapp.com/icons/" + param.id + "/" + icon$1 + ".png";
    } else {
      return "/assets/brightid_logo_white.png";
    }
  };
  var guildDisplay = (guild == null) ? React.createElement("div", undefined, "That Discord Server does not exist") : React.createElement("div", {
          className: "flex flex-col"
        }, React.createElement("div", {
              className: "flex gap-2"
            }, React.createElement("img", {
                  className: "rounded-full h-10",
                  src: icon(guild)
                }), React.createElement("p", {
                  className: "text-3xl font-bold text-white"
                }, guild.name)), React.createElement("div", {
              className: "flex-row"
            }, React.createElement("div", undefined, "Verified Users"), React.createElement("div", undefined, "Sponsored Users")));
  if (context.rateLimited) {
    ReactHotToast$1.error("The bot is being rate limited. Please try again later");
  }
  return React.createElement("div", {
              className: "p-4"
            }, React.createElement(ReactHotToast.Toaster, {}), React.createElement("div", {
                  className: "flex"
                }, React.createElement(SidebarToggle.make, {
                      handleToggleSidebar: context.handleToggleSidebar
                    }), guildDisplay, match.isAdmin ? React.createElement("div", undefined, "You are an admin") : React.createElement(React.Fragment, undefined)));
}

export {
  loader ,
  $$default ,
  $$default as default,
}
/* react Not a pure module */

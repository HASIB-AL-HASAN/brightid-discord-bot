type loaderData = {
  user: Js.Nullable.t<RemixAuth.User.t>,
  guilds: array<Types.oauthGuild>,
  rateLimited: bool,
}

let loader: Remix.loaderFunction<loaderData> = ({request}) => {
  open DiscordServer
  open Promise

  AuthServer.authenticator
  ->RemixAuth.Authenticator.isAuthenticated(request)
  ->then(user => {
    switch user->Js.Nullable.toOption {
    | None => {user: Js.Nullable.null, guilds: [], rateLimited: false}->resolve
    | Some(user) =>
      user
      ->fetchUserGuilds
      ->then(userGuilds => {
        fetchBotGuilds()->then(botGuilds => {
          let guilds =
            userGuilds->Js.Array2.filter(userGuild =>
              botGuilds->Js.Array2.findIndex(botGuild => botGuild.id === userGuild.id) !== -1
            )
          {user: Js.Nullable.null, guilds: guilds, rateLimited: false}->resolve
        })
      })
    }
  })
  ->catch(error => {
    switch error {
    | DiscordRateLimited => {user: Js.Nullable.null, guilds: [], rateLimited: true}->resolve
    | _ => {user: Js.Nullable.null, guilds: [], rateLimited: false}->resolve
    }
  })
}

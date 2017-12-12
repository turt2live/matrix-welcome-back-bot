# matrix-welcome-back-bot

[![TravisCI badge](https://travis-ci.org/turt2live/matrix-welcome-back-bot.svg?branch=master)](https://travis-ci.org/turt2live/matrix-welcome-back-bot)

A silly bot that welcomes users back after they've been inactive for a little while. Talk about it in [#welcomeback:t2bot.io](https://matrix.to/#/#welcomeback:t2bot.io).

# Usage

1. Invite `@welcomeback:t2bot.io` to a room
2. Set your desired time limit: `!wb 3` for 3 minutes
3. Keep everyone talking!

# Building your own

1. Clone this repository
2. `npm install`
3. Copy `config/default.yaml` to `config/production.yaml`
4. Edit the values of `config/production.yaml` to match your needs
5. Run the bot with `NODE_ENV=production node index.js`

# matrix-welcome-back-bot

[![TravisCI badge](https://travis-ci.org/turt2live/matrix-topic-bot.svg?branch=master)](https://travis-ci.org/turt2live/matrix-welcome-back-bot)
[![Targeted for next release](https://badge.waffle.io/turt2live/matrix-welcome-back-bot.png?label=sorted&title=Targeted+for+next+release)](https://waffle.io/turt2live/waffle-matrix?utm_source=badge)
[![WIP](https://badge.waffle.io/turt2live/matrix-welcome-back-bot.png?label=wip&title=WIP)](https://waffle.io/turt2live/waffle-matrix?utm_source=badge)

A silly bot that welcomes users back after they've been inactive for a little while

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

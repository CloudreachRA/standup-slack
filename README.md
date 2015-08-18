# Standup for Slack [![Build Status](https://travis-ci.org/alexfu/standup-slack.svg?branch=master)](https://travis-ci.org/alexfu/standup-slack)[![Coverage Status](https://coveralls.io/repos/alexfu/standup-slack/badge.svg?branch=master)](https://coveralls.io/r/alexfu/standup-slack?branch=master)
Slack message formatter for daily standup messages. We, at [Everseat](http://www.everseat.com), use [Slack](https://slack.com) to record and share our daily standups. Here's what a typical standup feed looks like:

![](http://i.imgur.com/aW8wQSp.png)

Different formats, different styles. Standup for Slack is meant to not only make it easier to post these kinds of messages but to make them consistent.

Simply enter your standup message like so:

`/standup Yesterday: Did some stuff, Today: Chillax, Blockers: None`

Or using standard JSON format:

![](http://i.imgur.com/BZLxdS3.png)

And it will be automatically formatted into something like:

![](http://i.imgur.com/71KRNuz.png)

Additionally, non-standard JSON is allowed through the [jsonic](https://www.npmjs.com/package/jsonic) library.

# Usage
Since the app requires user authorization, you must authorize the app before using it. Do this by running the `/standup` Slack command without arguments. Slack will reply with a URL that you can visit in order to authorize the app.

# Error Handling

If you, by accident, send a standup message that isn't valid JSON, you'll get a response from Slackbot that looks like:

![](http://i.imgur.com/6fH3jFw.png)

You'll want to visit that URL to diagnose the invalid message. If you're wondering about the URL after the `#` sign, don't worry. That URL is only temporary and will **_expire as soon as it's accessed_**.

# Requirements
 - **Heroku**: This project was made to run on Heroku, although if you do not like Heroku, it shouldn't be too hard to run it elsewhere.
 - **Postgres**: Postgres is used to store user IDs and user access tokens. This is so the app can post messages as the authenticated user.

# Getting Started
Once you've cloned this project, you'll want to [create a new Heroku instance](https://devcenter.heroku.com/articles/creating-apps#creating-a-named-app) and [provision a Postgres database](https://addons.heroku.com/heroku-postgresql).

Push the code to your new Heroku app: `git push heroku master`.

Login into the database with `heroku pg:psql` and run `CREATE TABLE users (id text not null, token text not null);`.

Then, you'll want to [create a Slack app](https://api.slack.com/applications) of your own. Use the following when creating a new Slack app:

 - **URL**: Heroku app URL (https://example-heroku-app.com).
 - **Redirect URI(s)**: Heroku app URL with `/auth` at the end (https://example-heroku-app.com/auth)

Once you've created the app, you'll need to set some env variables on the Heroku instance...

```
heroku config:set CLIENT_ID=xxxxxxxxxx.xxxxxxxxxx
heroku config:set CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
heroku config:set REDIRECT_URI=https://example-heroku-app.com/auth
```

Finally, to tie it all together, [create a new Slack slash command](https://your-org.slack.com/services/new/slash-commands) with the following...

- **Command**: /standup (or whatever you like)
- **URL**: Heroku app URL (https://example-heroku-app.com).
- **Method**: POST

# Trailbot Vault <sup><sub><sup><sub>DEVELOPER PREVIEW</sub></sup></sub></sup>

Trailbot tracks changes in your servers' files and logs and triggers smart policies.

Smart policies are simple scripts that receive notifications every time a watched file changes. They trigger actions such as emailing someone, rolling files back or even shutting the system down.

Trailbot has three components:
+ [__Watcher__](https://github.com/stampery/trailbot-watcher): server demon that monitors your files and logs, registers file events and enforces the policies.
+ [__Vault__](https://github.com/stampery/trailbot-vault): backend that works as a relay for the watcher's settings and the file changes.
+ [__Client__](https://github.com/stampery/trailbot-client): desktop app for managing watchers, defining policies and reading file events.

# About the Vault

Trailbot Vault is nothing more than a [__Horizon__](https://github.com/rethinkdb/horizon) installation with a particular set of permissions in its schema.

It has two main purposes:
+ Serving the static assets for the [__Trailbot Client__](https://github.com/stampery/trailbot-client) Electron app.
+ Storing and serving [__Trailbot Watcher__](https://github.com/stampery/trailbot-watcher) configuration and file events.

# Default Vault

We run a public instance of the Vault at `vault.trailbot.io`, which you are completely free to use without any limitation.

We are great defenders of technological sovereignty, so we encourage you to run your own instance of the Vault.

# Installing your own Vault
Before installing the Vault, you must install the RethinkDB server. Consult [Installing RethinkDB](http://rethinkdb.com/docs/install/) for downloads and installation instructions.

Once you have installed RethinkDB, simply do:
```
git clone https://github.com/stampery/trailbot-vault
cd trailbot-vault
sudo npm install -g
sudo npm run setup
```
Now the `trailbot-vault` service should be running and you will be able to connect to `http://yourserverdomain.tld:8181` as long as your firewall configuration allows inbound traffic in the `8181` port.

# Encryption

Trailbot uses end-to-end encryption for preserving your privacy and avoid any disclosure of sensitive information.

Not even us can know anything about your files and logs nor read your file events and settings. Pretty cool, huh?

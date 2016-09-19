[<img style="width:100%;" src="https://raw.githubusercontent.com/trailbot/vault/master/dist/img/banner.png">](https://trailbot.io)

# [Trailbot](https://trailbot.io) Vault <sup><sub><sup><sub>DEVELOPER PREVIEW</sub></sup></sub></sup>

[![Build Status](https://travis-ci.org/trailbot/vault.svg?branch=master)](https://travis-ci.org/trailbot/vault)

__Trailbot tracks files and logs in your servers__, triggers [__Smart Policies__](https://github.com/trailbot/client/wiki/Smart-Policies) upon __tampering__ and generates an __immutable audit trail__ of everything happening to them.

[Smart Policies](https://github.com/trailbot/client/wiki/Smart-Policies) are simple scripts that get called every time a tracked file changes. They trigger actions such as emailing someone, rolling files back or even shutting the system down. There are [plenty of them ready to use](https://github.com/trailbot/client/wiki/Smart-Policies#ready-to-use-policies), and you can even [create your own](https://github.com/trailbot/client/wiki/Smart-Policies).

Trailbot has three components:
+ [__Watcher__](https://github.com/trailbot/watcher): a server daemon that monitors your files and logs, registers file events and enforces [smart policies](https://github.com/trailbot/client/wiki/Smart-Policies).
+ [__Client__](https://github.com/trailbot/client): desktop app for managing watchers, defining policies and reading file events.
+ [__Vault__](https://github.com/trailbot/vault): (this repository) a backend that works as a relay for the watcher's settings and the server events.

# Why Trailbot?

Current security solutions are based on an obsolete paradigm: building walls and fences. Companies advertise their overcomplicated perimeter security systems as if they were impenetrable. But even so, we hear everyday about __cyber security breaches__ at even the largest corporations.

Moreover, they will not protect you at all from internal breaches and __insider threats__. Furthermore, most data resides nowadays in the cloud, where walls, border and fences fade and blur.

With Trailbot, you can rest assured of the __integrity of your data__, being it a system log or any other important file. It doesn't matter if an outsider got access to your systems or an insider decided to go rogue—__you are now in control__.

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
Now the `trailbot-vault` service should be running and you will be able to connect to `https://yourserverdomain.tld:8443` as long as your firewall configuration allows inbound traffic in the `8443` port.


# Get Involved

We'd love for you to help us build Trailbot. If you'd like to be a contributor, check out our [Contributing guide](https://github.com/trailbot/client/blob/master/CONTRIBUTING.md).

# FAQ

Check out our [FAQ at the wiki](https://github.com/trailbot/client/wiki/FAQ).

[<img style="width:100%;" src="https://raw.githubusercontent.com/trailbot/vault/master/dist/img/footer.png">](https://stampery.com)

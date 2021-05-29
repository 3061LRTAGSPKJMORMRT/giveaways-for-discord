# **Giveaways For Discord**

## Simple use

Giveaways For Discord is quite simple to use actually. All the things you need are:

- `message` - The Message Object from Discord
- `client` - The Client iniatied from Discord
- `time` - The time for the giveaway to last. Must be above 1 minute and below 2 weeks
- `prize` - The prize for the giveaway
- `winners` (optional) - The amount of winners for the giveaway (Default is set to 1)
- `channel` (optional) - Where the giveaway message should appear (Default is set to where the command is ran)
- `host` (optinal) - The Host who will be appeared in the embed of the Giveaway (Default host is the Message Author)
- `color` (optional) - The Color of the embed showing the giveaway (Default is set to `#008800`)

### Installation
```npm install giveaways-for-discord```
This installs the package

### Example Code
```js
    const Discord = require("discord.js");
    const client = new Discord.Client({ws: ["GUILDS", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGES"]});
    const giveaway = require("giveaways-for-discord");
    const prefix = "g!";
    const token = "SOME_TOKEN_HERE";

    client.on("ready" () => {
        console.log("Logged in!");
    })

    client.on("message", async message => {

        if (!message.content.startsWith(prefix) && message.author.bot) return;

        if (message.content.startWith(`${prefix}start`)) {

            giveaway(message, client, args[0], args.join(" ").replace(args[0], ""))

        }

    })
    
client.login(token)
```

Using a command handler? No problem!

```js
const giveaway = require("giveaways-for-discord")

module.exports = {
    name: "start",
    async execute(message, args, client) {
        giveaway(message, client, args[0], args.join(" ").replace(args[0], ""))
    }
}
```

### The Output:
<img src="https://cdn.discordapp.com/attachments/842065905529651201/848199980580995082/unknown.png" alt="Well the image couldn't load, rip">

### Feedback and Bugs
Want to suggest a feedback, or report a bug? You can do that by going to out [support server](https://discord.gg/DcC4xFfTnB)

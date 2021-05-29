const Discord = require("discord.js")
const db = require("quick.db")
const parsems = require("parse-ms")
const ms = require("ms")


/**
    * @param {Discord.Message} message The Message Sent by the User.
    * @param {Discord.Client} client The Discord Client.
    * @param {time} time The Time needed for the Giveaway
    * @param {prize} prize The Prize for the Giveaway.
    * @param {winners} winners The total winners for thie Giveaway. If none is provided, winners will be set to 1.
    * @param {channel} channel The channel for the giveaway message to be sent in. If none is provided, it will send in the current channel
    * @param {hostedby} hostedby The Host for the Giveaway. If none is provided, Host will be set as the Message Author
    * @param {color} color Embed color for the Giveaway. If none is provided, a default will be set.
    * @returns Giveaway
    * @async
    * @example
    *  const Discord = require("discord.js");
    *  const client = new Discord.Client();
    *  const giveaway = require("giveaways-for-discord");
    * 
    *  const prefix = "g!";
    * 
    *
    *  client.on("message", async message => {*       
    *       if (message.content.startsWith(prefix) && !message.author.bot) {
    *           
    *           // start a giveaway
    *           if (message.content.startsWith(`${prefix}start`)) {
    *               giveaway(message, client, "1d", "100 Gems")
    *           }
    *           if (message.content.startsWith(`${prefix}reroll`)) {
    *               
    *           }
    * 
    *     }
    * });
       */

module.exports = async (message, client, timer, prize, winners, channel, hostedby, color) => {

    if (!message) throw new Error("[INSUFFICIENT_DETAILS]: The Message Object was not provided!")
    if (!message.id) throw new TypeError(`[INVALID_MESSAGE_OBJECT]: The Message Object given was invalid!`)
    if (!message.channel || !message.channel.id) throw new TypeError(`[INVALID_MESSAGE_OBJECT]: The Message Object given was invalid!`)
    if (!client.user.id || !client.user || !client.guilds) throw new TypeError(`[INVALID_CLIENT_OBJECT]: The Discord Client Object given was invalid!`)
    if (!client) throw new Error("[INSUFFICIENT_DETAILS]: The Client was not provided!")
    if (!timer) throw new Error("[INSUFFICIENT_DETAILS]: Time was not provided!")
    if (!prize) throw new Error("[INSUFFICIENT_DETAILS]: Prize was not provided!")
    if (!hostedby) hostedby = message.author
    if (!winners) winners = 1
    if (!color) color = "#008800"
    if (!channel) channel = message.channel
    if (!message.guild.me) throw new Error("I could not find myself in the guild! If this error persists, join the support server!")

    if (!message.guild) throw new Error("Giveaways can't happen in DMs!")
    if (!message.guild.me.permissions.has(["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "EMBED_LINKS", "ATTACH_FILES"])) throw new Error("[Missing Permissions]: Required: [\"SEND_MESSAGES\", \"VIEW_CHANNEL\", \"READ_MESSAGE_HISTORY\", \"EMBED_LINKS\", \"ATTACH_FILES\"]")
    if (!channel.permissionsFor(message.guild.me).has(["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "ADD_REACTIONS", "EMBED_LINKS", "ATTACH_FILES"])) throw new Error("[Missing Permissions]: Required: [\"SEND_MESSAGES\", \"VIEW_CHANNEL\", \"READ_MESSAGE_HISTORY\", \"EMBED_LINKS\", \"ATTACH_FILES\"]")

    let allthetime = ms(timer)
    if (!allthetime) throw new TypeError(`[INVALID_TIME_FORMAT]: The time format given was invalid`)
    if (allthetime < 60000) throw new RangeError(`[INVALID_TIME_RANGE]: Minimum time required is 1 minute!`)
    if (allthetime > 1209600000) throw new RangeError(`[INVALID_TIME_RANGE]: Maximum time allowed is 2 weeks!`)
    let timecontent = ""
    let timcontent = parsems(allthetime)
    let days = ""
    let hour = ""
    let mins = ""
    let secs = ""
    let totalcounter = 0
    let timemsgcontent = []

    if (timcontent.days > 0) days = `${timcontent.days} hour${timcontent.days > 1 ? "s" : ""}`
    if (timcontent.hours > 0) hour = `${timcontent.hours} day${timcontent.hours > 1 ? "s" : ""}`
    if (timcontent.minutes > 0) mins = `${timcontent.minutes} min${timcontent.minutes > 1 ? "s" : ""}`
    if (timcontent.seconds > 0) secs = `${timcontent.seconds} sec${timcontent.seconds > 1 ? "s" : ""}`

    let alltime = [days, hour, mins, secs]
    alltime.forEach(e => {
        if (e.length > 0) {
            totalcounter++
            timemsgcontent.push(e)
        }
    })

    if (totalcounter == 1) {
        timecontent = `${timemsgcontent[0]}`
    } else if (totalcounter == 2) {
        timecontent = `${timemsgcontent[0]} and ${timemsgcontent[1]}`
    } else if (totalcounter == 3) {
        timecontent = `${timemsgcontent[0]}, ${timemsgcontent[1]} and ${timemsgcontent[2]}`
    } else if (totalcounter == 4) {
        timecontent = `${timemsgcontent[0]}, ${timemsgcontent[1]}, ${timemsgcontent[2]} and ${timemsgcontent[3]}`
    }

    let embed = new Discord.MessageEmbed()
        .setTitle(prize)
        .setDescription(`**:tada: GIVEAWAY STARTED :tada:**\n\nReact with :tada: to join!\n\nWinners: ${winners}\nTime: **${timecontent}**\nHosted By: ${hostedby}`)
        .setColor(color)
        .setFooter("Ends at")
        .setTimestamp(Date.now() + allthetime)
    let a = await channel.send(
        { embed: embed }
    )

    await a.react("🎉")

    db.set(`giveawayid-${a.id}_${message.guild.id}`, {
        giveawayid: a.id,
        winners: winners,
        endsAt: Date.now() + allthetime,
        timecontent: timecontent,
        channel: channel.id,
        guild: message.guild.id,
        running: true
    })

    let giveaway = db.all().filter(data => data.ID === `giveawayid-${a.id}_${message.guild.id}`)[0]

            let b = setInterval(async () => {
            let guild = client.guilds.cache.get(db.get(`${giveaway.ID}.guild`))
            if (guild.id) {
                let channel = await client.channels.fetch(db.get(`${giveaway.ID}.channel`)).catch(e => e)
                if (channel.id) {
                    let msg = await channel.messages.fetch(db.get(`${giveaway.ID}.giveawayid`)).catch(e => e)
                    let em = new Discord.MessageEmbed()
                    .setTitle(msg.embeds[0].title)
                    .setColor(msg.embeds[0].color)
                    .setFooter("Ends at")
                    .setTimestamp(db.get(`${giveaway.ID}.endsAt`))

                    let toTime = parsems(db.get(`${giveaway.ID}.endsAt`) - Date.now())
                    console.log(toTime)
                    let d = ""
                    let h = ""
                    let m = ""
                    let s = ""
                    if (toTime.days > 0) d = `${toTime.days} hour${toTime.days > 1 ? "s" : ""}`
                    if (toTime.hours > 0) h = `${toTime.hours} day${toTime.hours > 1 ? "s" : ""}`
                    if (toTime.minutes > 0) m = `${toTime.minutes} min${toTime.minutes > 1 ? "s" : ""}`
                    if (toTime.seconds > 0) s = `${toTime.seconds} sec${toTime.seconds > 1 ? "s" : ""}`

                    let alltimes = [d, h, m, s]

                    let counter = 0
                    let content = []
                    let allcontent = ""

                    alltimes.forEach(e => {
                        if (e.length > 0) {
                            counter++
                            content.push(e)
                        }
                    })

                    if (counter == 1) {
                        allcontent = `${content[0]}`
                    } else if (counter == 2) {
                        allcontent = `${content[0]} and ${content[1]}`
                    } else if (counter == 3) {
                        allcontent = `${content[0]}, ${content[1]} and ${content[2]}`
                    } else if (counter == 4) {
                        allcontent = `${content[0]}, ${content[1]}, ${content[2]} and ${content[3]}`
                    }

                    em.setDescription(msg.embeds[0].description.replace(`Time: **${db.get(`${giveaway.ID}.timecontent`)}**`, `Time: **${allcontent}**`))

                    msg.edit(
                        {
                            embed: em
                        }
                    )
                }
            }
            
        }, 60000) 


    setTimeout(async () => {
	    clearInterval(b)
        if (db.get(`${giveaway.ID}.running`) != false) {
            db.set(`${giveaway.ID}.running`, false)
            let channel = db.get(`${giveaway.ID}.channel`)
            let guild = client.guilds.cache.get(`${db.get(`${giveaway.ID}.guild`)}`)
            channel = await client.channels.fetch(channel).catch(e => e)
            if (channel.id) {
                let mid = db.get(`${giveaway.ID}.giveawayid`)
                if (mid) {
                    let msg = await channel.messages.fetch(mid).catch(e => e)
                    if (msg.id) {
                        let reactions = msg.reactions.resolve("🎉")
                        if (reactions) {
                            let allreact = []
                            let members = await reactions.users.fetch()
                            if (members) {
                                members.forEach(mem => {
                                    if (mem.id != msg.client.user.id) {
                                        allreact.push(mem.id)
                                    }
                                })
                            }
                            let winners = db.get(`${giveaway.ID}.winners`)
                            let allwinners = []
                            for (let b = 0; b < winners; b++) {
                                if (allreact.length == 0) {
                                    b = winners + 1
                                } else {
                                    let winner = allreact.splice(Math.floor(Math.random() * allreact.length), 1)
                                    allwinners.push(winner[0])
                                    reactions.users.remove(winner[0])
                                }
                            }
                            if (allwinners.length == 0) {
                                channel.send(`I could not find any valid entries for the giveaway at: https://discordapp.com/channels/${channel.guild.id}/${channel.id}/${mid}`).catch(e => console.log(e.message))
                                let em = new Discord.MessageEmbed()
                                    .setColor("#0000FF")
                                    .setTitle(msg.embeds[0].title)
                                    .setDescription(":tada: **__GIVEAWAY ENDED__** :tada:\n\nThere were no eligible winners found!\n\nTotal winners: " + db.get(`${giveaway.ID}.winners`))
                                    .setFooter(`Ended at`)
                                    .setTimestamp()
                                msg.edit(
                                    {embed: em}
                                ).catch(e => console.log(e.message))
                            } else {
                                channel.send(`Congratulations <@${allwinners.join(">, <@")}>! You won: **${msg.embeds[0].title}**\nhttps://discordapp.com/channels/${channel.guild.id}/${channel.id}/${mid}`, { disableMentions: "everyone" }).catch(e => console.log(e.message))
                                let em = new Discord.MessageEmbed()
                                    .setColor("#0000FF")
                                    .setTitle(msg.embeds[0].title)
                                    .setDescription(`:tada: **__GIVEAWAY ENDED__** :tada:\n\nWinners:\n - <@${allwinners.join(">\n - <@")}>\n\nTotal winners: ${db.get(`${giveaway.ID}.winners`)}`)
                                    .setFooter(`Ended at`)
                                    .setTimestamp()
                                msg.edit(
                                    {embed: em}        
                                ).catch(e => console.log(e.message))
                            }
                        }
                    } else {
                        channel.send(`There were no reactions found for the giveaway at: https://discordapp.com/channels/${channel.guild.id}/${channel.id}/${mid}`).catch(e => console.log(e.message))
                    }
                }
            }
        }
    }, db.get(`${giveaway.ID}.endsAt`) - Date.now())






}

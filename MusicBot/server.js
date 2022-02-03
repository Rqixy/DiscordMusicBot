
const discord = require("discord.js");
const client = new discord.Client({ disabledEvents: ["TYPING_START"] });
const ytdl = require("ytdl-core");
const queue = new Map();

client.on('message', async message => {
    if (message.content.startsWith("mc")) {
        const data = message.content.split(" ");
        const option = message.content.split(" ")[1];
        const url = message.content.split(" ")[2];
        const serverQueue = queue.get(message.guild.id);
        if (option.includes("play")) {
            execute(message, serverQueue);
            return;
        } else if (option.includes("skip")) {
            skip(message, serverQueue);
            return;
        } else if (option.includes("otoware")) {
            execute(message, serverQueue);
            return;
        } else if (option.includes("stop")) {
            stop(message, serverQueue);
            return;
        } else if (option.includes("loop")) {
            loop(message, serverQueue);
            return;
        } else if (option.includes("q")) {
            queu(message, serverQueue);
            return;
        } else if (option.includes("dis")) {
            dis(message, serverQueue);
            return;
        } else if (option.includes("vol")) {
            onlyo(message, serverQueue);
            return;
        } else if (option.includes("pause")) {
            pause(message);
            return;
        } else if (option.includes("resume")) {
            resume(message);
            return;
        } else if (option.includes("p")) {
            search(message);
            return;
        } else if (option.includes("join")) {
            message.member.voice.channel.join();
        } else {
            message.channel.send("無効なコマンドです");
        }
    }
});

async function addShareChannel(message) {
    const member = message.member;
    const channels = message.mentions.channels;

    if (!member.hasPermission(requireMemberPermissions))
        return message.reply(missingMemberPermissionsMessage);
    if (!message.guild.me.hasPermission(requireBotPermissions))
        return message.reply(missingBotPermissionsMessage);
    if (!channels.size) return message.reply(noChannelMentionMessage);

    const store = await storeAsync.then(value => value.webhooks);

    return Promise.all(channels.map(channel => channel.fetchWebhooks()))
    .then(webhooks =>
        webhooks.map(webhooks => webhooks.map(webhook => webhook.channelID))
    )
    .then(channelIds =>
    channelIds.reduce(
        (previousValue, currentValue) => previousValue.concat(currentValue),
        []
    )
    )
    .then(channelIds =>
        channelIds.filter(channelId =>
            store.some(value => value.channelId !== channelId)
        )
    )
    .then(channelIds =>
        channels.filter(channel => !channelIds.includes(channel.id))
    )
    .then(channels =>
        Promise.all(channels.map(channel => channel.createWebhook("Share Chat")))
    )
    .then(webhooks =>
        Promise.all(
            webhooks.map(webhook =>
                store.push({
                    webhookId: webhook.id,
                    channelId: webhook.channelID
                })
            )
        )
    )
    .then((
            indexNumbers
        ) =>
        message.reply(`${indexNumbers.length}個のチャンネルを共有化しました。`)
    );
}

function pause(message) {
    sounddispatcher.pause();
    message.channel.send("⏸一時停止しました");
}

function resume(message) {
    sounddispatcher.resume();
    message.channel.send("⏯再生しました");
}

var decode = require("decode-html");

function search(message) {
    var arg = message.content.split(" ");
    var Youtube = require("youtube-node");
    var youtube = new Youtube();
    youtube.setKey("AIzaSyDRlO4DxJkoTDXywJcz-rsaj-h1AE8Ea_s");
    if (arg.length == 4) {
        if (arg[3] == "all") {
            youtube.search(arg[2], 10, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                }
                console.log(result);

                var str = "";
                result.items.forEach(function(value) {
                    str =
                    str +
                    value.snippet.title +
                    "-" +
                    value.snippet.channelTitle +
                    "\n\n";
                });
                const embed = {
                    title: "検索結果",
                    description: decode(str),
                    color: 844015
                };
                message.channel.send({ embed });
            });
        } else {
            youtube.search(arg[2], 10, function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                }
                const serverQueue = queue.get(message.guild.id);
                var str =
                "`" +
                result.items[Number(arg[3] - 1)].snippet.title +
                " - " +
                result.items[Number(arg[3] - 1)].snippet.channelTitle +
                "`が見つかりました";

                message.channel.send(decode(str));
                message.content =
                "s!vc play https://youtu.be/" +
                result.items[Number(arg[3] - 1)].id.videoId;
                execute(message, serverQueue);
            });
        }
        } else {
        youtube.search(arg[2], 1, function(error, result) {
            if (error) {
                console.log(error);
                return;
            }
            const serverQueue = queue.get(message.guild.id);
            message.channel.send(
                "`" +
                result.items[0].snippet.title +
                " - " +
                result.items[0].snippet.channelTitle +
                "`が見つかりました"
            );
            message.content = "s!vc play https://youtu.be/" + result.items[0].id.videoId;
            execute(message, serverQueue);
        });
    }
}

var queueContruct;
var onlyoo = 5;
async function execute(message, serverQueue) {
    var args = message.content.split(" ");
    if (message.content == "s!vc otoware") {
        var aaaaaaa = "s!vc play https://www.youtube.com/watch?v=cG-etIdbZaQ&t=1s";
        args = aaaaaaa.split(" ");
    }
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send("ボイスチャンネルに入ってください");
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "ボイスチャンネルの接続と発言の権限を追加してください"
        );
    }
    const songInfo = await ytdl.getInfo(args[2]);
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url
    };
    if (!serverQueue) {
        queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: Number(onlyoo),
            playing: true
        };
        queue.set(message.guild.id, queueContruct);
        queueContruct.songs.push(song);
        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
            return;
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        return message.channel.send("`" + song.title + "`をキューに追加しました");
    }
}

function onlyo(message, serverQueue) {
    onlyoo = keisan.run(message.content.split(" ")[2]);
    if (!isNaN(onlyoo)) {
        sounddispatcher.setVolume(Number.parseFloat(onlyoo) / 100);

        if (onlyoo == "100") {
            message.channel.send("音量を" + Number(onlyoo) + "(デフォルト)にしました");
        } else {
            message.channel.send("音量を" + Number(onlyoo) + "にしました");
        }
    } else {
        message.channel.send("書き方ミスってるよ");
    }
}
async function queu(message, serverQueue) {
    if (!serverQueue) return message.channel.send("音楽が再生されてません");
    if (serverQueue.songs[0]) {
        const queu = await message.channel.send("queue", {
            embed: {
                color: 0x00ff00,
                title: `${message.guild.name}のキュー`,
                description: "__再生中__\n" + `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})`
            }
        });

        queu.edit("_ _", {
            embed: {
                color: 0x00ff00,
                title: `${message.guild.name}のキュー`,
                description: "__再生中__\n" + `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})\n__待機中__\n[${serverQueue.songs[1].title}](${serverQueue.songs[1].url}) `
            }
        });

        queu.edit("_ _", {
            embed: {
                color: 0x00ff00,
                title: `${message.guild.name}のキュー`,
                description: "__再生中__\n" + `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})\n__待機中__\n[${serverQueue.songs[1].title}](${serverQueue.songs[1].url})\n[${serverQueue.songs[2].title}](${serverQueue.songs[2].url})`
            }
        });

        queu.edit("_ _", {
            embed: {
                color: 0x00ff00,
                title: `${message.guild.name}のキュー`,
                description:
                "__再生中__\n" +
                `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})\n__待機中__\n[${serverQueue.songs[1].title}](${serverQueue.songs[1].url})\n[${serverQueue.songs[2].title}](${serverQueue.songs[2].url})\n[${serverQueue.songs[3].title}](${serverQueue.songs[3].url})`
            }
        });
        queu.edit("_ _", {
            embed: {
                color: 0x00ff00,
                title: `${message.guild.name}のキュー`,
                description: "__再生中__\n" + `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})\n__待機中__\n[${serverQueue.songs[1].title}](${serverQueue.songs[1].url})\n[${serverQueue.songs[2].title}](${serverQueue.songs[2].url})\n[${serverQueue.songs[3].title}](${serverQueue.songs[3].url})\n[${serverQueue.songs[4].title}](${serverQueue.songs[4].url})`
            }
        });

        queu.edit("*Queue End*", {
            embed: {
                color: 0x00ff00,
                title: `${message.guild.name}のキュー`,
                description: "__再生中__\n" + `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})\n__待機中__\n[${serverQueue.songs[1].title}](${serverQueue.songs[1].url})\n[${serverQueue.songs[2].title}](${serverQueue.songs[2].url})\n[${serverQueue.songs[3].title}](${serverQueue.songs[3].url})\n[${serverQueue.songs[4].title}](${serverQueue.songs[4].url})\n[${serverQueue.songs[5].title}](${serverQueue.songs[5].url})`
            }
        });
    }
}

function skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send("音楽をスキップするには、音声チャンネルにいる必要があります！");
    if (!serverQueue)
        return message.channel.send("スキップできる曲はありません！");
    serverQueue.connection.dispatcher.end();
}

function dis(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send("切断するには、音声チャンネルにいる必要があります！");
    serverQueue.songs = [];
    message.member.voice.channel.leave();
    message.channel.send("<:yosi:707414812770041938> 退出しました");
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
if (!message.member.voice.channel)
    return message.channel.send("音楽を停止するには、音声チャンネルにいる必要があります！");
serverQueue.songs = [];
serverQueue.connection.dispatcher.end();
}

function loop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send("音声チャンネルにいる必要があります！");
    if (!serverQueue)
        return message.channel.send("音楽が再生されてません");
    serverQueue.loop = !serverQueue.loop;
    return message.channel.send(
        `:repeat: ループを${serverQueue.loop ? `有効` : `無効`}にしました`
    );
}

var sounddispatcher;

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    sounddispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
        if (!serverQueue.loop) serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
    sounddispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send("`" + song.title + "`を再生しています");
};

client.login("ODk0ODE2NDMzODA3MTcxNjA2.YVvgvg.ctnRS4JZi4B8198DxWv_jhmpARA");
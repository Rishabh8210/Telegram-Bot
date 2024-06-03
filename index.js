const API_KEY = require('./constant.js')
const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
const ytdl = require('ytdl-core');
const fs = require('fs');

const bot = new Telegraf(API_KEY.apiKey)
bot.start((ctx) => {
    const user = ctx.from;
    ctx.replyWithHTML(`Welcome <b>${user.first_name}</b>, How can i assist you today?`)
})
bot.command('algorithms', (ctx) => ctx.reply('Choose topic'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on(message('sticker'), (ctx) => ctx.reply('👍'))

bot.command('leave', (ctx) => ctx.reply("Alright, if you have any more questions in the future or need assistance, feel free to return. Have a great day!"))

// Video setup
bot.command('video', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (ytdl.validateURL(url)) {
        ctx.reply('Downloading your video...');
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });

        const outputPath = `downloads/${info.videoDetails.title}.mp4`;
        const writeStream = fs.createWriteStream(outputPath);

        ytdl(url, { format })
            .pipe(writeStream)
            .on('finish', async () => {
                await ctx.replyWithVideo({ source: outputPath }, { caption: 'Here is your requested video, Enjoy !' });
                fs.unlinkSync(outputPath);
            })
            .on('error', async (err) => {
                console.error(err);
                await ctx.reply('An error occurred while downloading the video.');
            });
    } else {
        ctx.reply('Invalid URL. Please send a valid YouTube link.');
    }
});

// Audio setup 
bot.command('audio', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (ytdl.validateURL(url)) {
        ctx.reply('Downloading your audio...');
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        let modifiedInfo = info.videoDetails.title.split(' ');
        modifiedInfo = modifiedInfo.join('_');
        modifiedInfo = modifiedInfo.replaceAll('|', '-');
        console.log(modifiedInfo)
        // modifiedInfo = (modifiedInfo.length > 50) ? modifiedInfo.slice(0,50) : modifiedInfo;
        console.log(modifiedInfo)
        const outputPath = `downloads/${modifiedInfo}.mp3`;
        const writeStream = fs.createWriteStream(outputPath);

        ytdl(url, { format })
            .pipe(writeStream)
            .on('finish', async () => {
                await ctx.replyWithAudio({ source: outputPath }, { caption: 'Here is your requested audio, Enjoy !' });
                fs.unlinkSync(outputPath);
            })
            .on('error', async (err) => {
                console.error(err);
                await ctx.reply('An error occurred while downloading the audio.');
            });
    } else {
        ctx.reply('Invalid URL. Please send a valid YouTube link.');
    }
});

bot.launch()

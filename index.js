const API_KEY = require('./constant.js')
const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')

const ytdl = require('ytdl-core');
const fs = require('fs');
const { exec } = require('child_process');

const bot = new Telegraf(API_KEY.apiKey)
bot.start((ctx) => {
    const user = ctx.from;
    ctx.replyWithHTML(`Welcome <b>${user.first_name}</b>, How can i assist you today?`)
})
bot.command('algorithms', (ctx) => ctx.reply('Choose topic'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on(message('sticker'), (ctx) => ctx.reply('👍'))

bot.command('leave', (ctx) => ctx.reply("Alright, if you have any more questions in the future or need assistance, feel free to return. Have a great day!"))


bot.on('text', async (ctx) => {
    const url = ctx.message.text;
    if (ytdl.validateURL(url)) {
        ctx.reply('Downloading your video...');
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });

        const outputPath = `downloads/${info.videoDetails.title}.mp4`;
        const writeStream = fs.createWriteStream(outputPath);

        ytdl(url, { format })
            .pipe(writeStream)
            .on('finish', async () => {
                await ctx.replyWithVideo({ source: outputPath });
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


bot.launch()

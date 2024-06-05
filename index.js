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
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on(message('sticker'), (ctx) => ctx.reply('👍'))

bot.command('leave', (ctx) => ctx.reply("Alright, if you have any more questions in the future or need assistance, feel free to return. Have a great day!"))

// Algorithms Setup
bot.command('algorithms', (ctx) => ctx.reply('Choose topic'))
// bot.on('text', async(ctx) => {

// })
bot.command('graph', (ctx) => ctx.reply('Tell me which algorithm source code you wanted?'))


// Video setup
bot.command('video', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (ytdl.validateURL(url)) {
        ctx.reply('Downloading your video...');
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'lowestvideo' });
        let modifiedInfo = info.videoDetails.title.split(' ');
        modifiedInfo = modifiedInfo.join('_');
        modifiedInfo = modifiedInfo.replaceAll('|', '-');
        console.log(modifiedInfo)
        // modifiedInfo = (modifiedInfo.length > 50) ? modifiedInfo.slice(0,50) : modifiedInfo;
        console.log(modifiedInfo)
        const outputPath = `downloads/${modifiedInfo}.mp4`;
        const writeStream = fs.createWriteStream(outputPath);

        ytdl(url, { format })
                .pipe(writeStream)
                .on('finish', async () => {
                    try {
                        const stats = fs.statSync(outputPath);
                        const fileSizeInBytes = stats.size;
                        const fileSizeInMegaBytes = fileSizeInBytes / (1024 * 1024);
                        if (fileSizeInMegaBytes > 50) {
                            throw new Error("Unfortunately, the video file exceeds our size limit. Please request a file under 50MB. Thank you!");
                        }
                        await ctx.replyWithVideo({ source: outputPath }, { caption: 'Here is your requested video, Enjoy !' });
                    } catch (err) {
                        console.log("Something went wrong, error : ", err)
                        ctx.reply(err.message);
                    }
                    finally{
                        if (fs.existsSync(outputPath)) {
                            fs.unlinkSync(outputPath);
                        }
                    }
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
    try {
        if (ytdl.validateURL(url)) {
            ctx.reply('Downloading your audio, please wait...');
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
                    try {
                        const stats = fs.statSync(outputPath);
                        const fileSizeInBytes = stats.size;
                        const fileSizeInMegaBytes = fileSizeInBytes / (1024 * 1024);
                        if (fileSizeInMegaBytes > 50) {
                            throw new Error("Unfortunately, the audio file exceeds our size limit. Please request a file under 50MB. Thank you!");
                        }
                        await ctx.replyWithAudio({ source: outputPath }, { caption: 'Here is your requested audio, Enjoy !' });
                    } catch (err) {
                        console.log("Something went wrong, error : ", err)
                        ctx.reply(err.message);
                    }
                    finally{
                        if (fs.existsSync(outputPath)) {
                            fs.unlinkSync(outputPath);
                        }
                    }
                })
                .on('error', async (err) => {
                    console.error(err);
                    await ctx.reply('An error occurred while downloading the audio.');
                });
        } else {
            ctx.reply('Invalid URL. Please send a valid YouTube link.');
        }
    } catch (err) {
        console.log("Something went wrong, error : ", err)
        ctx.reply('Invalid URL. Please send a valid YouTube link.');
    }
});

bot.launch()
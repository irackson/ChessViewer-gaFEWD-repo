const functions = require('firebase-functions');
const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
admin.initializeApp();


exports.addMessage = functions
    .runWith({ memory: '1GB' })
    .https.onRequest(async (req, res) => {
        const pgn = req.query.text;

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });
        const page = await browser.newPage()
        await page.goto('http://www.lutanho.net/pgn/pgn2fen.html', { waitUntil: "networkidle0", timeout: 60000 })
        await page.type('body > form > textarea:nth-child(4)', pgn);
        await page.focus('body > form > input[type=button]:nth-child(6)');
        await page.keyboard.press('Enter');
        const element = await page.$('body > form > textarea:nth-child(8)');
        let value = await page.evaluate(el => el.value, element)
        await page.close();
        await browser.close()

        const writeResult = await admin.firestore().collection('messages').add({ pgn: pgn , fen: value});
        res.json({ result: writeResult.id});
    });
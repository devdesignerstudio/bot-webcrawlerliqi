const puppeteer = require('puppeteer');
const { Telegraf } = require('telegraf');

// const bot = new Telegraf(process.env.BOT_TOKEN)
const bot = new Telegraf(process.env.BOT_TOKEN);
// bot.telegram.sendMessage(process.env.CHAT_ID,'Bem-vindo(a) ao Bot de Alertas - Liqi Exchange!');
bot.telegram.sendMessage(process.env.CHAT_ID,'Bem-vindo(a) ao Bot de Alertas - Liqi Exchange!');
// bot.start((ctx) => ctx.reply())
// bot.help((ctx) => ctx.reply('Comprar agora!'))
// bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.launch()

function arredondar(numero) {
  return (Math.round(numero * 100) / 100).toFixed(2);
}

function calcSpread(ask, bid){
  const bestBuy = parseFloat(ask.replace('R$ ','').replace('.','').replace(',','.'));
  const bestSell = parseFloat(bid.replace('R$ ','').replace('.','').replace(',','.'));
  const result =  bestBuy - bestSell;
  return arredondar(result);
}

   async function webcrawler() {
  const browser = await puppeteer.launch();// slow down by 1000ms
  const page = await browser.newPage();
  const proxy = 'https://cors-anywhere.herokuapp.com/';
  const url = 'https://www.liqi.com.br/exchange';
  await page.goto(url);
  // Pegar último preço do Bitcoin na página da Liqi
  
    const pageContent = await page.evaluate(() => {
     
      //toda essa função será executada no browser
      // setTimeout(console.log("Aguardando o carregamento da página...") ,10000)
      const spanSpread = document.querySelector("#__next > div.styles__Container-sc-18h7krm-0.beooTR > div.styles__Grid-sc-1ymowfn-0.iSncTr > div.styles__Box-sc-1ymowfn-1.iBCcqr > div.styles__Container-sc-ks5aup-0.giHJhQ > div.list__ListsGrid-sc-gt4k6k-0.cmjsPA > span > span > span")
      const spanAsk = document.querySelector("#__next > div.styles__Container-sc-18h7krm-0.beooTR > div.styles__Grid-sc-1ymowfn-0.iSncTr > div.styles__Box-sc-1ymowfn-1.cbiTXp > div.styles__Container-sc-1eazm0o-0.bqplEK > div > div > div:nth-child(1) > form > div.styles__Resume-sc-1eazm0o-16.gkfRZt > ul.styles__ResumeGroup-sc-1eazm0o-17.fIJSGF > li.styles__ResumeItem-sc-1eazm0o-18.fipdGk > div:nth-child(2) > p > span")
      const spanBid = document.querySelector("#__next > div.styles__Container-sc-18h7krm-0.beooTR > div.styles__Grid-sc-1ymowfn-0.iSncTr > div.styles__Box-sc-1ymowfn-1.cbiTXp > div.styles__Container-sc-1eazm0o-0.bqplEK > div > div > div:nth-child(2) > form > div.styles__Resume-sc-1eazm0o-16.gkfRZt > ul.styles__ResumeGroup-sc-1eazm0o-17.fIJSGF > li.styles__ResumeItem-sc-1eazm0o-18.fipdGk > div:nth-child(2) > p > span")
    
      return { 
        spread: spanSpread != null ? spanSpread.innerHTML : '',
        ask: spanAsk != null ? spanAsk.innerHTML : '',
        bid: spanBid != null ? spanBid.innerHTML : '',
      }
    })
    await browser.close();
  return {
    "spread": pageContent.spread ,
    // "Último Negócio": pageContent.lastTrade,
    "ask": pageContent.ask,
    "bid": pageContent.bid,
    // "spread": parseInt(pageContent.ask.replace('R$ ','').replace('.','')) - parseInt(pageContent.bid.replace('R$ ','').replace('.',''))
  }
  
   };
  setInterval( async () => {
    const data = await webcrawler();
    if (data.ask && data.bid){
      console.log(data);
      // bot.hears('spread', (ctx) => ctx.reply(`Spread : ${calcSpread(data.ask,data.bid)}`));
      // bot.hears('ask', (ctx) => ctx.reply(`Melhor Compra: ${data.ask}`) );
      // bot.hears('bid', (ctx) => ctx.reply(`Melhor Venda: ${data.bid}`) );
      // if ( calcSpread(data.ask,data.bid) > 350 )
      bot.telegram.sendMessage(process.env.CHAT_ID,`Spread: R$ ${calcSpread(data.ask,data.bid).replace('.',',')} \nMelhor Compra: ${data.ask} \nMelhor Venda: ${data.bid}`);
      if ( calcSpread(data.ask,data.bid) > 50000 ){
      bot.telegram.sendMessage(process.env.CHAT_ID,`Spread: R$ ${calcSpread(data.ask,data.bid).replace('.',',')} \nMelhor Compra: ${data.ask} \nMelhor Venda: ${data.bid} \nOportunidade Imperdível !!! Acesse agora ${url}`)
      }
      
    }
    
  }, 60000);

const puppeteer =  require("puppeteer");
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    await page.goto("https://web.maktun.com/");

    await page.$eval('input[name=email]', el => el.value = "EMAIL");
    await page.$eval('input[name=password]', el => el.value = "PASSWORD");

    await page.click('input[type="submit"]');
    await page.click('input[type="submit"]');
    await page.click('input[type="submit"]');

    await page.waitForTimeout(1000);

    let sidebarMenus = await page.$$('.menu-item');
    await sidebarMenus[1].click();

    await page.waitForTimeout(1000);

    let showMoneysButton = await page.$$(".show-coins-btn");
    await showMoneysButton[0].click();

    await page.waitForTimeout(10000);

    let arrowRight = await page.$eval("button[aria-label='Go to next page']", (element) => {
        return element.outerHTML
    });

    let i = 1;
    let jsonData = [];
    let indiceArray = 0;
    
    while(!arrowRight.includes("disabled")){

        let inputs = await page.$$("input");

        if(i != 1){

            await inputs[0].type(i.toString());
            await page.keyboard.press('Enter');

        }

        //#region Get data on moneys
        let cards = await page.$$(".note-item-card");

        cards.forEach(async function(card){

            let element = await card.$('.note-text__span');
            let title = await element.evaluate(el => el.textContent, element);
    
            const money = new Object();
            money.name = title;
    
            jsonData[indiceArray] = money;
            indiceArray++;

        });
        //#endregion

        inputs[0].evaluate((domElement) => {
            domElement.value = "";
        });

        arrowRight = await page.$eval("button[aria-label='Go to next page']", (element) => {
            return element.outerHTML
        });

        i++;

    }

    // Write to body.json file
    fs.writeFile('./body.json', JSON.stringify(jsonData), err => {
        if (err) {
            console.error(err);
        }
    });
})();
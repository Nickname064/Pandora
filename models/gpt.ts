import { Page } from 'puppeteer';
import { Model } from './interfaces'

export class ChatGPT3 {

    // TODO: Update scraper

    //The browser page this model runs on
    page : Page

    constructor(page: Page){
        this.page = page
    }
    
    //Initialize the model. Must be done before prompting
    async init(): Promise<void> {
            // Navigate to a webpage

             
            
            //Important : SET A CORRECT USER AGENT TO AVOID DETECTION
            const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36';
            await this.page.setUserAgent(userAgent);

            return Promise.all([
                this.page.goto('https://chatgpt.com'),
                this.page.waitForNavigation()
            ]).then(() => {});

            //Identification is not required anymore
            //await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
            
            /*
            await this.page.waitForSelector('button[data-testid="login-button"]');
            await this.page.click('button[data-testid="login-button"]');
        
        
            const gpt = {
                email : "coted46396@bsomek.com",
                pw : "azertyuiopqsdfghjklm",
                password : "D0k1D0k1"
            }
        
            await this.page.waitForSelector('#email-input');
            await this.page.type('#email-input', gpt.email, { delay: 3 });
        
            await this.page.waitForSelector('button.continue-btn');
            await this.page.click('button.continue-btn');
        
            //Cloudflare verification happens here
            
            await this.page.waitForSelector("input#password");
            await this.page.type("input#password", gpt.pw, { delay: 3 })
        
            await this.page.waitForSelector('button[type="submit"]');
            await this.page.click('button[type="submit"]');
            */

            //Wait for page load
            //await this.page.waitForNavigation();
    };

    //Prompts the model and returns its response
    async prompt(message: string): Promise<string> {
        const text_area_selector = "#prompt-textarea";
        const text_area_xpath = `::-p-xpath(//*[@id="prompt-textarea"])`;

        const prompt_bttn_selector = 'button[data-testid="send-button"]';
        const xpath_bttn = "/html/body/div[1]/div[1]/div[2]/main/div[2]/div[2]/div[1]/div/form/div/div[2]/div/button";
        
        const scroller_xpath = `::-p-xpath(//*[@id="__next"]/div[1]/div[2]/main/div[2]/div[1]/div/div/div/div)`;

        const prompt_placeholder = "WAITING..."

        function wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        //Enter the text, then press the button
        await this.page.locator(text_area_selector).setEnsureElementIsInTheViewport(true).fill(message);
        await this.page.locator(prompt_bttn_selector).setEnsureElementIsInTheViewport(true).setWaitForEnabled(true).click();

        console.log("prompting...")
        //Identify when response is done

        //Wait for the button to be disabled
        await this.page.locator(prompt_bttn_selector).setWaitForStableBoundingBox(true).setWaitForEnabled(false).setEnsureElementIsInTheViewport(true);
        await this.page.locator(text_area_xpath).setEnsureElementIsInTheViewport(true).fill(prompt_placeholder);
        
        //Wait for the button to be reenabled
        await this.page.waitForSelector(prompt_bttn_selector,
        {
                timeout : 60000 //60 seconds max
        }).then(() => wait(2000));
        
        const inputBox = await this.page.$(text_area_selector);
        await inputBox.focus();
        for(let i = 0; i < prompt_placeholder.length; i++){
            await this.page.keyboard.press('Backspace'); // Delete selected text
        }
        
        console.log("End of prompt")

        await this.page.locator(scroller_xpath).scroll({ scrollTop : Infinity })

        //const button = await this.page.waitForSelector(`::-p-xpath(${xpath})`);
        //await button.click();

        //Wait for the submit button to be reenabled
        //await this.page.waitForSelector(prompt_bttn_selector);

        //Then get last answer
        let response = await this.page.evaluate(() => {
            // Get the NodeList of elements with the specified selector
            let elements = document.querySelectorAll('div[data-message-author-role="assistant"]');
            
            // Convert the NodeList to an array and get the last element
            let lastElement = Array.from(elements).pop();

            //Read from JSON Block
            let jsonText = lastElement.getElementsByClassName("!whitespace-pre hljs")[0];

            if(jsonText !== undefined && jsonText !== null){
                return jsonText.textContent;
            }

            // Get the text content of the last element
            return lastElement ? lastElement.textContent : "";
        });

        //Return it
        return response ?? "";
    }

}

import { Page } from "puppeteer";

export class TempMail{

    page : Page
    email : string | undefined

    constructor(page : Page){
        this.page = page;    
    }

    async init() : Promise<void> {

        this.page.goto("https://temp-mail.org/");
        await this.page.waitForNavigation();
        
        const mail_input_selector = "input#mail";
        await this.page.waitForSelector(mail_input_selector);

        this.email = await this.page.evaluate(() => {
            return document.getElementById("mail").textContent;
        })
    }
}
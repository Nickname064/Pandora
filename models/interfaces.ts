import { Page } from "puppeteer";

export interface Model {
    prompt(string) : Object;
}
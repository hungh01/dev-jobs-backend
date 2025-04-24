import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class SearchEngineService {
    async search(keyword: string, location: string) {
        // Launch the browser and open a new blank page
        const browser = await puppeteer.launch({
            headless: false, // đổi false để xem trình duyệt
            // defaultViewport: null,
        });
        const page = await browser.newPage();
        try {
            //crawl TopCV
            const URLTopCV = 'https://www.topcv.vn/';
            const jobTitle = keyword.replace(' ', '-');

            await page.goto(`${URLTopCV}tim-viec-lam-${jobTitle}`, { waitUntil: 'networkidle2' });


            const jobsTopCV = await page.$$eval('.job-list-search-result .job-item-search-result', (jobCards) => {
                console.log(jobCards);
                return jobCards.map((card) => {

                    const img = card.querySelector('img')?.getAttribute('data-src');
                    const url = card.querySelector('a')?.getAttribute('href');
                    const title = card.querySelector('.title')?.textContent?.replace(/\s+/g, ' ').trim();
                    const companyName = card.querySelector('.company-name')?.textContent;
                    const city = card.querySelector('.city-text')?.textContent?.replace(/\s+/g, ' ').trim();
                    const salary = card.querySelector('.title-salary')?.textContent?.replace(/\s+/g, ' ').trim();
                    const exp = card.querySelector('.exp')?.textContent?.replace(/\s+/g, ' ').trim();
                    return { img, title, companyName, city, salary, exp, url };
                })
            }
            );

            //Crawl Vietnamworks
            const URLVietnamworks = 'https://www.vietnamworks.com/';
            await page.goto(`${URLVietnamworks}viec-lam?q=${jobTitle}`, { waitUntil: 'networkidle2' });
            const jobsVietNamWork = await page.$$eval('.block-job-list .view_job_item', (jobCards) => {
                console.log(jobCards);
                return jobCards.map((card) => {
                    const img = card.querySelector('img')?.getAttribute('srcset');
                    const href = card.querySelector('a')?.getAttribute('href');
                    const url = href ? 'https://www.vietnamworks.com/' + href.toString() : null;
                    const title = card.querySelector('.sc-beeQDc')?.textContent?.replace(/\s+/g, ' ').trim();
                    const companyName = card.querySelector('.sc-cdaca-d')?.textContent;
                    const city = card.querySelector('.sc-kzkBiZ')?.textContent?.replace(/\s+/g, ' ').trim();
                    const salary = card.querySelector('.sc-fgSWkL')?.textContent?.replace(/\s+/g, ' ').trim();
                    const exp = ''
                    return { img, title, companyName, city, salary, exp, url };
                })
            }
            );
            const allJobs = [...jobsTopCV, ...jobsVietNamWork].map((job, index) => ({ id: index + 1, ...job }));
            return allJobs;
        }
        catch (error) {
            console.error('Error during web scraping:', error);
            throw new Error('Failed to scrape job data');
        }
        finally {
            await browser.close();
        }


    }
}

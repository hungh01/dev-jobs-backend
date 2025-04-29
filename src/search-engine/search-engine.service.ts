import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { provinces } from './constants/provinces';

@Injectable()
export class SearchEngineService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async getJobs(keyword: string, location: string, page: number, limit: number) {

        const locationKeys = location
            .split('-')
            .map(loc => loc.trim())
            .filter(Boolean); // loại bỏ chuỗi rỗng nếu có

        const locationArray = provinces
            .filter(province => locationKeys.includes(province.key))
            .map(province => province.name.toLowerCase()); // tên tỉnh thành (city) viết thường

        const cached = await this.cacheManager.get(keyword);

        if (cached) {
            const jobs = cached as any[];
            const filteredJobs = location
                ? jobs.filter(job =>
                    locationArray.some(loc =>
                        job.city?.toLowerCase().includes(loc.toLowerCase())
                    )
                )
                : jobs;
            return this.paginate(filteredJobs, page, limit, keyword, location);
        }

        const jobs = await this.search(keyword);
        await this.cacheManager.set(keyword, jobs, 60 * 60 * 24 * 7); // TTL = 1h

        const filteredJobs = location
            ? jobs.filter(job =>
                locationArray.some(loc =>
                    job.city?.toLowerCase().includes(loc.toLowerCase())
                )
            )
            : jobs;

        return this.paginate(filteredJobs, page, limit, keyword, location);
    }

    paginate<T>(data: T[], page: number, limit: number, keyword: string, location: string) {
        const totalItems = data.length;
        const totalPages = Math.ceil(totalItems / limit);
        const currentPage = Math.max(1, Math.min(page, totalPages));

        const offset = (currentPage - 1) * limit;
        const paginatedItems = data.slice(offset, offset + limit);

        return {
            keyword,
            location,
            totalItems,
            totalPages,
            currentPage,
            pageSize: limit,
            items: paginatedItems,
        };
    }



    async search(keyword: string) {
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

                return jobCards.map((card) => {
                    const img = card.querySelector('img')?.getAttribute('src');
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
            //Crawl careerViet
            const URLCareerViet = 'https://careerviet.vn/viec-lam/';
            await page.goto(`${URLCareerViet}${jobTitle}-k-vi.html`, { waitUntil: 'networkidle2' });
            const jobsCareerViet = await page.$$eval('.jobs-side-list .job-item', (jobCards) => {
                return jobCards.map((card) => {
                    const img = card.querySelector('img.lazy-img')?.getAttribute('data-original')
                        || card.querySelector('img.lazy-img')?.getAttribute('data-src')
                        || card.querySelector('img.lazy-img')?.getAttribute('src');

                    const url = card.querySelector('a.job_link')?.getAttribute('href');
                    const title = card.querySelector('.job_link')?.textContent?.replace(/\s+/g, ' ').trim();
                    const companyName = card.querySelector('.company-name')?.textContent;
                    const city = card.querySelector('.location')?.textContent?.replace(/\s+/g, ' ').trim();
                    const salary = card.querySelector('.salary')?.textContent?.replace(/\s+/g, ' ').trim();
                    const exp = ''
                    return { img, title, companyName, city, salary, exp, url };
                })
            }
            );

            const allJobs = [...jobsTopCV, ...jobsVietNamWork, ...jobsCareerViet].map((job, index) => ({ id: index + 1, ...job }));
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

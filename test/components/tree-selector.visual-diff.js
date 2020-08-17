const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe('d2l-insights-tree-selector', () => {

	const visualDiff = new VisualDiff('tree-selector', __dirname);

	let browser, page;

	before(async() => {
		browser = await puppeteer.launch();
		page = await visualDiff.createPage(browser);
		await page.setViewport({ width: 800, height: 800, deviceScaleFactor: 2 });
		await page.goto(`${visualDiff.getBaseUrl()}/test/components/tree-selector.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
		// wait for data to load
		await new Promise(resolve => setTimeout(resolve, 1500));
	});

	beforeEach(async() => {
		await visualDiff.resetFocus(page);
	});

	after(async() => await browser.close());

	it('passes visual-diff comparison when closed', async function() {
		const rect = await visualDiff.getRect(page, '#default');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

});

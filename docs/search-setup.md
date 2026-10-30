# Getting homegrownplate.co.uk found on Google and Bing

The site already has what search engines need: a sitemap at /sitemap.xml, robots.txt, a canonical URL and a unique title and description on every page, plus recipe and breadcrumb structured data.
These steps are the parts only the site owner can do.

## 1. Google Search Console (free)
1. Go to https://search.google.com/search-console and sign in with your Google account.
2. Choose **Add property** and pick **Domain** (not URL prefix). Enter `homegrownplate.co.uk`.
3. Google shows a TXT record. In Cloudflare, open the domain, go to **DNS > Records > Add record**, choose type TXT, name `@`, and paste the value. Save, then click **Verify** in Search Console (it can take a few minutes).
4. Open **Sitemaps** in the left menu, enter `sitemap.xml` and press Submit. The status should change to Success.
5. Open **URL Inspection**, paste `https://homegrownplate.co.uk/` and click **Request indexing**. Do the same for /plants/ and /recipes/.
6. Come back after a week and look at **Pages** (which pages are indexed) and **Performance** (what people searched to find you).

## 2. Bing Webmaster Tools (free, covers Bing, DuckDuckGo and others)
1. Go to https://www.bing.com/webmasters and sign in.
2. Choose **Import from Google Search Console** to copy the setup in one step, then confirm the sitemap is listed.

## 3. Traffic numbers without adding scripts
Cloudflare's own dashboard shows requests and visitors for the domain from its server logs, so it needs no script and no cookie banner. Look under the domain's **Analytics** page.
Avoid adding the separate Web Analytics snippet or Google Analytics for now: the site's security headers block outside scripts, and they would add a cookie consent requirement.
Search Console's Performance report already tells you what people searched for and which pages they landed on.

## 4. Check the www redirect
Type `www.homegrownplate.co.uk` in a browser. It should redirect to `homegrownplate.co.uk`. If it does not, add a redirect rule in Cloudflare (Rules > Redirect Rules).

## 5. What to expect
New sites are usually crawled within days but can take weeks or months to rank. Do not worry if early numbers are tiny. Add a few more photos and keep content fresh, and check Search Console once a month.

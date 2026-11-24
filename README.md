# Poience website

A static website: plain HTML, CSS and JavaScript, with no build step or dependencies. It runs on any web host (cPanel, Hostinger, Netlify, Vercel, GitHub Pages, AWS S3) and can be opened locally by double-clicking `index.html`.

## Structure

```
index.html            Home (scroll story: one house through the rental journey)
about.html            About Us
services.html         Our Services (5 services, each with its own #anchor)
portfolio.html        Property Portfolio (A/B/C/D tabs + sample listings)
smart-products.html   Smart Products
contact.html          Contact Us (enquiry form)
for-owners.html       For Property Owners / NRIs
faqs.html             FAQs
privacy.html          Privacy Policy (structure only; wording to come from Poience)
robots.txt, sitemap.xml
assets/css/style.css  All styles, with design tokens at the top
assets/js/main.js     All behaviour (menu, reveals, story, FAQs, tabs, form)
assets/img/           logo/, photos/ (JPG + WebP), drawings/, favicons, og-image.jpg
```

## Brand

| Token | Value |
|---|---|
| Navy | `#131E30` (deep `#0E1626`, panel `#1C2A42`) |
| Copper | `#D29774` (light `#EDB795`, text-on-light `#8A5638`) |
| Ivory / Sand | `#F5F0E8` / `#EAE2D4` |
| Headings and accents | Libre Caslon Text (regular, italic, bold) |
| Body, menus, buttons | Inter, variable |

Fonts are self-hosted in `assets/fonts/` (SIL Open Font License; licences included), so the site doesn't depend on Google Fonts.

## Before launch: replace the placeholders

Search the files for `[` to find every placeholder:

- Phone, WhatsApp, email, Instagram: the footer (in every page), contact.html and privacy.html. Also update the `tel:`, `mailto:` and `https://wa.me/` links. The WhatsApp link format is `https://wa.me/91XXXXXXXXXX`.
- A/B/C/D segment criteria (portfolio.html)
- Referral reward terms (services.html, faqs.html)
- Serviceable areas (faqs.html, index.html)
- Sample property card details (portfolio.html)
- Privacy policy wording (privacy.html), reviewed by a legal adviser

## Connect the enquiry form

The form validates input and shows a thank-you message, but it doesn't send anything yet. In `assets/js/main.js`, find `TODO (launch)` and post the form data to one of:

- **Google Sheets + email**: a Google Apps Script web app (`doPost`) that appends a row and sends a `MailApp` email
- **Formspree / Getform / Basin**: point `fetch()` at the endpoint they give you
- **WordPress**: Contact Form 7 or WPForms, if the site is rebuilt in WordPress

## Notes

- Photos are served as WebP with a JPG fallback, and lazy-loaded below the fold.
- The opening key animation plays once per browser session.
- All animations switch off for visitors whose device is set to reduce motion.
- The layout is checked from 390px (phone) to 1440px (desktop), with no sideways scrolling on any page.
- If the domain is not `https://poience.com/`, update the canonical and og:url tags in each page and in `sitemap.xml`.

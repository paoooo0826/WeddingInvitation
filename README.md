# Ever After — Digital Wedding Invitation

A responsive, no-build wedding invitation website designed as a reusable client template. It uses plain HTML, CSS, and JavaScript, so you can edit it in VS Code and deploy it to Vercel without installing a framework.

## Preview locally

Open `index.html` in a browser. For the most reliable local preview, open a terminal in this folder and run:

```bash
npx serve .
```

Then open the local URL shown in the terminal.

## Personalize for a client

Most couple details are in **`config.js`**. Change the names, date, schedule, venue addresses, directions links, dress code, and photos there. You can either use public image URLs or put image files in `assets/` and enter paths like `assets/couple-photo.jpg`.

The wedding countdown reads `weddingDateISO`. Use an ISO date/time including the local offset, for example `2027-06-12T16:00:00+08:00` for a Philippines event.

### Set up RSVP delivery

The RSVP form is front-end only until you connect it to a destination. For the easiest client setup, set **one** of these in `config.js`:

- `rsvpWhatsAppNumber: "639171234567"` (digits only, international format). Guests will get a prefilled WhatsApp message and must press Send to confirm.
- `rsvpEmail: "couple@example.com"`. Guests' default mail app opens with a prefilled RSVP email and they must press Send.

If both are blank, the website clearly tells the guest that RSVP sending has not been connected yet. Responses are not stored by this static website on its own. For automatically stored RSVPs, connect a form provider such as Formspree or add a backend/database before using it for a live event.

## Deploy to Vercel

### GitHub method

1. Create a GitHub repository and upload the contents of this folder (the `index.html` file should be at the repository root).
2. In Vercel, choose **Add New → Project** and import that repository.
3. Choose **Other** as the framework preset. Leave the build command blank and set the output directory to `.` if prompted.
4. Click **Deploy**. Future pushes to the connected branch will redeploy the site.

### Vercel CLI method

Install Node.js first, then in a terminal inside this folder run:

```bash
npx vercel
```

Follow the prompts for the first deploy. When you're ready to publish changes to production, run:

```bash
npx vercel --prod
```

## Notes

- The photos currently point to sample images hosted by Unsplash. For a client handoff, replace them with approved couple photos and confirm that the image URLs are publicly accessible.
- The template does not collect payments, store guests' details, or send email/WhatsApp messages silently.
- This is a static one-page site; it doesn't need environment variables or a database for the base design.

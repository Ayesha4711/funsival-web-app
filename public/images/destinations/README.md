# Destination stock photography

These images are served locally so destination cards do not depend on listing
photos or runtime calls to a stock-photo service.

- `lahore.webp`: Badshahi Mosque, Lahore, Pakistan, by Saqib Rubab.
  Source: https://unsplash.com/photos/zT2udqVcKLk
- `eastern-cape.webp`: Wild Coast, Eastern Cape, South Africa, by Arthur Hickinbotham.
  Source: https://unsplash.com/photos/lEOVk7fBccQ
- `dhahran.webp`: Ithra cultural center in Dhahran, Saudi Arabia, by Yousef Albrahim.
  Source: https://unsplash.com/photos/2r7Cxsm33_0
- `mau.jpg`: Shree Shitla Mata temple in Mau, Uttar Pradesh, India, by Nirajagnivesh.
  Source: https://commons.wikimedia.org/wiki/File:Shitla_mata_temple_mau_UP_india.jpg
  License: https://creativecommons.org/licenses/by-sa/4.0/
  Original image retained; cards crop it for display. Attribution is available
  on `/photo-credits`, linked from the site footer.

The Lahore, Eastern Cape, and Dhahran photographs are free to use under the Unsplash License:
https://unsplash.com/license

City and regional assignments live in `src/lib/destinationImages.js`. Cities
without curated imagery use the existing city stock photo as a fallback.

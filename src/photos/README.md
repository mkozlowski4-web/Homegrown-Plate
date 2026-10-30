# Plant photos

Drop a photo here named after the plant id and it replaces the illustration on that plant's page and card:

    src/photos/tomato.jpg      (also .jpeg, .png or .webp)

Plant ids are the page names in the address, e.g. `/plants/sweet-potato/` is `sweet-potato`.

Optionally describe and credit each photo in `photos.json`:

    {
      "tomato": { "alt": "Ripe Gardener's Delight tomatoes on the vine", "credit": "Mark K.", "creditUrl": "" }
    }

- `alt` describes the picture for screen readers and search engines (a default is used if blank).
- `credit` is shown under the photo. Leave it out for your own photos if you prefer, or use "Photo: your name".
- Landscape photos about 1200 px wide work best. If `sharp` is installed (`npm i -D sharp`) the build makes small WebP copies automatically; otherwise the original is used as-is, so keep files under about 300 KB.
- Only use photos you took, or have a licence for, and add the required credit.

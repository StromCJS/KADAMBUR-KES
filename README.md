# KADAMBUR-KES — About page

The **About** page of the Kadambur English Medium School website, carved out of
the main site as a page that stands on its own.

Open `about.html` in a browser. Nothing to install, no build step, no server —
it is plain HTML, one stylesheet and one script.

```
about.html              the page
assets/css/styles.css   the school's stylesheet (the whole site's, shared)
assets/js/main.js       reveal-on-scroll, the menu, the photo lightbox
assets/img/*.svg        the crest, and a drawn stand-in for the building
.gitignore              keeps photographs out of this repository
```

## There are no photographs here, on purpose

The school's pictures show its building, its grounds and its children, so they
are not committed. `.gitignore` blocks every common photo and video format,
which means they cannot be pushed here by accident either.

Where the real page shows a cut-out photograph of the school building, this one
shows a drawing — `assets/img/building-cutout.svg`. To preview the page as it
really looks, copy the school's own images into `assets/img/` locally; git will
ignore them.

Note that a `.gitignore` only stops files that are *not yet tracked*. It cannot
remove a picture that has already been committed — which is why this repository
was started fresh rather than copied from the school's main one.

## About the markup

The page keeps the stylesheet of the full site rather than a trimmed copy, so
the typography, colours and spacing match the live site exactly, and a change
made upstream can be dropped straight in. `main.js` is likewise the site's own
script; the parts of it that belong to other sections simply find nothing to do
and stay quiet.

The crest in the header, the footer and the loading screen is an inline SVG
symbol (`#crest`), not an image file — which is why the branding survives in a
repository with no pictures in it.

## The rest of the school's site

This is one section of a larger single-page site, which also holds the
milestones, leadership, facilities, campus gallery, bus routes, fees, contact
form and a visitors' book. Those live in the school's own private repository,
along with the staff attendance portal.

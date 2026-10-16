# Roanoke Rides to Vote

An interactive map that helps Roanoke, Virginia voters find a Valley Metro bus from home to their polling place. It's modeled on [Transit to Turnout](https://transittoturnout.org/) in Charlottesville.

## How it works for voters

1. **Where do you live?** Enter the home address from your voter registration, use your phone's location, or tap the map.
2. **Where do you vote?** Pick your precinct from the list (it's printed on your voter card). If the precinct boundaries loaded, the site suggests a precinct from your address and asks you to confirm it. A link goes to the state's voter lookup for anyone who isn't sure. The early-voting office appears in the list until early voting ends.
3. **When do you want to leave?** Choose a departure time during polling hours.

The site then shows:

- up to three bus itineraries (one bus or one transfer), each with walking steps, departure and arrival times, and the route drawn on the map
- a **Plan my trip home** button for the return trip
- the bus routes near your home and near your polling place
- a note when walking would be quicker, and a warning when a trip arrives after polls close
- a Google Maps transit link to compare against

Trip planning runs entirely in the browser. The address search goes to OpenStreetMap's Nominatim geocoder, and nothing is stored.

## Project layout

```
config/site.json           Election date, poll hours, early voting, data URLs, links
data/polling-places.json   The 20 Roanoke City polling places (edit this when locations change)
scripts/build-data.mjs     Builds docs/data/ from live sources
scripts/lib/gtfs.mjs       Turns the GTFS feed into a compact Election Day schedule
docs/                      The static website that GitHub Pages serves
docs/data/                 Generated data, committed by the GitHub Actions workflow
docs/js/router.js          The trip planner (a small RAPTOR search over the schedule)
docs/js/app.js             Map, form, and results UI
index.html                 Redirects the repo root to docs/
test/                      Unit tests with a small made-up GTFS fixture
```

## Data sources

| Data | Source | When it's fetched |
|---|---|---|
| Bus routes, stops, schedules | Valley Metro GTFS feed (`https://vmgoapp.com/gtfs`), with the [MobilityDatabase](https://mobilitydatabase.org/) mirror as a fallback | At build time |
| Polling places | [City of Roanoke, Voting Precincts and Polling Places](https://www.roanokeva.gov/3166/Voting-Precincts-and-Polling-Places), copied into `data/polling-places.json` | Edited by hand |
| Polling-place coordinates | US Census geocoder, with Nominatim as a fallback | At build time |
| Precinct boundaries (optional) | City of Roanoke GIS (`gis03.roanokeva.gov`, Voter_Precincts layer) | At build time |
| Address search, map tiles | OpenStreetMap | In the visitor's browser |

The schedule is built for Election Day (`election.date` in `config/site.json`). If Valley Metro's feed doesn't cover that date yet, the build uses the nearest date in the feed that falls on the same weekday, and the site shows a banner saying so.

Precinct boundaries are only used to suggest a precinct. A polygon is kept only if its name matches a current precinct in `data/polling-places.json`, so an outdated layer can fail to suggest a precinct but can't suggest one that no longer exists. If the layer can't be fetched, voters just pick their precinct from the list.

## Putting the site online (GitHub Pages)

1. In the repository, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**, then pick **main** and **/docs**, and click **Save**. (Picking **/ (root)** also works, because the root page redirects to `docs/`.)
3. After a minute or two, the site is live at `https://<your-username>.github.io/votertransitroanoke/`.

The **Refresh site data** workflow (`.github/workflows/deploy.yml`) builds `docs/data/` and commits it to `main`. It runs on every push to `main`, every morning at about 6:15 AM Eastern, and on demand from the **Actions** tab (**Refresh site data → Run workflow**). It only commits when the data actually changed. If a data source is down, the run fails and the last good data stays online.

## Running it locally

Requires Node 20 or newer and internet access.

```sh
npm install
npm run data         # rebuilds docs/data/ from the live sources
npm run serve        # http://localhost:8080
npm test
```

`npm run vendor` re-copies Leaflet into `docs/vendor/` (the copy is committed, so you only need it after upgrading Leaflet). To build from a GTFS file you already have, run `node scripts/build-data.mjs --gtfs path/to/feed.zip`. The flags `--skip-geocode` and `--skip-precincts` skip those steps.

## Updating for a new election

1. Update `election` (and `earlyVoting`) in `config/site.json`.
2. Check `data/polling-places.json` against the city's polling place page and update the `checked` date.
3. If the geocoder puts a polling place in the wrong spot, add `"lat"` and `"lon"` to that entry. The build keeps coordinates you set by hand.
4. Push to `main`. The workflow rebuilds the data for the new date and commits it.

## Disclaimer

This is an independent, nonpartisan tool. It isn't run by the City of Roanoke, the Virginia Department of Elections, or Valley Metro. Voters should confirm their polling place with official sources.

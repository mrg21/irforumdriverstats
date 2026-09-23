# iR Forum Driver Stats

A browser add-on (Tampermonkey userscript) for the [iRacing forums](https://forums.iracing.com/) that shows driver stats for every post - license badges, member info, and recent activity - right next to the author, without leaving the thread.

This is a fork of [exenza/irforumstats](https://github.com/exenza/irforumstats) with additional features and fixes on top of the original.

## Features

- **License badges** for every category (Sports Car, Formula Car, Oval, Dirt Oval, Dirt Road) with class, Safety Rating, iRating and optional CPI, color-coded by license class.
- **License sorting options** - by custom category order, iRating, CPI, or iRating & CPI.
- **Recent activity**: the driver's most recent events and cars, with a switchable view between the two.
- **Event filtering** - choose which event types (race, hosted, league, qualify, practice, time trial) are shown.
- **More information in the recent events view** (event type, date/time, track, starting/finishing position).
- **Quick links** to the driver's official profile and several community stats sites (irstats, irecap, NYOOM, iRdata, SSummary, Results).
- **Portrait mode specific view** for mobile devices.
- **In-page settings panel**: a small gear icon in each post's header opens a settings modal - no code editing required. From there you can:
  - show or hide CPI in the license badges,
  - choose the license sort mode,
  - reorder the license categories yourself by dragging them into the order you prefer,
  - control how many recent events/cars are shown,
  - toggle which event types are included.

  Settings are saved in your browser (`localStorage`) and apply immediately, without reloading the page.
- **Caching**: driver data is cached in memory for a few minutes, so scrolling through a thread with repeat posters doesn't trigger repeated lookups.

## Requirements

A userscript manager extension for your browser, e.g.:

- [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Edge, Safari, Opera)
- [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)
- [Greasemonkey](https://www.greasespot.net/) (Firefox)

## Installation

1. Install a userscript manager (see [Requirements](#requirements)) if you don't have one yet.
2. Open the raw script file:
   [`irforumdriverstats.js`](https://raw.githubusercontent.com/mrg21/irforumdriverstats/main/irforumdriverstats.js)
3. Your userscript manager should detect the file and prompt you to install it. Confirm the installation.
4. Open any page on `https://forums.iracing.com/` - driver stats should now appear automatically under each post's author info.

The script includes `@downloadURL`/`@updateURL` metadata pointing at this repository, so once installed, your userscript manager will automatically offer updates whenever a new version is pushed here.

### Manual installation

If automatic detection doesn't work:

1. Open your userscript manager's dashboard and choose "Create a new script".
2. Delete the placeholder content and paste in the full contents of [`irforumdriverstats.js`](irforumdriverstats.js).
3. Save. Make sure the script is enabled.

## Usage

Just browse the iRacing forums as usual. Stats load automatically for every post. Click the gear icon (⚙) in the top-right corner of a post's header to open the settings panel and adjust how the stats are displayed.

## Notes

- Driver data is fetched from a small third-party API used by this script; it is not an official iRacing service.
- All settings are stored locally in your browser and are never shared or uploaded anywhere.

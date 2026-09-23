// ==UserScript==
// @name         iR forum driver stats
// @namespace    http://tampermonkey.net/
// @version      2.10_2026-09-23
// @description  Show user stats in the iRacing forum
// @author       MR
// @match        https://forums.iracing.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=iracing.com
// @downloadURL  https://raw.githubusercontent.com/mrg21/irforumdriverstats/main/irforumdriverstats.js
// @updateURL    https://raw.githubusercontent.com/mrg21/irforumdriverstats/main/irforumdriverstats.js
// ==/UserScript==

// ===== DEFAULT SETTINGS =====
// These are only the fallback defaults used the first time the script runs.
// The user-editable, persisted settings live in localStorage and are managed
// via the gear icon (top right of the page) - see loadSettings()/saveSettings().
const DEFAULT_SETTINGS = {
    show_cpi: 1, // 0: off, 1: on
    sort_licenses: 1, // 0: off, 1: custom category order below, 2: iRating, 3: CPI, 4: iRating and CPI
    sort_lic_default: {
        sports_car: 5,
        formula_car: 4,
        oval: 3,
        dirt_oval: 2,
        dirt_road: 1,
        undefined: 0,
    },
    show_max_recent_events: 5,
    show_max_recent_cars: 5,
    show_recent_type: {
        race: 1, // 0: off, 1: on
        hosted: 1, // 0: off, 1: on, 2: only if no more major event
        league: 1, // 0: off, 1: on, 2: only if no more major event
        qualify: 2, // 0: off, 1: on, 2: only if no more major event
        practice: 2, // 0: off, 1: on, 2: only if no more major event
        timetrial: 1, // 0: off, 1: on, 2: only if no more major event
    },
};

// License categories the user can drag-reorder in the settings modal.
// "undefined" (no category) is intentionally excluded from the UI and
// always sorts last, same as in DEFAULT_SETTINGS.sort_lic_default above.
const SETTINGS_CATEGORY_ORDER = ['sports_car', 'formula_car', 'oval', 'dirt_oval', 'dirt_road'];
const SETTINGS_CATEGORY_LABELS = {
    sports_car: 'Sports Car',
    formula_car: 'Formula Car',
    oval: 'Oval',
    dirt_oval: 'Dirt Oval',
    dirt_road: 'Dirt Road',
};
const SETTINGS_RECENT_TYPE_LABELS = {
    race: 'Race',
    hosted: 'Hosted',
    league: 'League',
    qualify: 'Qualify',
    practice: 'Practice',
    timetrial: 'Time Trial',
};

const svg_add = {
    oval: ' viewBox="-2 -1.55 28 18"><path d="m18 3h-12c-1.6568 0-3 1.3432-3 3v0.7918c0 1.1363 0.64201 2.1751 1.6584 2.6833l2.6459 1.3229c2.956 1.478 6.4354 1.478 9.3914 0l2.6459-1.3229c1.0164-0.5082 1.6584-1.547 1.6584-2.6833v-0.7918c0-1.6568-1.3431-3-3-3zm-12-3h12c3.3137 0 6 2.6863 6 6v0.7918c0 2.2726-1.284 4.3502-3.3167 5.3666l-2.6459 1.3229c-3.8006 1.9003-8.2742 1.9003-12.075 0l-2.6459-1.3229c-2.0327-1.0164-3.3167-3.094-3.3167-5.3666v-0.7918c0-3.3137 2.6863-6 6-6z" clip-rule="evenodd" fill="currentColor" fill-rule="evenodd"/></svg>',
    sports_car: ' viewBox="-2 -2 28 18"><path d="m22.5 5.25h-0.8785l-1.5-1.75h0.8785c0.8284 0 1.5-0.78349 1.5-1.75h-3.8785l-0.6213-0.72487c-0.5626-0.65637-1.3256-1.0251-2.1213-1.0251h-7.7574c-0.79565 0-1.5587 0.36875-2.1213 1.0251l-0.62132 0.72487h-3.8789c0 0.9665 0.67157 1.75 1.5 1.75h0.87891l-1.5 1.75h-0.87891c-0.82843 0-1.5 0.78353-1.5 1.75v5.25c0 0.96646 0.67157 1.75 1.5 1.75h1.5c0.82843 0 1.5-0.78353 1.5-1.75h15c0 0.96646 0.6716 1.75 1.5 1.75h1.5c0.8284 0 1.5-0.78353 1.5-1.75v-5.25c0-0.96646-0.6716-1.75-1.5-1.75zm-2.9998 0h-15l2.5604-2.9874c0.2813-0.32819 0.66284-0.51256 1.0607-0.51256h7.7574c0.3978 0 0.7793 0.18438 1.0606 0.51256zm-10.94 2.2625-0.75 0.875c-0.19891 0.23217-0.31066 0.54681-0.31066 0.875 0 0.68343 0.47487 1.2375 1.0607 1.2375h6.8786c0.5858 0 1.0607-0.55405 1.0607-1.2375 0-0.32818-0.1117-0.64283-0.3107-0.875l-0.75-0.875c-0.2813-0.32818-0.6628-0.51251-1.0606-0.51251h-4.7574c-0.39782 0-0.77935 0.18433-1.0607 0.51251zm-3.7678 0.89576c-0.18753 0.21875-0.44189 0.34171-0.7071 0.34171h-1.0858v-1.75h3zm16.207 0.34171h-1.0858c-0.2652 0-0.5196-0.12297-0.7071-0.34171l-1.2071-1.4083h3z" clip-rule="evenodd" fill="currentColor" fill-rule="evenodd" stroke-width="1.0801"/></svg>',
    formula_car: ' viewBox="-2 -1 28 18"><path d="m8.9538 4.3636h-1.4538c-0.82843 0-1.5 0.65121-1.5 1.4545v1.9394l-1.5 0.48484v-0.96969c0-0.80329-0.67157-1.4545-1.5-1.4545h-1.5c-0.82843 0-1.5 0.65124-1.5 1.4545v4.3636c0 0.80329 0.67157 1.4545 1.5 1.4545h1.5c0.82843 0 1.5-0.65124 1.5-1.4545v-1.9394l1.5393-0.49755c0.23262 1.3821 1.4696 2.4369 2.9607 2.4369h0.85714l0.21426 1.4545h-5.5714c0 0.80329 0.67157 1.4545 1.5 1.4545h4.2857l0.0022 0.01464c0.1217 0.82618 0.8514 1.4399 1.7121 1.4399s1.5904-0.61372 1.7121-1.4399l0.0022-0.01464h4.2857c0.8284 0 1.5-0.65124 1.5-1.4545h-5.5714l0.2143-1.4545h0.8571c1.4911 0 2.7281-1.0548 2.9607-2.4369l1.5393 0.49755v1.9394c0 0.80329 0.6716 1.4545 1.5 1.4545h1.5c0.8284 0 1.5-0.65124 1.5-1.4545v-4.3636c0-0.80329-0.6716-1.4545-1.5-1.4545h-1.5c-0.8284 0-1.5 0.65124-1.5 1.4545v0.96969l-1.5-0.48484v-1.9394c0-0.80332-0.6716-1.4545-1.5-1.4545h-1.4539l-0.375-1.4545h4.8289c0.8284 0 1.5-0.65121 1.5-1.4545h-6.7039l-0.0199-0.077333c-0.2087-0.80939-0.9586-1.3772-1.819-1.3772h-0.9144c-0.8604 0-1.6104 0.56781-1.819 1.3772l-0.01994 0.077333h-6.7038c0 0.80332 0.67157 1.4545 1.5 1.4545h4.8288zm6.0462 1.4545h1.5v2.9091c0 0.80329-0.6716 1.4545-1.5 1.4545h-0.6429zm-4.5-1.4545h3l-0.679-2.6336c-0.0417-0.16188-0.1917-0.27544-0.3638-0.27544h-0.9144c-0.1721 0-0.3221 0.11356-0.3638 0.27544zm-1.5 1.4545h-1.5v2.9091c0 0.80329 0.67157 1.4545 1.5 1.4545h0.64286z" clip-rule="evenodd" fill="currentColor" fill-rule="evenodd" stroke-width=".98473"/></svg>',
    dirt_oval: ' viewBox="-2 0 28 18"><path d="m8 0h8c3.7712 0 5.6569 0 6.8284 1.1716 1.1716 1.1716 1.1716 3.0572 1.1716 6.8284v2c0 3.7712 0 5.6569-1.1716 6.8284-1.1715 1.1716-3.0572 1.1716-6.8284 1.1716h-8c-3.7712 0-5.6568 0-6.8284-1.1716-1.1716-1.1715-1.1716-3.0572-1.1716-6.8284v-2c0-3.7712 0-5.6568 1.1716-6.8284s3.0572-1.1716 6.8284-1.1716zm1 6h6c1.6569 0 3 1.3431 3 3s-1.3431 3-3 3h-6c-1.6568 0-3-1.3431-3-3s1.3432-3 3-3zm6-3h-6c-3.3137 0-6 2.6863-6 6s2.6863 6 6 6h6c3.3137 0 6-2.6863 6-6s-2.6863-6-6-6z" clip-rule="evenodd" fill="currentColor" fill-rule="evenodd"/></svg>',
    dirt_road: ' viewBox="-2 0 28 18"><path d="m8 0h8c3.7712 0 5.6569 0 6.8284 1.1716 1.1716 1.1716 1.1716 3.0572 1.1716 6.8284v2c0 3.7712 0 5.6569-1.1716 6.8284-1.1715 1.1716-3.0572 1.1716-6.8284 1.1716h-8c-3.7712 0-5.6568 0-6.8284-1.1716-1.1716-1.1715-1.1716-3.0572-1.1716-6.8284v-2c0-3.7712 0-5.6568 1.1716-6.8284s3.0572-1.1716 6.8284-1.1716zm-2 15h-3v-9c0-1.6568 1.3432-3 3-3h4.5c1.6569 0 3 1.3432 3 3v4c0 1.1046 0.8954 2 2 2h0.5c1.1046 0 2-0.8954 2-2v-7h3v9c0 1.6569-1.3431 3-3 3h-4.5c-1.6569 0-3-1.3431-3-3v-4c0-1.1046-0.89543-2-2-2h-0.5c-1.1046 0-2 0.89543-2 2z" clip-rule="evenodd" fill="currentColor" fill-rule="evenodd"/></svg>',
    undefined: ' viewBox="0 0 1 18"></svg>',
}
const cars_json = [{"car_id":1,"car_name_abbreviated":"SBRS","car_name":"Skip Barber Formula 2000","categories":["formula_car"]},{"car_id":2,"car_make":"Modified","car_model":"SK","car_name_abbreviated":"SK","car_name":"Modified - SK","categories":["oval"]},{"car_id":3,"car_make":"Pontiac","car_model":"Solstice","car_name_abbreviated":"SOL","car_name":"Pontiac Solstice","categories":["sports_car"]},{"car_id":4,"car_name_abbreviated":"PM","car_name":"[Legacy] Pro Mazda","categories":["formula_car"]},{"car_id":5,"car_make":"Legends","car_model":"Advanced","car_name_abbreviated":"LEG","car_name":"Legends Ford '34 Coupe","categories":["oval"]},{"car_id":10,"car_make":"Pontiac","car_model":"Solstice","car_name_abbreviated":"SOL-R","car_name":"Pontiac Solstice - Rookie","categories":["sports_car"]},{"car_id":11,"car_make":"Legends","car_model":"Rookie","car_name_abbreviated":"LEG-R","car_name":"Legends Ford '34 Coupe - Rookie","categories":["oval"]},{"car_id":12,"car_make":"Chevrolet","car_name_abbreviated":"LM","car_name":"[Retired] - Chevrolet Monte Carlo SS","categories":["oval"]},{"car_id":13,"car_make":"Radical ","car_model":" ","car_name_abbreviated":"SR8","car_name":"Radical SR8","categories":["sports_car"]},{"car_id":18,"car_name_abbreviated":"SC","car_name":"Silver Crown","categories":["oval"]},{"car_id":20,"car_make":"Chevrolet","car_model":"Silverado","car_name_abbreviated":"TRUCK","car_name":"[Legacy] NASCAR Truck Chevrolet Silverado - 2008","categories":["oval"]},{"car_id":21,"car_make":"Riley","car_model":"MkXX DP","car_name_abbreviated":"DP","car_name":"[Legacy] Riley MkXX Daytona Prototype - 2008","categories":["sports_car"]},{"car_id":22,"car_make":"Chevrolet","car_model":"Impala","car_name_abbreviated":"CUP","car_name":"[Legacy] NASCAR Cup Chevrolet Impala COT - 2009","categories":["oval"]},{"car_id":23,"car_make":"SCCA Enterprises","car_name_abbreviated":"SRF","car_name":"SCCA Spec Racer Ford","categories":["sports_car"]},{"car_id":24,"car_make":"Chevrolet","car_model":"Impala SS","car_name_abbreviated":"NW09","car_name":"ARCA Menards Chevrolet Impala","categories":["oval"]},{"car_id":25,"car_make":"Lotus","car_model":"Lotus 79","car_name_abbreviated":"L79","car_name":"Lotus 79","categories":["formula_car"]},{"car_id":26,"car_make":"Chevrolet","car_model":"C6R","car_name_abbreviated":"C6R GT1","car_name":"Chevrolet Corvette C6.R GT1","categories":["sports_car"]},{"car_id":27,"car_make":"Volkswagen","car_model":"Jetta TDI","car_name_abbreviated":"VWTDI","car_name":"VW Jetta TDI Cup","categories":["sports_car"]},{"car_id":28,"car_make":"Ford","car_model":"Falcon FG01 V8","car_name_abbreviated":"V8SC","car_name":"[Legacy] V8 Supercar Ford Falcon - 2009","categories":["sports_car"]},{"car_id":29,"car_make":"Dallara","car_model":"IR-05","car_name_abbreviated":"INDY","car_name":"[Legacy] Dallara IR-05","categories":["formula_car"]},{"car_id":30,"car_make":"Ford","car_model":"FR500S","car_name_abbreviated":"FR500","car_name":"Ford Mustang FR500S","categories":["sports_car"]},{"car_id":31,"car_make":"Modified","car_model":"Tour","car_name_abbreviated":"TMOD","car_name":"Modified - NASCAR Whelen Tour","categories":["oval"]},{"car_id":33,"car_make":"Williams","car_model":"FW31","car_name_abbreviated":"FW31","car_name":"Williams-Toyota FW31","categories":["formula_car"]},{"car_id":34,"car_make":"Mazda","car_model":"MX-5 Cup","car_name_abbreviated":"MX5-C","car_name":"[Legacy] Mazda MX-5 Cup - 2010","categories":["sports_car"]},{"car_id":35,"car_make":"Mazda","car_model":"MX-5 Roadster","car_name_abbreviated":"MX5-R","car_name":"[Legacy] Mazda MX-5 Roadster - 2010","categories":["sports_car"]},{"car_id":36,"car_name_abbreviated":"SS","car_name":"Street Stock","categories":["oval"]},{"car_id":37,"car_name_abbreviated":"SPRT","car_name":"Sprint Car","categories":["oval"]},{"car_id":38,"car_make":"Chevrolet","car_name_abbreviated":"IMPB","car_name":"[Legacy] NASCAR Nationwide Chevrolet Impala - 2012","categories":["oval"]},{"car_id":39,"car_make":"HPD","car_model":"ARX-01C","car_name_abbreviated":"ARX","car_name":"HPD ARX-01c","categories":["sports_car"]},{"car_id":40,"car_make":"Ford","car_model":"GT2","car_name_abbreviated":"FGT","car_name":"Ford GT GT2","categories":["sports_car"]},{"car_id":41,"car_make":"Cadillac","car_model":"CTS-VR","car_name_abbreviated":"CTSVR","car_name":"Cadillac CTS-V Racecar","categories":["sports_car"]},{"car_id":42,"car_make":"Lotus","car_model":"Lotus 49","car_name_abbreviated":"L49","car_name":"Lotus 49","categories":["formula_car"]},{"car_id":43,"car_make":"McLaren","car_model":"MP4-12C","car_name_abbreviated":"MP4","car_name":"McLaren MP4-12C GT3","categories":["sports_car"]},{"car_id":44,"car_make":"Kia","car_model":"Optima","car_name_abbreviated":"KIAOPT","car_name":"Kia Optima","categories":["sports_car"]},{"car_id":45,"car_make":"Chevrolet","car_model":"SS","car_name_abbreviated":"CSS","car_name":"[Legacy] NASCAR Cup Chevrolet SS - 2013","categories":["oval"]},{"car_id":46,"car_make":"Ford","car_model":"Fusion-Gen6","car_name_abbreviated":"FF","car_name":"[Legacy] NASCAR Cup Ford Fusion - 2016","categories":["oval"]},{"car_id":48,"car_make":"Ruf","car_model":"AWD","car_name_abbreviated":"R12A","car_name":"Ruf RT 12R AWD","categories":["sports_car"]},{"car_id":49,"car_make":"Ruf","car_model":"RWD","car_name_abbreviated":"R12R","car_name":"Ruf RT 12R RWD","categories":["sports_car"]},{"car_id":50,"car_make":"Ruf","car_model":"Track","car_name_abbreviated":"R12T","car_name":"Ruf RT 12R Track","categories":["sports_car"]},{"car_id":51,"car_make":"Ford","car_model":"Mustang","car_name_abbreviated":"FM","car_name":"[Legacy] NASCAR Xfinity Ford Mustang - 2016","categories":["oval"]},{"car_id":52,"car_make":"Ruf","car_model":"C-Spec","car_name_abbreviated":"R12C","car_name":"Ruf RT 12R C-Spec","categories":["sports_car"]},{"car_id":54,"car_model":"Super Late Model","car_name_abbreviated":"SLM","car_name":"Super Late Model","categories":["oval"]},{"car_id":55,"car_make":"BMW","car_model":"Z4 GT3","car_name_abbreviated":"BMWZ","car_name":"[Legacy] BMW Z4 GT3","categories":["sports_car"]},{"car_id":56,"car_make":"Toyota","car_model":"Camry-Gen6","car_name_abbreviated":"TC","car_name":"NASCAR Cup Series Toyota Camry","categories":["oval"]},{"car_id":57,"car_make":"Dallara","car_model":"DW12","car_name_abbreviated":"DW12","car_name":"[Legacy] Dallara DW12","categories":["formula_car"]},{"car_id":58,"car_make":"Chevrolet","car_model":"Camaro","car_name_abbreviated":"CCB","car_name":"[Legacy] NASCAR Xfinity Chevrolet Camaro - 2014","categories":["oval"]},{"car_id":59,"car_make":"Ford","car_model":"GT3","car_name_abbreviated":"FGT3","car_name":"Ford GT GT3","categories":["sports_car"]},{"car_id":60,"car_make":"Holden","car_model":"Commodore VF","car_name_abbreviated":"HCV8","car_name":"[Legacy] V8 Supercar Holden VF Commodore - 2014","categories":["sports_car"]},{"car_id":61,"car_make":"Ford","car_model":"Falcon FG","car_name_abbreviated":"FFV8","car_name":"[Legacy] V8 Supercar Ford FG Falcon - 2014","categories":["sports_car"]},{"car_id":62,"car_make":"Toyota","car_model":"Tundra","car_name_abbreviated":"TT","car_name":"[Retired] NASCAR Gander Outdoors Toyota Tundra","categories":["oval"]},{"car_id":63,"car_make":"Chevrolet","car_model":"Silverado","car_name_abbreviated":"CS","car_name":"[Retired] NASCAR Trucks Series Chevrolet Silverado - 2018","categories":["oval"]},{"car_id":64,"car_make":"Aston Martin","car_model":"GT1","car_name_abbreviated":"AM1","car_name":"Aston Martin DBR9 GT1","categories":["sports_car"]},{"car_id":67,"car_make":"Mazda","car_model":"MX-5","car_name_abbreviated":"MX16","car_name":"Global Mazda MX-5 Cup","categories":["sports_car"]},{"car_id":69,"car_make":"Toyota","car_model":"Camry","car_name_abbreviated":"NXTC","car_name":"[Legacy] NASCAR Xfinity Toyota Camry - 2015","categories":["oval"]},{"car_id":70,"car_make":"Chevrolet","car_model":"C7 DP","car_name_abbreviated":"C7DP","car_name":"Chevrolet Corvette C7 Daytona Prototype","categories":["sports_car"]},{"car_id":71,"car_make":"McLaren","car_model":"MP4-30","car_name_abbreviated":"MP430","car_name":"McLaren MP4-30","categories":["formula_car"]},{"car_id":72,"car_make":"Mercedes","car_model":"GT3","car_name_abbreviated":"MGT3","car_name":"[Legacy] Mercedes-AMG GT3","categories":["sports_car"]},{"car_id":73,"car_make":"Audi","car_model":"R8 GT3","car_name_abbreviated":"AR8","car_name":"[Legacy] Audi R8 LMS GT3","categories":["sports_car"]},{"car_id":74,"car_make":"Renault","car_model":"Formula 2.0","car_name_abbreviated":"F20","car_name":"Formula Renault 2.0","categories":["formula_car"]},{"car_id":76,"car_make":"Audi","car_model":"90 GTO","car_name_abbreviated":"A90","car_name":"Audi 90 GTO","categories":["sports_car"]},{"car_id":77,"car_make":"Nissan","car_model":"GTP ZX-T","car_name_abbreviated":"ZXT","car_name":"Nissan GTP ZX-T","categories":["sports_car"]},{"car_id":78,"car_make":"Dirt Late Model","car_model":"350","car_name_abbreviated":"DLM350","car_name":"Dirt Late Model - Limited","categories":["dirt_oval"]},{"car_id":79,"car_name_abbreviated":"SSD","car_name":"Dirt Street Stock","categories":["dirt_oval"]},{"car_id":80,"car_make":"Dirt Sprint Car","car_model":"305","car_name_abbreviated":"DSC305","car_name":"Dirt Sprint Car - 305","categories":["dirt_oval"]},{"car_id":81,"car_make":"Ford","car_model":"Fiesta","car_name_abbreviated":"FF-WSC","car_name":"Ford Fiesta RS WRC","categories":["dirt_road"]},{"car_id":82,"car_make":"Legends","car_model":"Dirt","car_name_abbreviated":"LEG-D","car_name":"Dirt Legends Ford '34 Coupe","categories":["dirt_oval"]},{"car_id":83,"car_make":"Dirt Late Model","car_model":"358","car_name_abbreviated":"DLM358","car_name":"Dirt Late Model - Pro","categories":["dirt_oval"]},{"car_id":84,"car_make":"Dirt Late Model","car_model":"438","car_name_abbreviated":"DLM438","car_name":"Dirt Late Model - Super","categories":["dirt_oval"]},{"car_id":85,"car_make":"Dirt Sprint Car","car_model":"360","car_name_abbreviated":"DSC360","car_name":"Dirt Sprint Car - 360","categories":["dirt_oval"]},{"car_id":86,"car_make":"Dirt Sprint Car","car_model":"410","car_name_abbreviated":"DSC410","car_name":"Dirt Sprint Car - 410","categories":["dirt_oval"]},{"car_id":87,"car_make":"Dirt Sprint Car","car_model":"360 Non-Winged","car_name_abbreviated":"DS360NW","car_name":"Dirt Sprint Car - 360 Non-Winged","categories":["dirt_oval"]},{"car_id":88,"car_make":"Porsche","car_model":"911 GT3 Cup","car_name_abbreviated":"P911","car_name":"[Legacy] Porsche 911 GT3 Cup (991)","categories":["sports_car"]},{"car_id":89,"car_make":"Dirt Sprint Car","car_model":"410 Non-Winged","car_name_abbreviated":"DS410NW","car_name":"Dirt Sprint Car - 410 Non-Winged","categories":["dirt_oval"]},{"car_id":91,"car_make":"Volkswagen","car_model":"Beetle","car_name_abbreviated":"VWB","car_name":"VW Beetle","categories":["dirt_road"]},{"car_id":92,"car_make":"Ford","car_model":"GT","car_name_abbreviated":"FGT7","car_name":"Ford GTE","categories":["sports_car"]},{"car_id":93,"car_make":"Ferrari","car_model":"488 GTE","car_name_abbreviated":"488E","car_name":"Ferrari 488 GTE","categories":["sports_car"]},{"car_id":94,"car_make":"Ferrari","car_model":"488 GT3","car_name_abbreviated":"488T3","car_name":"[Legacy] Ferrari 488 GT3","categories":["sports_car"]},{"car_id":95,"car_make":"Dirt UMP Modified","car_model":"UMP Modified","car_name_abbreviated":"UMP","car_name":"Dirt UMP Modified","categories":["dirt_oval"]},{"car_id":96,"car_make":"Dirt Midget","car_model":"Dirt Midget","car_name_abbreviated":"DM","car_name":"Dirt Midget","categories":["dirt_oval"]},{"car_id":98,"car_make":"Audi","car_model":"R18","car_name_abbreviated":"AR18","car_name":"Audi R18","categories":["sports_car"]},{"car_id":99,"car_make":"Dallara","car_model":"IR18","car_name_abbreviated":"IR18","car_name":"Dallara IR18","categories":["formula_car"]},{"car_id":100,"car_make":"Porsche","car_model":"919","car_name_abbreviated":"919","car_name":"Porsche 919","categories":["sports_car"]},{"car_id":101,"car_make":"Subaru","car_model":"WRX STI","car_name_abbreviated":"WRX","car_name":"Subaru WRX STI","categories":["dirt_road"]},{"car_id":102,"car_make":"Porsche","car_model":"911 RSR","car_name_abbreviated":"RSR","car_name":"Porsche 911 RSR","categories":["sports_car"]},{"car_id":103,"car_make":"Chevrolet","car_model":"Camaro ZL1","car_name_abbreviated":"ZL1","car_name":"NASCAR Cup Series Chevrolet Camaro ZL1","categories":["oval"]},{"car_id":104,"car_model":"Pro 2","car_name_abbreviated":"PRO2","car_name":"Lucas Oil Off Road Pro 2 Truck","categories":["dirt_road"]},{"car_id":105,"car_make":"Renault","car_model":"Formula 3.5","car_name_abbreviated":"F35","car_name":"Formula Renault 3.5","categories":["formula_car"]},{"car_id":106,"car_make":"Dallara","car_model":"F317","car_name_abbreviated":"F317","car_name":"Dallara F3","categories":["formula_car"]},{"car_id":107,"car_model":"Pro 4","car_name_abbreviated":"PRO4","car_name":"Lucas Oil Off Road Pro 4 Truck","categories":["dirt_road"]},{"car_id":109,"car_make":"BMW","car_model":"M8 GTE","car_name_abbreviated":"BMWM8","car_name":"BMW M8 GTE","categories":["sports_car"]},{"car_id":110,"car_make":"Ford","car_model":"Mustang","car_name_abbreviated":"FM2019","car_name":"NASCAR Cup Series Ford Mustang","categories":["oval"]},{"car_id":111,"car_make":"Chevrolet","car_model":"Silverado","car_name_abbreviated":"CS2019","car_name":"NASCAR Truck Chevrolet Silverado","categories":["oval"]},{"car_id":112,"car_make":"Audi","car_model":"RS 3 LMS","car_name_abbreviated":"RS3","car_name":"Audi RS 3 LMS TCR","categories":["sports_car"]},{"car_id":113,"car_model":"Pro 2 Lite","car_name_abbreviated":"PRO2L","car_name":"Lucas Oil Off Road Pro 2 Lite","categories":["dirt_road"]},{"car_id":114,"car_make":"Chevrolet","car_model":"Camaro","car_name_abbreviated":"XCC","car_name":"NASCAR XFINITY Chevrolet Camaro","categories":["oval"]},{"car_id":115,"car_make":"Ford","car_model":"Mustang","car_name_abbreviated":"XFM","car_name":"NASCAR XFINITY Ford Mustang","categories":["oval"]},{"car_id":116,"car_make":"Toyota","car_model":"Supra","car_name_abbreviated":"XTS","car_name":"NASCAR XFINITY Toyota Supra","categories":["oval"]},{"car_id":117,"car_make":"Holden","car_model":"ZB Commodore","car_name_abbreviated":"HZBC","car_name":"Supercars Holden ZB Commodore","categories":["sports_car"]},{"car_id":118,"car_make":"Ford","car_model":"Mustang GT","car_name_abbreviated":"FMGT","car_name":"Supercars Ford Mustang GT","categories":["sports_car"]},{"car_id":119,"car_make":"Porsche","car_model":"718 Cayman GT4 Clubsport MR","car_name_abbreviated":"P718","car_name":"Porsche 718 Cayman GT4 Clubsport MR","categories":["sports_car"]},{"car_id":120,"car_make":"Indy Pro 2000","car_model":"PM-18","car_name_abbreviated":"PM18","car_name":"Indy Pro 2000 PM-18","categories":["formula_car"]},{"car_id":121,"car_make":"USF 2000","car_model":"PM-17","car_name_abbreviated":"PM17","car_name":"USF 2000","categories":["formula_car"]},{"car_id":122,"car_make":"BMW","car_model":"M4 GT4","car_name_abbreviated":"BMWM4","car_name":"BMW M4 GT4","categories":["sports_car"]},{"car_id":123,"car_make":"Ford","car_model":"F150","car_name_abbreviated":"F150","car_name":"NASCAR Truck Ford F150","categories":["oval"]},{"car_id":124,"car_make":"Chevrolet","car_model":"Monte Carlo","car_name_abbreviated":"C87","car_name":"NASCAR Legends Chevrolet Monte Carlo - 1987","categories":["oval"]},{"car_id":125,"car_make":"Ford","car_model":"Thunderbird","car_name_abbreviated":"F87","car_name":"NASCAR Legends Ford Thunderbird - 1987","categories":["oval"]},{"car_id":127,"car_make":"Chevrolet","car_model":"C8.R","car_name_abbreviated":"C8R","car_name":"Chevrolet Corvette C8.R GTE","categories":["sports_car"]},{"car_id":128,"car_make":"Dallara","car_model":"P217","car_name_abbreviated":"P217","car_name":"Dallara P217","categories":["sports_car"]},{"car_id":129,"car_make":"Dallara","car_model":"iR-01","car_name_abbreviated":"IR01","car_name":"Dallara iR-01","categories":["formula_car"]},{"car_id":131,"car_make":"Dirt Modified","car_model":"Big Block Modified","car_name_abbreviated":"BBM","car_name":"Dirt Big Block Modified","categories":["dirt_oval"]},{"car_id":132,"car_make":"BMW","car_model":"M4 GT3","car_name_abbreviated":"M4GT3","car_name":"BMW M4 GT3","categories":["sports_car"]},{"car_id":133,"car_make":"Lamborghini","car_model":"HuracÃ¡n GT3 EVO","car_name_abbreviated":"LGT3","car_name":"Lamborghini HuracÃ¡n GT3 EVO","categories":["sports_car"]},{"car_id":134,"car_make":"Dirt Modified","car_model":"358 Modified","car_name_abbreviated":"358MOD","car_name":"Dirt 358 Modified","categories":["dirt_oval"]},{"car_id":135,"car_make":"McLaren","car_model":"570S GT4","car_name_abbreviated":"M570S","car_name":"McLaren 570S GT4","categories":["sports_car"]},{"car_id":137,"car_make":"Porsche","car_model":"911 GT3 R","car_name_abbreviated":"PGTR","car_name":"[Legacy] Porsche 911 GT3 R","categories":["sports_car"]},{"car_id":138,"car_make":"Volkswagen","car_model":"Beetle - Lite","car_name_abbreviated":"VWBL","car_name":"VW Beetle - Lite","categories":["dirt_road"]},{"car_id":139,"car_make":"Chevrolet","car_model":"Camaro ZL1","car_name_abbreviated":"NGC","car_name":"NASCAR Cup Series Next Gen Chevrolet Camaro ZL1","categories":["oval"]},{"car_id":140,"car_make":"Ford","car_model":"Mustang","car_name_abbreviated":"NGF","car_name":"NASCAR Cup Series Next Gen Ford Mustang","categories":["oval"]},{"car_id":141,"car_make":"Toyota","car_model":"Camry","car_name_abbreviated":"NGT","car_name":"NASCAR Cup Series Next Gen Toyota Camry","categories":["oval"]},{"car_id":142,"car_make":"Formula Vee","car_model":"Formula Vee","car_name_abbreviated":"FVEE","car_name":"Formula Vee","categories":["formula_car"]},{"car_id":143,"car_make":"Porsche","car_model":"992","car_name_abbreviated":"P992","car_name":"Porsche 911 GT3 Cup (992)","categories":["sports_car"]},{"car_id":144,"car_make":"Ferrari","car_model":"Evo GT3","car_name_abbreviated":"FEVO","car_name":"Ferrari 488 GT3 Evo 2020","categories":["sports_car"]},{"car_id":145,"car_make":"Mercedes","car_model":"W12","car_name_abbreviated":"MW12","car_name":"Mercedes-AMG W12 E Performance","categories":["formula_car"]},{"car_id":146,"car_make":"Hyundai","car_model":"Elantra CN7","car_name_abbreviated":"HECN7","car_name":"Hyundai Elantra N TCR","categories":["sports_car"]},{"car_id":147,"car_make":"Honda","car_model":"Civic Type R","car_name_abbreviated":"HCTR","car_name":"Honda Civic Type R TCR","categories":["sports_car"]},{"car_id":148,"car_make":"FIA","car_model":"F4","car_name_abbreviated":"F4","car_name":"FIA F4","categories":["formula_car"]},{"car_id":149,"car_make":"Radical","car_model":"SR10","car_name_abbreviated":"SR10","car_name":"Radical SR10","categories":["sports_car"]},{"car_id":150,"car_make":"Aston Martin","car_model":"Vantage GT4","car_name_abbreviated":"AMV4","car_name":"Aston Martin Vantage GT4","categories":["sports_car"]},{"car_id":151,"car_make":"Cruze","car_model":"Chevrolet","car_name_abbreviated":"SCCC","car_name":"Stock Car Brasil Chevrolet Cruze","categories":["sports_car"]},{"car_id":152,"car_make":"Toyota","car_model":"Corolla","car_name_abbreviated":"SCTC","car_name":"Stock Car Brasil Toyota Corolla","categories":["sports_car"]},{"car_id":153,"car_make":"Hyundai","car_model":"Veloster N","car_name_abbreviated":"HVTC","car_name":"Hyundai Veloster N TCR","categories":["sports_car"]},{"car_id":154,"car_make":"Buick","car_model":"LeSabre","car_name_abbreviated":"B87","car_name":"NASCAR Legends Buick LeSabre - 1987","categories":["oval"]},{"car_id":155,"car_make":"Toyota","car_model":"Tundra TRD Pro","car_name_abbreviated":"TTP","car_name":"NASCAR Truck Toyota Tundra TRD Pro","categories":["oval"]},{"car_id":156,"car_make":"Mercedes-AMG","car_model":"GT3 Evo","car_name_abbreviated":"MGT3E","car_name":"Mercedes-AMG GT3 2020","categories":["sports_car"]},{"car_id":157,"car_make":"Mercedes-AMG","car_model":"GT4","car_name_abbreviated":"MGT4","car_name":"Mercedes-AMG GT4","categories":["sports_car"]},{"car_id":158,"car_make":"Porsche","car_model":"Porsche Mission R","car_name_abbreviated":"PMR","car_name":"Porsche Mission R","categories":["sports_car"]},{"car_id":159,"car_make":"BMW","car_model":"BMWGTP","car_name_abbreviated":"BMWGTP","car_name":"BMW M Hybrid V8","categories":["sports_car"]},{"car_id":160,"car_make":"Toyota","car_model":"GR86","car_name_abbreviated":"GR86","car_name":"Toyota GR86","categories":["sports_car"]},{"car_id":161,"car_make":"Mercedes","car_model":"W13","car_name_abbreviated":"MW13","car_name":"Mercedes-AMG W13 E Performance","categories":["formula_car"]},{"car_id":162,"car_make":"Renault","car_model":"Clio","car_name_abbreviated":"RENC","car_name":"Renault Clio","categories":["sports_car"]},{"car_id":163,"car_make":"Ray","car_model":"Ray GR22","car_name_abbreviated":"GR22","car_name":"Ray FF1600","categories":["formula_car"]},{"car_id":164,"car_model":"Late Model Stock","car_name_abbreviated":"LM23","car_name":"Late Model Stock","categories":["oval"]},{"car_id":165,"car_make":"Ligier","car_model":"JSP 320","car_name_abbreviated":"LJSP","car_name":"Ligier JS P320","categories":["sports_car"]},{"car_id":167,"car_make":"Chevrolet","car_model":"Gen 4 Cup","car_name_abbreviated":"G4CUP","car_name":"Gen 4 Cup","categories":["oval"]},{"car_id":168,"car_make":"Cadillac","car_model":"V-Series.R GTP","car_name_abbreviated":"CGTP","car_name":"Cadillac V-Series.R GTP","categories":["sports_car"]},{"car_id":169,"car_make":"Porsche","car_model":"992 GT3 R","car_name_abbreviated":"992R","car_name":"Porsche 911 GT3 R (992)","categories":["sports_car"]},{"car_id":170,"car_make":"Acura","car_model":"ARX-06 GTP","car_name_abbreviated":"AGTP","car_name":"Acura ARX-06 GTP","categories":["sports_car"]},{"car_id":171,"car_make":"Dallara","car_model":"Super Formula SF23 - Toyota","car_name_abbreviated":"SF23T","car_name":"Super Formula SF23 - Toyota","categories":["formula_car"]},{"car_id":172,"car_make":"Dallara","car_model":"Super Formula SF23 - Honda","car_name_abbreviated":"SF23H","car_name":"Super Formula SF23 - Honda","categories":["formula_car"]},{"car_id":173,"car_make":"Ferrari","car_model":"Ferrari 296 GT3","car_name_abbreviated":"F296","car_name":"Ferrari 296 GT3","categories":["sports_car"]},{"car_id":174,"car_make":"Porsche","car_model":"Porsche 963 GTP","car_name_abbreviated":"PGTP","car_name":"Porsche 963 GTP","categories":["sports_car"]},{"car_id":175,"car_make":"Pontiac","car_model":"NASCAR Legends Pontiac Grand Prix - 1987","car_name_abbreviated":"P87","car_name":"NASCAR Legends Pontiac Grand Prix - 1987","categories":["oval"]},{"car_id":176,"car_make":"Audi","car_model":"Audi R8 LMS EVO II GT3","car_name_abbreviated":"AEVO2","car_name":"Audi R8 LMS EVO II GT3","categories":["sports_car"]},{"car_id":178,"car_make":"Dallara","car_model":"324","car_name_abbreviated":"SFL324","car_name":"Super Formula Lights","categories":["formula_car"]},{"car_id":179,"car_make":"SRX","car_model":"SRX","car_name_abbreviated":"SRX","car_name":"SRX","categories":["oval"]},{"car_id":180,"car_model":"Winged","car_name_abbreviated":"MSCW","car_name":"Dirt Micro Sprint Car - Winged","categories":["dirt_oval"]},{"car_id":181,"car_model":"Non-Winged","car_name_abbreviated":"MSCNW","car_name":"Dirt Micro Sprint Car - Non-Winged","categories":["dirt_oval"]},{"car_id":182,"car_model":"Winged","car_name_abbreviated":"MSCOW","car_name":"Dirt Outlaw Micro Sprint Car - Winged","categories":["dirt_oval"]},{"car_id":183,"car_model":"Non-Winged","car_name_abbreviated":"MSCONW","car_name":"Dirt Outlaw Micro Sprint Car - Non-Winged","categories":["dirt_oval"]}];
// New API endpoint
const API_ENDPOINT = 'https://ncv5ut7oz0.execute-api.eu-central-1.amazonaws.com/dev/drivers';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Wrap everything in an IIFE to avoid global scope conflicts
(function() {
    'use strict';

const cache = new Map();

// Initialization protection
let scriptInitialized = false;

// ===== SETTINGS (persisted in localStorage) =====
const SETTINGS_KEY = 'irForumDriverStats_settings_v1';

function loadSettings() {
    let stored = {};
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) stored = JSON.parse(raw);
    } catch (error) {
        console.warn('iR Forum user stats: could not read stored settings, using defaults', error);
    }
    // Merge with defaults key-by-key so a stale/partial stored object (e.g.
    // after a script update adds a new setting) never leaves a field undefined.
    return {
        show_cpi: stored.show_cpi ?? DEFAULT_SETTINGS.show_cpi,
        sort_licenses: stored.sort_licenses ?? DEFAULT_SETTINGS.sort_licenses,
        sort_lic_default: { ...DEFAULT_SETTINGS.sort_lic_default, ...(stored.sort_lic_default || {}) },
        show_max_recent_events: stored.show_max_recent_events ?? DEFAULT_SETTINGS.show_max_recent_events,
        show_max_recent_cars: stored.show_max_recent_cars ?? DEFAULT_SETTINGS.show_max_recent_cars,
        show_recent_type: { ...DEFAULT_SETTINGS.show_recent_type, ...(stored.show_recent_type || {}) },
    };
}

function saveSettings(newSettings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
        return true;
    } catch (error) {
        console.error('iR Forum user stats: could not save settings', error);
        return false;
    }
}

let settings = loadSettings();

// ===== CACHE HELPER FUNCTIONS =====
function getCached(name) {
    const cached = cache.get(name);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    cache.delete(name);
    return null;
}

function setCached(name, data) {
    cache.set(name, { data, timestamp: Date.now() });
}

// ===== RESPONSIVE ORIENTATION DETECTION =====
let window_portrait = false;

function updateOrientation() {
    window_portrait = window.matchMedia("(orientation: portrait)").matches;
}

// Initial check
updateOrientation();

// Listen for orientation changes
window.matchMedia("(orientation: portrait)").addEventListener('change', (e) => {
    window_portrait = e.matches;
    console.log('Orientation changed to:', window_portrait ? 'portrait' : 'landscape');
});

// ===== ROBUST NAME EXTRACTION =====
function getDriverName(author) {
    // Try multiple strategies to get the driver name
    let nameElement = author.getElementsByTagName('a')[0]
        || author.querySelector('a')
        || author.querySelector('.Username a')
        || author.querySelector('[data-username]');

    if (!nameElement) {
        console.log('No name element found in author element');
        return null;
    }

    // Try multiple ways to extract the name
    let rawName = nameElement.innerText
        || nameElement.textContent
        || nameElement.getAttribute('data-username')
        || '';

    // Clean up the name
    const cleanedName = rawName
        .replace(/Loading\s*\n*\s*/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Validate name
    if (!cleanedName || cleanedName.length < 2) {
        console.log('Invalid name extracted:', cleanedName);
        return null;
    }

    return cleanedName;
}

// ===== HELPER FUNCTIONS =====
function years_diff(date) {
    const now = new Date();
    let years = now.getUTCFullYear() - date.getUTCFullYear();
    // Subtract one year if this year's anniversary of `date` hasn't happened yet.
    const anniversaryPassed =
        now.getUTCMonth() > date.getUTCMonth() ||
        (now.getUTCMonth() === date.getUTCMonth() && now.getUTCDate() >= date.getUTCDate());
    if (!anniversaryPassed) years -= 1;
    return Math.max(0, years);
}

function cars_json2dict(cars_json) {
    let dict = {};
    for (const car of cars_json) {
        dict[car.car_id] = {
            make: car.car_make || '',
            model: car.car_model || '',
            abbr: car.car_name_abbreviated,
            cat: car.categories[0]
        };
    };
    return dict;
}

function ArrayAddUniqueString(array, String) {
    if (!array.includes(String)) {
        array.push(String);
    }
}

// ===== HTML ESCAPING =====
// Escapes text coming from the API (event names, track names, country, car
// names, driver names, ...) before it is concatenated into HTML strings via
// insertAdjacentHTML. Without this, a value containing < > " ' or & could
// break the markup or inject arbitrary HTML/attributes.
function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function driver_licenses(driver){
    let license = '';
    let licenses = [];

    for (let i = 0; i < driver.member_info.licenses.length; i++){
        let license_class = driver.member_info.licenses[i].group_name.replace('Class ', '')
        license_class = license_class.replace('Rookie', 'R');
        license_class = license_class.replace('Pro', 'P');
        let lic_sort = 0;
        switch (settings.sort_licenses) {
            case 1: lic_sort = Number(settings.sort_lic_default[driver.member_info.licenses[i].category]); break;
            case 2: lic_sort = Number(driver.member_info.licenses[i].irating); break;
            case 3: lic_sort = Number(driver.member_info.licenses[i].cpi); break;
            case 4: lic_sort = 20 * Math.round(driver.member_info.licenses[i].cpi) + Number(driver.member_info.licenses[i].irating); break;
        }

        licenses.push({ 'lic_sort': lic_sort,
                        'category': driver.member_info.licenses[i].category,
                        'category_name': driver.member_info.licenses[i].category_name,
                        'class': license_class,
                        'sr': driver.member_info.licenses[i].safety_rating,
                        'ir': driver.member_info.licenses[i].irating,
                        'cpi': Math.round(driver.member_info.licenses[i].cpi)});
    }
    if (settings.sort_licenses > 0) { licenses.sort((a,b) => b.lic_sort - a.lic_sort); }
    let member_licenses=[]
    licenses.forEach((license, index) => {
        let license_html = '<div class="license-link license-color-'+ license.class +'"> <svg class="ir-cat-svg"'+ svg_add[license.category];
        license_html += license.class + license.sr +' '+ license.ir;
        if (settings.show_cpi) { license_html += '/'+ license.cpi; }
        license_html += '</div>'
        member_licenses.push(license_html)
    })
    return member_licenses.join(' ');
}

function driver_infos(driver){
    let infos_html = '';
    if (driver?.member_info) {
        let member_years = years_diff(new Date(driver.member_info.member_since));
        infos_html = '' +
            '<b>'+ escapeHtml(driver?.member_info?.country) +' </b> &nbsp; '+
            '<span title="Member since: '+ driver.member_info.member_since +'">Member: '+ member_years +' years</span> &nbsp; '+
            'Followers: '+ driver.follow_counts.followers +'/'+ driver.follow_counts.follows +' &nbsp; '+
            '<a target="_blank" href="https://members-ng.iracing.com/web/racing/profile?cust_id='+ driver.cust_id +'" class="driver-link"> Profile </a> &nbsp; '+
            '<a target="_blank" href="https://irstats.com/driver/'+ driver.cust_id +'" class="driver-link"> irstats </a> &nbsp; '+
            '<a target="_blank" href="https://irecap.racing/my_last_races.php?custid='+ driver.cust_id +'" class="driver-link"> irecap </a> &nbsp; '+
            '<a target="_blank" href="https://nyoom.app/search/'+ driver.cust_id +'" class="driver-link"> NYOOM </a> &nbsp; '+
            '<a target="_blank" href="https://iracingdata.com/user/careerstats/'+ driver.cust_id +'" class="driver-link"> iRdata </a> &nbsp; '+
            '<a target="_blank" href="https://season-summary.dyczkowski.dev/driver/'+ driver.cust_id +'?category=sports_car" class="driver-link"> SSummary </a> &nbsp; '+
            '<a target="_blank" href="https://members-ng.iracing.com/web/racing/results-stats/results"'+
            ' onclick="navigator.clipboard.writeText('+ driver.cust_id +');"'+
            ' class="driver-link"> Results </a> &nbsp;';
        if (!window_portrait) {
            infos_html += '<a target="_blank" href="'+ API_ENDPOINT +'?names='+ encodeURIComponent(driver.member_info.display_name) +'" class="driver-link"> API </a> &nbsp; ';
        }
    }
    return infos_html;
}

function driver_recent_events(driver, cars_dict) {
    let recent_events_html = '';
    let recent_cars_html = '';
    if (driver && driver.recent_events.length > 0) {
        let recent_events = {
            race: [],
            hosted: [],
            league: [],
            qualify: [],
            practice: [],
            timetrial: [],
            show1: [],
            show2: [],
            show: [],
        };
        let recent_cars = {
            show1: [],
            show2: [],
            show: [],
        };
        let session_style = '';
        driver.recent_events.forEach((recent_event, index) => {
            if (recent_event.subsession_id > 0) {
                let car = cars_dict[recent_event.car_id];
                let carname = escapeHtml((car?.make || recent_event.car_name) + ' ' + (car?.abbr || ''));
                let event_type = recent_event.event_type.toLowerCase().replace(/\s/g, '');
                let event_type1 = recent_event.event_type[0];
                let event_dt = new Date(recent_event.start_time);
                let event_date = recent_event.start_time.slice(0, 10);
                let event_date2 = recent_event.start_time.slice(2, 10);
                let event_time = recent_event.start_time.slice(12, 16);
                let event_datetime = event_date + ' ' + event_time;
                let event_datetime2 = event_date2 + ' ' + event_time;
                let event_pos = '';

                switch (event_type) {
                    case 'race': event_pos = ' S'+ (recent_event.starting_position+1) + ' F'+ (recent_event.finish_position+1); break;
                    case 'hosted': event_pos = ' S'+ (recent_event.starting_position+1) + ' F'+ (recent_event.finish_position+1); break;
                    case 'league': event_pos = ' S'+ (recent_event.starting_position+1) + ' F'+ (recent_event.finish_position+1); break;
                }

                let tmp_html = '<span class="driver-link"> &nbsp;';
                if (window_portrait) {
                    tmp_html += '<span class="border777">'+
                        '<svg class="recent-svg"'+ svg_add[car?.cat] +
                        ' <a target="_blank" class="driver-link monospace" href="https://members-ng.iracing.com/web/racing/profile?subsessionid='+ recent_event.subsession_id +'">'+
                        event_type1 +' '+ event_date2 +'</a>'+
                        '&nbsp; <a target="_blank" class="driver-link" href="https://members.iracing.com/membersite/member/EventResult.do?subsessionid='+ recent_event.subsession_id +'">'+
                        carname + event_pos +'&nbsp;</a> </span>';
                } else {
                    tmp_html += '<span title="'+ escapeHtml(recent_event.event_type) +' '+ event_datetime2 +' '+ escapeHtml(recent_event.event_name) +'" class="border777">'+
                        '<svg class="recent-svg"'+ svg_add[car?.cat] +
                        ' <a target="_blank" class="driver-link monospace" href="https://members-ng.iracing.com/web/racing/profile?subsessionid='+ recent_event.subsession_id +'">'+
                        event_type1 +' '+ event_datetime2 +'</a>'+
                        '&nbsp; <a target="_blank" class="driver-link" href="https://members.iracing.com/membersite/member/EventResult.do?subsessionid='+ recent_event.subsession_id +'">'+
                        escapeHtml(recent_event.car_name) +' @ '+ escapeHtml(recent_event.track.track_name) + event_pos +'&nbsp;</a> </span>';
                }

                recent_events[event_type] = recent_events[event_type] || [];
                recent_events[event_type].push(tmp_html);
                if (settings.show_recent_type[event_type] == 1) {
                    recent_events.show1.push(tmp_html);
                    ArrayAddUniqueString(recent_cars.show1, carname);
                } else if (settings.show_recent_type[event_type] == 2) {
                    recent_events.show2.push(tmp_html);
                    ArrayAddUniqueString(recent_cars.show2, carname);
                }
            }
        });

        if (recent_events.show1.length > 0) {
            for (let i = 0; i < recent_events.show1.length && recent_events.show.length < settings.show_max_recent_events; i++) {
                recent_events.show.push(recent_events.show1[i]);
            }
        } else {
            for (let i = 0; i < recent_events.show2.length && recent_events.show.length < settings.show_max_recent_events; i++) {
                recent_events.show.push(recent_events.show2[i]);
            }
        }
        if (recent_cars.show1.length > 0) {
            for (let i = 0; i < recent_cars.show1.length && recent_cars.show.length < settings.show_max_recent_cars; i++) {
                ArrayAddUniqueString(recent_cars.show, recent_cars.show1[i]);
            }
        } else {
            for (let i = 0; i < recent_cars.show2.length && recent_cars.show.length < settings.show_max_recent_cars; i++) {
                ArrayAddUniqueString(recent_cars.show, recent_cars.show2[i]);
            }
        }

        recent_cars_html += '<span>'+ recent_cars.show.join(', ') +'</span>';
        recent_events_html += '<span class="fs90">'+ recent_events.show.join('<br>') +'</span>';
    } else {
        recent_cars_html += '<b> No recent cars. </b>';
        recent_events_html += '<b> No recent events. </b>';
    }

    return {
        cars: recent_cars_html,
        events: recent_events_html,
    };
}

// ===== ERROR MESSAGE INSERTION =====
function insertErrorMessage(author, driverName) {
    const errorHTML = '<span class="error-message fs90">Stats unavailable. ' +
        '<a target="_blank" href="' + API_ENDPOINT + '?names=' + encodeURIComponent(driverName) + '" class="driver-link">' +
        'Try API</a></span>';

    author.insertAdjacentHTML('beforeend', '<div class="driver-stats-error fwb fs12">' + errorHTML + '</div>');
}

// ===== RENDER SINGLE DRIVER =====
function renderDriver(author, driverName, driverData, cars_dict, idx) {
    try {
        if (!driverData?.member_info) {
            console.log('No member_info for driver:', driverName);
            insertErrorMessage(author, driverName);
            return;
        }

        let driver_stats = '';
        let driver_recent = driver_recent_events(driverData, cars_dict);

        driver_stats += '<span class="fwn theme-font-color">'+ driver_infos(driverData) + '</span>';
        driver_stats += '<div class="dispflex fs90">'+ driver_licenses(driverData) + '</div>';
        driver_stats += '<div class="dispflex theme-font-color">'
        driver_stats += '<div id="recent_switch_'+ idx +'" class="noselect"> <b> Recent: </b>&nbsp;</div>';
        driver_stats += '<div id="recent_cars_html_'+ idx +'" class="fwn" style="display: inline;">';
        if (settings.show_max_recent_cars > 0) {
            driver_stats += driver_recent.cars;
        } else {
            driver_stats += 'No recent cars!';
        }
        driver_stats += '</div><div id="recent_events_html_'+ idx +'" class="fwn" style="display: none;">';
        if (settings.show_max_recent_events > 0) {
            driver_stats += driver_recent.events;
        } else {
            driver_stats += 'No recent events!';
        }
        driver_stats += '</div>';
        driver_stats += '</div>'; // Close dispflex

        // Find correct insertion point
        let inserE = author;
        if (author.parentElement.parentElement.classList.contains('ConversationMessage')) {
            inserE = author.parentElement.parentElement;
        } else if (author.parentElement.parentElement.parentElement.classList.contains('CommentHeader')
                || author.parentElement.parentElement.parentElement.classList.contains('DiscussionHeader')) {
            inserE = author.parentElement.parentElement.parentElement;
        }

        inserE.insertAdjacentHTML('beforeend','<div class="driver-infos fwb fs12" >'+ driver_stats +'</div>');

    } catch(error) {
        console.error('Error rendering driver:', driverName, error);
        insertErrorMessage(author, driverName);
    }
}

// ===== ATTACH EVENT LISTENERS =====
function attachEventListeners(totalDrivers) {
    for (let i = 0; i < totalDrivers; i++) {
        let recent_switch = document.querySelector('#recent_switch_'+ i);
        if (recent_switch) {
            recent_switch.addEventListener('click', function() {
                let recent_events_html = document.querySelector('#recent_events_html_'+ i);
                let recent_cars_html = document.querySelector('#recent_cars_html_'+ i);
                if (recent_events_html && recent_cars_html) {
                    if (recent_events_html.style.display == 'none') {
                        recent_events_html.style.display = 'inline';
                        recent_cars_html.style.display = 'none';
                    } else {
                        recent_events_html.style.display = 'none';
                        recent_cars_html.style.display = 'inline';
                    }
                }
            });
        }
    }
}

// ===== MAIN INITIALIZATION FUNCTION =====
function init() {
    // Initialization protection
    if (scriptInitialized) {
        console.log('Script already initialized');
        return;
    }

    // Check if stats are already loaded
    if (document.querySelector('.loadingstats') || document.querySelector('.driver-infos')) {
        console.log('Stats already loaded on page');
        scriptInitialized = true;
        return;
    }

    console.log('Initializing iR Forum user stats script...');

    // getElementsByClassName returns a LIVE collection. We insert new markup
    // (loading indicators, later the stats) into the DOM as we iterate below,
    // so we snapshot it into a plain array first to avoid iterating over a
    // collection that mutates under us.
    let authors = [...document.getElementsByClassName('Author')];

    if (authors.length === 0) {
        console.log('No authors found on page');
        // Do NOT set scriptInitialized here: authors may not be in the DOM yet
        // (e.g. late-loading SPA-style forum). Leaving the flag false lets the
        // setTimeout fallback below retry init() instead of giving up silently.
        return;
    }

    // Only now, having actually found authors and committed to rendering,
    // do we mark the script as initialized.
    scriptInitialized = true;

    let cars_dict = cars_json2dict(cars_json);
    let driverMap = new Map(); // Map driver names to author elements
    let names = [];

    // Collect all driver names and their author elements
    for (const author of authors) {
        const driverName = getDriverName(author);

        if (!driverName) {
            console.log('Could not extract driver name from author element');
            continue;
        }

        // Add loading indicator
        author.insertAdjacentHTML('beforeend',
            '<div class="loadingstats fwb">' +
            '<div class="loading-bar-container">' +
            '<div class="loading-bar"></div>' +
            '</div>' +
            '</div>');

        // Small settings gear, placed inside this post's own header row -
        // independent of whether stats end up loading successfully below.
        createInlineSettingsIcon(author);

        // Store author element(s) for this driver
        if (!driverMap.has(driverName)) {
            driverMap.set(driverName, []);
            names.push(driverName);
        }
        driverMap.get(driverName).push(author);
    }

    // Remove duplicates
    names = [...new Set(names)];

    if (names.length === 0) {
        console.log('No valid driver names found');
        return;
    }

    console.log('Found drivers:', names);

    // Phase 1: Check cache for all names
    const uncachedNames = [];
    const cachedData = {};

    names.forEach(name => {
        const cached = getCached(name);
        if (cached) {
            cachedData[name] = cached;
            console.log('Using cached data for:', name);
        } else {
            uncachedNames.push(name);
        }
    });

    // Phase 2: Render cached drivers immediately
    let idx = 0;
    Object.entries(cachedData).forEach(([driverName, driverData]) => {
        const authorElements = driverMap.get(driverName);
        if (authorElements) {
            authorElements.forEach(author => {
                // Remove loading indicator
                const loadingBox = author.querySelector('.loadingstats');
                if (loadingBox) loadingBox.remove();

                renderDriver(author, driverName, driverData, cars_dict, idx);
                idx++;
            });
        }
    });

    // Phase 3: Fetch uncached drivers in a batch
    if (uncachedNames.length > 0) {
        console.log('Fetching from API:', uncachedNames);

        fetch(API_ENDPOINT + '?names=' + uncachedNames.join(','))
            .then((response) => {
                if (!response.ok) {
                    throw new Error('API request failed: ' + response.status);
                }
                return response.json();
            })
            .then((data) => {
                console.log('API data received');

                // Cache new data
                Object.entries(data).forEach(([name, driverData]) => {
                    setCached(name, driverData);
                });

                // Render new drivers
                Object.entries(data).forEach(([driverName, driverData]) => {
                    const authorElements = driverMap.get(driverName);
                    if (authorElements) {
                        authorElements.forEach(author => {
                            // Remove loading indicator
                            const loadingBox = author.querySelector('.loadingstats');
                            if (loadingBox) loadingBox.remove();

                            renderDriver(author, driverName, driverData, cars_dict, idx);
                            idx++;
                        });
                    }
                });

                // Attach event listeners for all drivers
                attachEventListeners(idx);
            })
            .catch((error) => {
                console.error('API fetch error:', error);

                // Show error for all uncached drivers
                uncachedNames.forEach(driverName => {
                    const authorElements = driverMap.get(driverName);
                    if (authorElements) {
                        authorElements.forEach(author => {
                            // Remove loading indicator
                            const loadingBox = author.querySelector('.loadingstats');
                            if (loadingBox) loadingBox.remove();

                            insertErrorMessage(author, driverName);
                        });
                    }
                });

                // Even though the API call failed, any drivers rendered from
                // cache in Phase 2 still need their Recent-switch handlers.
                attachEventListeners(idx);
            });
    } else {
        // All data was cached, just attach event listeners
        attachEventListeners(idx);
    }
}

// ===== RE-RENDER AFTER A SETTINGS CHANGE =====
// Removes everything this script previously inserted into the page and runs
// init() again. Already-fetched driver data stays in `cache` (it's a
// module-level Map, untouched by this), so this normally redraws instantly
// without any new API calls.
function reRenderAll() {
    document.querySelectorAll('.driver-infos, .driver-stats-error, .loadingstats').forEach(el => el.remove());
    scriptInitialized = false;
    init();
}

// ===== SETTINGS UI (gear icon + modal) =====

// Returns the category keys sorted by the given settings object's
// sort_lic_default weights (highest first), so the drag list always starts
// in the order the current settings represent.
function categoryOrderFromSettings(settingsObj) {
    return [...SETTINGS_CATEGORY_ORDER].sort((a, b) =>
        (settingsObj.sort_lic_default[b] ?? 0) - (settingsObj.sort_lic_default[a] ?? 0));
}

function buildSettingsModalHtml(settingsObj) {
    const s = settingsObj;

    const categoryListHtml = categoryOrderFromSettings(s).map(cat => (
        '<li class="irfds-drag-item" draggable="true" data-cat="'+ cat +'">' +
            '<span class="irfds-drag-handle">&#9776;</span>' +
            '<svg class="irfds-cat-icon"'+ svg_add[cat] +
            '<span>'+ escapeHtml(SETTINGS_CATEGORY_LABELS[cat]) +'</span>' +
        '</li>'
    )).join('');

    const recentTypeRowsHtml = Object.keys(SETTINGS_RECENT_TYPE_LABELS).map(type => (
        '<tr>' +
            '<td>'+ escapeHtml(SETTINGS_RECENT_TYPE_LABELS[type]) +'</td>' +
            '<td>' +
                '<select data-recent-type="'+ type +'">' +
                    '<option value="0"'+ (s.show_recent_type[type] == 0 ? ' selected' : '') +'>Off</option>' +
                    '<option value="1"'+ (s.show_recent_type[type] == 1 ? ' selected' : '') +'>On</option>' +
                    '<option value="2"'+ (s.show_recent_type[type] == 2 ? ' selected' : '') +'>Only if nothing else</option>' +
                '</select>' +
            '</td>' +
        '</tr>'
    )).join('');

    return '' +
        '<div class="irfds-modal-header">' +
            '<span>iR Forum Driver Stats &ndash; Settings</span>' +
            '<span class="irfds-modal-close" id="irfds-modal-close" title="Close">&times;</span>' +
        '</div>' +
        '<div class="irfds-modal-body">' +
            '<div class="irfds-settings-section">' +
                '<h4>General</h4>' +
                '<label class="irfds-checkbox-row"><input type="checkbox" id="irfds-show-cpi"'+ (s.show_cpi ? ' checked' : '') +'> Show CPI in license badges</label>' +
                '<label class="irfds-row">Sort licenses by:' +
                    '<select id="irfds-sort-licenses">' +
                        '<option value="0"'+ (s.sort_licenses == 0 ? ' selected' : '') +'>Off (API order)</option>' +
                        '<option value="1"'+ (s.sort_licenses == 1 ? ' selected' : '') +'>Custom category order</option>' +
                        '<option value="2"'+ (s.sort_licenses == 2 ? ' selected' : '') +'>iRating</option>' +
                        '<option value="3"'+ (s.sort_licenses == 3 ? ' selected' : '') +'>CPI</option>' +
                        '<option value="4"'+ (s.sort_licenses == 4 ? ' selected' : '') +'>iRating &amp; CPI</option>' +
                    '</select>' +
                '</label>' +
            '</div>' +
            '<div class="irfds-settings-section">' +
                '<h4>License category order</h4>' +
                '<p class="irfds-hint">Drag &amp; drop to reorder. Used when &quot;Custom category order&quot; is selected above.</p>' +
                '<ul class="irfds-drag-list" id="irfds-category-list">'+ categoryListHtml +'</ul>' +
            '</div>' +
            '<div class="irfds-settings-section">' +
                '<h4>Recent events</h4>' +
                '<label class="irfds-row">Number of events shown: <input type="number" id="irfds-max-events" min="0" max="20" value="'+ s.show_max_recent_events +'"></label>' +
                '<label class="irfds-row">Number of cars shown: <input type="number" id="irfds-max-cars" min="0" max="20" value="'+ s.show_max_recent_cars +'"></label>' +
                '<table class="irfds-recent-table">'+ recentTypeRowsHtml +'</table>' +
            '</div>' +
        '</div>' +
        '<div class="irfds-modal-footer">' +
            '<button type="button" id="irfds-reset-btn" class="irfds-btn irfds-btn-secondary">Reset to defaults</button>' +
            '<button type="button" id="irfds-save-btn" class="irfds-btn irfds-btn-primary">Save</button>' +
        '</div>';
}

// Native HTML5 drag & drop: reorders the <li> elements in the DOM as the
// user drags, based on pointer position relative to the item under it.
function attachCategoryDragAndDrop(listEl) {
    if (!listEl) return;
    let dragEl = null;

    listEl.querySelectorAll('.irfds-drag-item').forEach(item => {
        item.addEventListener('dragstart', () => {
            dragEl = item;
            item.classList.add('irfds-dragging');
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('irfds-dragging');
            dragEl = null;
        });
        item.addEventListener('dragover', (event) => {
            event.preventDefault();
            if (!dragEl || dragEl === item) return;
            const rect = item.getBoundingClientRect();
            const insertBeforeThisItem = (event.clientY - rect.top) < rect.height / 2;
            listEl.insertBefore(dragEl, insertBeforeThisItem ? item : item.nextSibling);
        });
    });
}

// (Re)draws the modal's inner content for the given settings object and
// wires up its controls. Used both for the initial open and after "Reset".
function renderModalContent(settingsObj) {
    const modal = document.getElementById('irfds-modal');
    if (!modal) return;

    modal.innerHTML = buildSettingsModalHtml(settingsObj);

    document.getElementById('irfds-modal-close').addEventListener('click', closeSettingsModal);
    document.getElementById('irfds-save-btn').addEventListener('click', saveSettingsFromModal);
    document.getElementById('irfds-reset-btn').addEventListener('click', () => {
        if (confirm('Reset all settings to their defaults?')) {
            renderModalContent(DEFAULT_SETTINGS);
        }
    });
    attachCategoryDragAndDrop(document.getElementById('irfds-category-list'));
}

function openSettingsModal() {
    const overlay = document.getElementById('irfds-modal-overlay');
    if (!overlay) return;
    renderModalContent(settings);
    overlay.classList.remove('irfds-hide');
}

function closeSettingsModal() {
    const overlay = document.getElementById('irfds-modal-overlay');
    if (overlay) overlay.classList.add('irfds-hide');
}

// Reads the current form state out of the modal DOM, persists it, and
// triggers a re-render of all driver stats with the new settings applied.
function saveSettingsFromModal() {
    const newSettings = {
        show_cpi: document.getElementById('irfds-show-cpi').checked ? 1 : 0,
        sort_licenses: Number(document.getElementById('irfds-sort-licenses').value),
        sort_lic_default: {},
        show_max_recent_events: Math.max(0, Number(document.getElementById('irfds-max-events').value) || 0),
        show_max_recent_cars: Math.max(0, Number(document.getElementById('irfds-max-cars').value) || 0),
        show_recent_type: {},
    };

    // Category drag order -> weights (top of the list = highest weight).
    const orderedCats = [...document.querySelectorAll('#irfds-category-list .irfds-drag-item')]
        .map(li => li.dataset.cat);
    orderedCats.forEach((cat, i) => {
        newSettings.sort_lic_default[cat] = orderedCats.length - i;
    });
    newSettings.sort_lic_default.undefined = 0;

    document.querySelectorAll('[data-recent-type]').forEach(select => {
        newSettings.show_recent_type[select.dataset.recentType] = Number(select.value);
    });

    settings = newSettings;
    saveSettings(settings);
    closeSettingsModal();
    reRenderAll();
}

// Creates the hidden modal shell (overlay + modal box) once. Safe to call
// multiple times - it no-ops if already present. No visible button is
// created here anymore; the settings icon is now placed inline per post
// (see createInlineSettingsIcon below) so it doesn't cover unrelated parts
// of the forum page.
function ensureSettingsModalShell() {
    if (document.getElementById('irfds-modal-overlay') || !document.body) return;

    document.body.insertAdjacentHTML('beforeend',
        '<div id="irfds-modal-overlay" class="irfds-hide">' +
            '<div id="irfds-modal" role="dialog" aria-modal="true"></div>' +
        '</div>');

    document.getElementById('irfds-modal-overlay').addEventListener('click', (event) => {
        if (event.target.id === 'irfds-modal-overlay') closeSettingsModal();
    });
}

// Walks up from the driver's "Author" element looking for the forum's own
// post-header row (class "AuthorWrap") so the gear icon can sit inside that
// existing row, top right, rather than floating over the whole page. Falls
// back to a nearby ancestor if that class isn't found in the current theme.
function findAuthorWrap(author) {
    let el = author;
    for (let i = 0; i < 5 && el; i++) {
        if (el.classList && el.classList.contains('AuthorWrap')) return el;
        el = el.parentElement;
    }
    return author.parentElement || author;
}

// Adds one small gear icon, top right, inside this post's own AuthorWrap
// row. Called once per rendered post (not per unique driver), independent
// of whether that post's stats end up loading successfully, so the
// settings are always reachable. Guarded against duplicates so re-running
// init() (e.g. after saving settings) doesn't stack up extra icons.
function createInlineSettingsIcon(author) {
    ensureSettingsModalShell();

    const container = findAuthorWrap(author);
    if (!container || container.querySelector('.irfds-settings-icon-inline')) return;

    // The icon is positioned absolutely, so its container needs to be a
    // positioning context; only touch this if the theme hasn't already set one.
    if (window.getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }

    container.insertAdjacentHTML('beforeend',
        '<span class="irfds-settings-icon-inline" title="iR Forum Driver Stats &ndash; Settings">&#9881;</span>');

    const icon = container.querySelector('.irfds-settings-icon-inline');
    if (icon) {
        icon.addEventListener('click', (event) => {
            event.stopPropagation();
            openSettingsModal();
        });
    }
}

// ===== DOM READY AND INITIALIZATION =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    init();
}

// Fallback: Try again after a short delay if initialization failed
setTimeout(() => {
    if (!scriptInitialized) {
        console.log('Fallback initialization attempt');
        init();
    }
}, 1000);

// ===== STYLES =====
function addGlobalStyle(css) {
    const head = document.getElementsByTagName('head')[0];
    if (!head) return;
    const style = document.createElement('style');
    style.innerHTML = css;
    head.appendChild(style);
}

addGlobalStyle(`
    .driver-link { color: inherit !important; font-size: inherit !important; font-weight: normal !important; }
    .license-link { border-radius: 6px; font-weight: bold; text-align: center; line-height: 1; margin-right: 0.5em; padding-inline: 0.3em; }
    .license-color-R { border: 1px solid #E1251B; background-color: #F3A8A4; color: #5D1214; }
    .license-color-D { border: 1px solid #FF6600; background-color: #FFC299; color: #692C09; }
    .license-color-C { border: 1px solid #FFCC00; background-color: #FFEB99; color: #50410A; }
    .license-color-B { border: 1px solid #33CC00; background-color: #ADEB99; color: #175509; }
    .license-color-A { border: 1px solid #006EFF; background-color: #99C5FF; color: #032F6F; }
    .license-color-P { border: 1px solid #828287; background-color: #CDCDCF; color: #37373F; }
    .ir-cat-svg { height: 1.4em; vertical-align: text-top; margin-right: 0.3em; }
    .recent-svg { height: 1.4em; vertical-align: text-top; margin-inline: 0.2em; }
    .fwb { font-weight: bold; }
    .fwn { font-weight: normal; }
    .fs12 { font-size: 12px; }
    .fs90 { font-size: 90%; }
    .fs100 { font-size: 100%; }
    .fs110 { font-size: 110%; }
    .theme-font-color { color:var(--theme-font-color); }
    .monospace { font-family: monospace; }
    .hide { display: none; }
    .noselect { user-select: none; }
    .border777 { border: 1px solid #777; border-radius: 6px; }
    .dispflex { display: flex; }
    .Item-Header.Item-Header { flex-wrap: wrap; }
    .ConversationMessage { flex-wrap: wrap; }
    .driver-infos { flex-basis: 100%; }
    .error-message { color: #cc6666; font-style: italic; }

    /* Animated loading bar */
    .loading-bar-container {
        width: 100%;
        height: 4px;
        background-color: #333;
        border-radius: 2px;
        overflow: hidden;
        margin: 2px 0;
    }
    .loading-bar {
        height: 100%;
        background: linear-gradient(90deg, #006EFF, #33CC00);
        width: 0%;
        animation: loadingProgress 10s linear forwards;
        border-radius: 2px;
    }
    @keyframes loadingProgress {
        from { width: 0%; }
        to { width: 100%; }
    }
    .loadingstats { min-height: 20px; }

    /* Settings gear icon: one per post, top right inside its own AuthorWrap row */
    .irfds-settings-icon-inline {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        line-height: 1;
        color: #888;
        background: transparent;
        border-radius: 50%;
        cursor: pointer;
        z-index: 5;
        user-select: none;
        transition: color 0.15s ease, background 0.15s ease;
    }
    .irfds-settings-icon-inline:hover { color: #fff; background: rgba(255,255,255,0.12); }

    /* Settings modal */
    #irfds-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.55);
        z-index: 1000000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    #irfds-modal-overlay.irfds-hide { display: none; }
    #irfds-modal {
        background: #1f1f23;
        color: #eee;
        width: min(480px, 92vw);
        max-height: 86vh;
        overflow-y: auto;
        border-radius: 10px;
        border: 1px solid #444;
        box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        font-size: 14px;
    }
    /* The forum's own site-wide CSS (e.g. generic rules for h4, label,
       select, input, table) can otherwise win over our styles below and
       leave text an unreadable near-black on this dark background, so we
       force a sane default color on every element inside the modal first
       and then override it more specifically (with !important as a
       safety net) where a different shade is wanted. */
    #irfds-modal * {
        color: #eee;
        background-color: transparent;
    }
    .irfds-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid #3a3a3f;
        font-weight: bold;
        font-size: 15px;
    }
    .irfds-modal-close { cursor: pointer; font-size: 20px; line-height: 1; padding: 0 4px; }
    .irfds-modal-body { padding: 14px 16px; }
    .irfds-settings-section { margin-bottom: 18px; }
    .irfds-settings-section h4 { margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.03em; color: #aaa !important; }
    .irfds-hint { margin: 0 0 8px 0; font-size: 12px; color: #999 !important; }
    .irfds-row { display: block; margin-bottom: 8px; }
    .irfds-checkbox-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
    .irfds-row select, .irfds-row input[type="number"] { margin-left: 6px; }
    #irfds-modal select, #irfds-modal input[type="number"] {
        background-color: #2a2a2f !important;
        color: #eee !important;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 2px 4px;
    }

    .irfds-drag-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    .irfds-drag-item {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #2a2a2f;
        border: 1px solid #444;
        border-radius: 6px;
        padding: 6px 10px;
        cursor: grab;
    }
    .irfds-drag-item.irfds-dragging { opacity: 0.4; }
    .irfds-drag-handle { color: #888 !important; }
    .irfds-cat-icon { height: 1.2em; }

    .irfds-recent-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .irfds-recent-table td { padding: 4px 4px; border-bottom: 1px solid #333; }
    .irfds-recent-table select { width: 100%; }

    .irfds-modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid #3a3a3f;
    }
    .irfds-btn { padding: 6px 14px; border-radius: 6px; border: 1px solid #555; cursor: pointer; font-size: 13px; }
    .irfds-btn-primary { background: #006EFF !important; color: #fff !important; border-color: #006EFF; }
    .irfds-btn-secondary { background: transparent; color: #ccc !important; }
    .irfds-hide { display: none !important; }
`);

console.log('iR Forum user stats script loaded');

})(); // End of IIFE

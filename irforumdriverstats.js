// ==UserScript==
// @name         iR Forum user stats
// @namespace    http://tampermonkey.net/
// @version      1.17_2024-08-21
// @description  Show user stats in the iRacing forum
// @author       MR
// @match        https://forums.iracing.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @downloadURL  https://raw.githubusercontent.com/mrg21/irforumdriverstats/main/irforumdriverstats.js
// @updateURL    https://raw.githubusercontent.com/mrg21/irforumdriverstats/main/irforumdriverstats.js
// ==/UserScript==

// config
const show_cpi = 1; // 0: off, 1: on
const sort_licenses = 3; // 0: off, 1: iRating, 2: CPI, 3: iRating and CPI
const show_max_recent_events = 5;
const show_max_recent_cars = 5;
const show_recent_type = {
    race: 1, // 0: off, 1: on
    hosted: 1, // 0: off, 1: on, 2: only if no more major event
    league: 1, // 0: off, 1: on, 2: only if no more major event
    timetrial: 1, // 0: off, 1: on, 2: only if no more major event
    practice: 2, // 0: off, 1: on, 2: only if no more major event
};

const svg_add = {
    oval: ' viewBox="-2 -1.55 28 18"><path d="m18 3h-12c-1.6568 0-3 1.3432-3 3v0.7918c0 1.1363 0.64201 2.1751 1.6584 2.6833l2.6459 1.3229c2.956 1.478 6.4354 1.478 9.3914 0l2.6459-1.3229c1.0164-0.5082 1.6584-1.547 1.6584-2.6833v-0.7918c0-1.6568-1.3431-3-3-3zm-12-3h12c3.3137 0 6 2.6863 6 6v0.7918c0 2.2726-1.284 4.3502-3.3167 5.3666l-2.6459 1.3229c-3.8006 1.9003-8.2742 1.9003-12.075 0l-2.6459-1.3229c-2.0327-1.0164-3.3167-3.094-3.3167-5.3666v-0.7918c0-3.3137 2.6863-6 6-6z" clip-rule="evenodd" fill="currentColor" fill-rule="evenodd"/></svg>',
    sports_car: ' viewBox="-2 -2 28 18"><path d="m22.5 5.25h-0.8785l-1.5-1.75h0.8785c0.8284 0 1.5-0.78349 1.5-1.75h-3.8785l-0.6213-0.72487c-0.5626-0.65637-1.3256-1.0251-2.1213-1.0251h-7.7574c-0.79565 0-1.5587 0.36875-2.1213 1.0251l-0.62132 0.72487h-3.8789c0 0.9665 0.67157 1.75 1.5 1.75h0.87891l-1.5 1.75h-0.87891c-0.82843 0-1.5 0.78353-1.5 1.75v5.25c0 0.96646 0.67157 1.75 1.5 1.75h1.5c0.82843 0 1.5-0.78353 1.5-1.75h15c0 0.96646 0.6716 1.75 1.5 1.75h1.5c0.8284 0 1.5-0.78353 1.5-1.75v-5.25c0-0.96646-0.6716-1.75-1.5-1.75zm-2.9998 0h-15l2.5604-2.9874c0.2813-0.32819 0.66284-0.51256 1.0607-0.51256h7.7574c0.3978 0 0.7793 0.18438 1.0606 0.51256zm-10.94 2.2625-0.75 0.875c-0.19891 0.23217-0.31066 0.54681-0.31066 0.875 0 0.68343 0.47487 1.2375 1.0607 1.2375h6.8786c0.5858 0 1.0607-0.55405 1.0607-1.2375 0-0.32818-0.1117-0.64283-0.3107-0.875l-0.75-0.875c-0.2813-0.32818-0.6628-0.51251-1.0606-0.51251h-4.7574c-0.39782 0-0.77935 0.18433-1.0607 0.51251zm-3.7678 0.89576c-0.18753 0.21875-0.44189 0.34171-0.7071 0.34171h-1.0858v-1.75h3zm16.207 0.34171h-1.0858c-0.2652 0-0.5196-0.12297-0.7071-0.34171l-1.2071-1.4083h3z" clip-rule="evenodd" fill="currentColor" fill-rule="evenodd" stroke-width="1.0801"/></svg>',
    formula_car: ' viewBox="-2 -1 28 18"><path d="m8.9538 4.3636h-1.4538c-0.82843 0-1.5 0.65121-1.5 1.4545v1.9394l-1.5 0.48484v-0.96969c0-0.80329-0.67157-1.4545-1.5-1.4545h-1.5c-0.82843 0-1.5 0.65124-1.5 1.4545v4.3636c0 0.80329 0.67157 1.4545 1.5 1.4545h1.5c0.82843 0 1.5-0.65124 1.5-1.4545v-1.9394l1.5393-0.49755c0.23262 1.3821 1.4696 2.4369 2.9607 2.4369h0.85714l0.21426 1.4545h-5.5714c0 0.80329 0.67157 1.4545 1.5 1.4545h4.2857l0.0022 0.01464c0.1217 0.82618 0.8514 1.4399 1.7121 1.4399s1.5904-0.61372 1.7121-1.4399l0.0022-0.01464h4.2857c0.8284 0 1.5-0.65124 1.5-1.4545h-5.5714l0.2143-1.4545h0.8571c1.4911 0 2.7281-1.0548 2.9607-2.4369l1.5393 0.49755v1.9394c0 0.80329 0.6716 1.4545 1.5 1.4545h1.5c0.8284 0 1.5-0.65124 1.5-1.4545v-4.3636c0-0.80329-0.6716-1.4545-1.5-1.4545h-1.5c-0.8284 0-1.5 0.65124-1.5 1.4545v0.96969l-1.5-0.48484v-1.9394c0-0.80332-0.6716-1.4545-1.5-1.4545h-1.4539l-0.375-1.4545h4.8289c0.8284 0 1.5-0.65121 1.5-1.4545h-6.7039l-0.0199-0.077333c-0.2087-0.80939-0.9586-1.3772-1.819-1.3772h-0.9144c-0.8604 0-1.6104 0.56781-1.819 1.3772l-0.01994 0.077333h-6.7038c0 0.80332 0.67157 1.4545 1.5 1.4545h4.8288zm6.0462 1.4545h1.5v2.9091c0 0.80329-0.6716 1.4545-1.5 1.4545h-0.6429zm-4.5-1.4545h3l-0.679-2.6336c-0.0417-0.16188-0.1917-0.27544-0.3638-0.27544h-0.9144c-0.1721 0-0.3221 0.11356-0.3638 0.27544zm-1.5 1.4545h-1.5v2.9091c0 0.80329 0.67157 1.4545 1.5 1.4545h0.64286z" clip-rule="evenodd" fill="currentColor" fill-rule="evenodd" stroke-width=".98473"/></svg>',
    dirt_oval: ' viewBox="-2 0 28 18"><path d="m8 0h8c3.7712 0 5.6569 0 6.8284 1.1716 1.1716 1.1716 1.1716 3.0572 1.1716 6.8284v2c0 3.7712 0 5.6569-1.1716 6.8284-1.1715 1.1716-3.0572 1.1716-6.8284 1.1716h-8c-3.7712 0-5.6568 0-6.8284-1.1716-1.1716-1.1715-1.1716-3.0572-1.1716-6.8284v-2c0-3.7712 0-5.6568 1.1716-6.8284s3.0572-1.1716 6.8284-1.1716zm1 6h6c1.6569 0 3 1.3431 3 3s-1.3431 3-3 3h-6c-1.6568 0-3-1.3431-3-3s1.3432-3 3-3zm6-3h-6c-3.3137 0-6 2.6863-6 6s2.6863 6 6 6h6c3.3137 0 6-2.6863 6-6s-2.6863-6-6-6z" clip-rule="evenodd" fill="currentColor" fill-rule="evenodd"/></svg>',
    dirt_road: ' viewBox="-2 0 28 18"><path d="m8 0h8c3.7712 0 5.6569 0 6.8284 1.1716 1.1716 1.1716 1.1716 3.0572 1.1716 6.8284v2c0 3.7712 0 5.6569-1.1716 6.8284-1.1715 1.1716-3.0572 1.1716-6.8284 1.1716h-8c-3.7712 0-5.6568 0-6.8284-1.1716-1.1716-1.1715-1.1716-3.0572-1.1716-6.8284v-2c0-3.7712 0-5.6568 1.1716-6.8284s3.0572-1.1716 6.8284-1.1716zm-2 15h-3v-9c0-1.6568 1.3432-3 3-3h4.5c1.6569 0 3 1.3432 3 3v4c0 1.1046 0.8954 2 2 2h0.5c1.1046 0 2-0.8954 2-2v-7h3v9c0 1.6569-1.3431 3-3 3h-4.5c-1.6569 0-3-1.3431-3-3v-4c0-1.1046-0.89543-2-2-2h-0.5c-1.1046 0-2 0.89543-2 2z" clip-rule="evenodd" fill="currentColor" fill-rule="evenodd"/></svg>',
}
const cars_json = [{"car_id":1,"car_name_abbreviated":"SBRS","car_name":"Skip Barber Formula 2000","categories":["formula_car"]},{"car_id":2,"car_make":"Modified","car_model":"SK","car_name_abbreviated":"SK","car_name":"Modified - SK","categories":["oval"]},{"car_id":3,"car_make":"Pontiac","car_model":"Solstice","car_name_abbreviated":"SOL","car_name":"Pontiac Solstice","categories":["sports_car"]},{"car_id":4,"car_name_abbreviated":"PM","car_name":"[Legacy] Pro Mazda","categories":["formula_car"]},{"car_id":5,"car_make":"Legends","car_model":"Advanced","car_name_abbreviated":"LEG","car_name":"Legends Ford '34 Coupe","categories":["oval"]},{"car_id":10,"car_make":"Pontiac","car_model":"Solstice","car_name_abbreviated":"SOL-R","car_name":"Pontiac Solstice - Rookie","categories":["sports_car"]},{"car_id":11,"car_make":"Legends","car_model":"Rookie","car_name_abbreviated":"LEG-R","car_name":"Legends Ford '34 Coupe - Rookie","categories":["oval"]},{"car_id":12,"car_make":"Chevrolet","car_name_abbreviated":"LM","car_name":"[Retired] - Chevrolet Monte Carlo SS","categories":["oval"]},{"car_id":13,"car_make":"Radical ","car_model":" ","car_name_abbreviated":"SR8","car_name":"Radical SR8","categories":["sports_car"]},{"car_id":18,"car_name_abbreviated":"SC","car_name":"Silver Crown","categories":["oval"]},{"car_id":20,"car_make":"Chevrolet","car_model":"Silverado","car_name_abbreviated":"TRUCK","car_name":"[Legacy] NASCAR Truck Chevrolet Silverado - 2008","categories":["oval"]},{"car_id":21,"car_make":"Riley","car_model":"MkXX DP","car_name_abbreviated":"DP","car_name":"[Legacy] Riley MkXX Daytona Prototype - 2008","categories":["sports_car"]},{"car_id":22,"car_make":"Chevrolet","car_model":"Impala","car_name_abbreviated":"CUP","car_name":"[Legacy] NASCAR Cup Chevrolet Impala COT - 2009","categories":["oval"]},{"car_id":23,"car_make":"SCCA Enterprises","car_name_abbreviated":"SRF","car_name":"SCCA Spec Racer Ford","categories":["sports_car"]},{"car_id":24,"car_make":"Chevrolet","car_model":"Impala SS","car_name_abbreviated":"NW09","car_name":"ARCA Menards Chevrolet Impala","categories":["oval"]},{"car_id":25,"car_make":"Lotus","car_model":"Lotus 79","car_name_abbreviated":"L79","car_name":"Lotus 79","categories":["formula_car"]},{"car_id":26,"car_make":"Chevrolet","car_model":"C6R","car_name_abbreviated":"C6R GT1","car_name":"Chevrolet Corvette C6.R GT1","categories":["sports_car"]},{"car_id":27,"car_make":"Volkswagen","car_model":"Jetta TDI","car_name_abbreviated":"VWTDI","car_name":"VW Jetta TDI Cup","categories":["sports_car"]},{"car_id":28,"car_make":"Ford","car_model":"Falcon FG01 V8","car_name_abbreviated":"V8SC","car_name":"[Legacy] V8 Supercar Ford Falcon - 2009","categories":["sports_car"]},{"car_id":29,"car_make":"Dallara","car_model":"IR-05","car_name_abbreviated":"INDY","car_name":"[Legacy] Dallara IR-05","categories":["formula_car"]},{"car_id":30,"car_make":"Ford","car_model":"FR500S","car_name_abbreviated":"FR500","car_name":"Ford Mustang FR500S","categories":["sports_car"]},{"car_id":31,"car_make":"Modified","car_model":"Tour","car_name_abbreviated":"TMOD","car_name":"Modified - NASCAR Whelen Tour","categories":["oval"]},{"car_id":33,"car_make":"Williams","car_model":"FW31","car_name_abbreviated":"FW31","car_name":"Williams-Toyota FW31","categories":["formula_car"]},{"car_id":34,"car_make":"Mazda","car_model":"MX-5 Cup","car_name_abbreviated":"MX5-C","car_name":"[Legacy] Mazda MX-5 Cup - 2010","categories":["sports_car"]},{"car_id":35,"car_make":"Mazda","car_model":"MX-5 Roadster","car_name_abbreviated":"MX5-R","car_name":"[Legacy] Mazda MX-5 Roadster - 2010","categories":["sports_car"]},{"car_id":36,"car_name_abbreviated":"SS","car_name":"Street Stock","categories":["oval"]},{"car_id":37,"car_name_abbreviated":"SPRT","car_name":"Sprint Car","categories":["oval"]},{"car_id":38,"car_make":"Chevrolet","car_name_abbreviated":"IMPB","car_name":"[Legacy] NASCAR Nationwide Chevrolet Impala - 2012","categories":["oval"]},{"car_id":39,"car_make":"HPD","car_model":"ARX-01C","car_name_abbreviated":"ARX","car_name":"HPD ARX-01c","categories":["sports_car"]},{"car_id":40,"car_make":"Ford","car_model":"GT2","car_name_abbreviated":"FGT","car_name":"Ford GT GT2","categories":["sports_car"]},{"car_id":41,"car_make":"Cadillac","car_model":"CTS-VR","car_name_abbreviated":"CTSVR","car_name":"Cadillac CTS-V Racecar","categories":["sports_car"]},{"car_id":42,"car_make":"Lotus","car_model":"Lotus 49","car_name_abbreviated":"L49","car_name":"Lotus 49","categories":["formula_car"]},{"car_id":43,"car_make":"McLaren","car_model":"MP4-12C","car_name_abbreviated":"MP4","car_name":"McLaren MP4-12C GT3","categories":["sports_car"]},{"car_id":44,"car_make":"Kia","car_model":"Optima","car_name_abbreviated":"KIAOPT","car_name":"Kia Optima","categories":["sports_car"]},{"car_id":45,"car_make":"Chevrolet","car_model":"SS","car_name_abbreviated":"CSS","car_name":"[Legacy] NASCAR Cup Chevrolet SS - 2013","categories":["oval"]},{"car_id":46,"car_make":"Ford","car_model":"Fusion-Gen6","car_name_abbreviated":"FF","car_name":"[Legacy] NASCAR Cup Ford Fusion - 2016","categories":["oval"]},{"car_id":48,"car_make":"Ruf","car_model":"AWD","car_name_abbreviated":"R12A","car_name":"Ruf RT 12R AWD","categories":["sports_car"]},{"car_id":49,"car_make":"Ruf","car_model":"RWD","car_name_abbreviated":"R12R","car_name":"Ruf RT 12R RWD","categories":["sports_car"]},{"car_id":50,"car_make":"Ruf","car_model":"Track","car_name_abbreviated":"R12T","car_name":"Ruf RT 12R Track","categories":["sports_car"]},{"car_id":51,"car_make":"Ford","car_model":"Mustang","car_name_abbreviated":"FM","car_name":"[Legacy] NASCAR Xfinity Ford Mustang - 2016","categories":["oval"]},{"car_id":52,"car_make":"Ruf","car_model":"C-Spec","car_name_abbreviated":"R12C","car_name":"Ruf RT 12R C-Spec","categories":["sports_car"]},{"car_id":54,"car_model":"Super Late Model","car_name_abbreviated":"SLM","car_name":"Super Late Model","categories":["oval"]},{"car_id":55,"car_make":"BMW","car_model":"Z4 GT3","car_name_abbreviated":"BMWZ","car_name":"[Legacy] BMW Z4 GT3","categories":["sports_car"]},{"car_id":56,"car_make":"Toyota","car_model":"Camry-Gen6","car_name_abbreviated":"TC","car_name":"NASCAR Cup Series Toyota Camry","categories":["oval"]},{"car_id":57,"car_make":"Dallara","car_model":"DW12","car_name_abbreviated":"DW12","car_name":"[Legacy] Dallara DW12","categories":["formula_car"]},{"car_id":58,"car_make":"Chevrolet","car_model":"Camaro","car_name_abbreviated":"CCB","car_name":"[Legacy] NASCAR Xfinity Chevrolet Camaro - 2014","categories":["oval"]},{"car_id":59,"car_make":"Ford","car_model":"GT3","car_name_abbreviated":"FGT3","car_name":"Ford GT GT3","categories":["sports_car"]},{"car_id":60,"car_make":"Holden","car_model":"Commodore VF","car_name_abbreviated":"HCV8","car_name":"[Legacy] V8 Supercar Holden VF Commodore - 2014","categories":["sports_car"]},{"car_id":61,"car_make":"Ford","car_model":"Falcon FG","car_name_abbreviated":"FFV8","car_name":"[Legacy] V8 Supercar Ford FG Falcon - 2014","categories":["sports_car"]},{"car_id":62,"car_make":"Toyota","car_model":"Tundra","car_name_abbreviated":"TT","car_name":"[Retired] NASCAR Gander Outdoors Toyota Tundra","categories":["oval"]},{"car_id":63,"car_make":"Chevrolet","car_model":"Silverado","car_name_abbreviated":"CS","car_name":"[Retired] NASCAR Trucks Series Chevrolet Silverado - 2018","categories":["oval"]},{"car_id":64,"car_make":"Aston Martin","car_model":"GT1","car_name_abbreviated":"AM1","car_name":"Aston Martin DBR9 GT1","categories":["sports_car"]},{"car_id":67,"car_make":"Mazda","car_model":"MX-5","car_name_abbreviated":"MX16","car_name":"Global Mazda MX-5 Cup","categories":["sports_car"]},{"car_id":69,"car_make":"Toyota","car_model":"Camry","car_name_abbreviated":"NXTC","car_name":"[Legacy] NASCAR Xfinity Toyota Camry - 2015","categories":["oval"]},{"car_id":70,"car_make":"Chevrolet","car_model":"C7 DP","car_name_abbreviated":"C7DP","car_name":"Chevrolet Corvette C7 Daytona Prototype","categories":["sports_car"]},{"car_id":71,"car_make":"McLaren","car_model":"MP4-30","car_name_abbreviated":"MP430","car_name":"McLaren MP4-30","categories":["formula_car"]},{"car_id":72,"car_make":"Mercedes","car_model":"GT3","car_name_abbreviated":"MGT3","car_name":"[Legacy] Mercedes-AMG GT3","categories":["sports_car"]},{"car_id":73,"car_make":"Audi","car_model":"R8 GT3","car_name_abbreviated":"AR8","car_name":"[Legacy] Audi R8 LMS GT3","categories":["sports_car"]},{"car_id":74,"car_make":"Renault","car_model":"Formula 2.0","car_name_abbreviated":"F20","car_name":"Formula Renault 2.0","categories":["formula_car"]},{"car_id":76,"car_make":"Audi","car_model":"90 GTO","car_name_abbreviated":"A90","car_name":"Audi 90 GTO","categories":["sports_car"]},{"car_id":77,"car_make":"Nissan","car_model":"GTP ZX-T","car_name_abbreviated":"ZXT","car_name":"Nissan GTP ZX-T","categories":["sports_car"]},{"car_id":78,"car_make":"Dirt Late Model","car_model":"350","car_name_abbreviated":"DLM350","car_name":"Dirt Late Model - Limited","categories":["dirt_oval"]},{"car_id":79,"car_name_abbreviated":"SSD","car_name":"Dirt Street Stock","categories":["dirt_oval"]},{"car_id":80,"car_make":"Dirt Sprint Car","car_model":"305","car_name_abbreviated":"DSC305","car_name":"Dirt Sprint Car - 305","categories":["dirt_oval"]},{"car_id":81,"car_make":"Ford","car_model":"Fiesta","car_name_abbreviated":"FF-WSC","car_name":"Ford Fiesta RS WRC","categories":["dirt_road"]},{"car_id":82,"car_make":"Legends","car_model":"Dirt","car_name_abbreviated":"LEG-D","car_name":"Dirt Legends Ford '34 Coupe","categories":["dirt_oval"]},{"car_id":83,"car_make":"Dirt Late Model","car_model":"358","car_name_abbreviated":"DLM358","car_name":"Dirt Late Model - Pro","categories":["dirt_oval"]},{"car_id":84,"car_make":"Dirt Late Model","car_model":"438","car_name_abbreviated":"DLM438","car_name":"Dirt Late Model - Super","categories":["dirt_oval"]},{"car_id":85,"car_make":"Dirt Sprint Car","car_model":"360","car_name_abbreviated":"DSC360","car_name":"Dirt Sprint Car - 360","categories":["dirt_oval"]},{"car_id":86,"car_make":"Dirt Sprint Car","car_model":"410","car_name_abbreviated":"DSC410","car_name":"Dirt Sprint Car - 410","categories":["dirt_oval"]},{"car_id":87,"car_make":"Dirt Sprint Car","car_model":"360 Non-Winged","car_name_abbreviated":"DS360NW","car_name":"Dirt Sprint Car - 360 Non-Winged","categories":["dirt_oval"]},{"car_id":88,"car_make":"Porsche","car_model":"911 GT3 Cup","car_name_abbreviated":"P911","car_name":"[Legacy] Porsche 911 GT3 Cup (991)","categories":["sports_car"]},{"car_id":89,"car_make":"Dirt Sprint Car","car_model":"410 Non-Winged","car_name_abbreviated":"DS410NW","car_name":"Dirt Sprint Car - 410 Non-Winged","categories":["dirt_oval"]},{"car_id":91,"car_make":"Volkswagen","car_model":"Beetle","car_name_abbreviated":"VWB","car_name":"VW Beetle","categories":["dirt_road"]},{"car_id":92,"car_make":"Ford","car_model":"GT","car_name_abbreviated":"FGT7","car_name":"Ford GTE","categories":["sports_car"]},{"car_id":93,"car_make":"Ferrari","car_model":"488 GTE","car_name_abbreviated":"488E","car_name":"Ferrari 488 GTE","categories":["sports_car"]},{"car_id":94,"car_make":"Ferrari","car_model":"488 GT3","car_name_abbreviated":"488T3","car_name":"[Legacy] Ferrari 488 GT3","categories":["sports_car"]},{"car_id":95,"car_make":"Dirt UMP Modified","car_model":"UMP Modified","car_name_abbreviated":"UMP","car_name":"Dirt UMP Modified","categories":["dirt_oval"]},{"car_id":96,"car_make":"Dirt Midget","car_model":"Dirt Midget","car_name_abbreviated":"DM","car_name":"Dirt Midget","categories":["dirt_oval"]},{"car_id":98,"car_make":"Audi","car_model":"R18","car_name_abbreviated":"AR18","car_name":"Audi R18","categories":["sports_car"]},{"car_id":99,"car_make":"Dallara","car_model":"IR18","car_name_abbreviated":"IR18","car_name":"Dallara IR18","categories":["formula_car"]},{"car_id":100,"car_make":"Porsche","car_model":"919","car_name_abbreviated":"919","car_name":"Porsche 919","categories":["sports_car"]},{"car_id":101,"car_make":"Subaru","car_model":"WRX STI","car_name_abbreviated":"WRX","car_name":"Subaru WRX STI","categories":["dirt_road"]},{"car_id":102,"car_make":"Porsche","car_model":"911 RSR","car_name_abbreviated":"RSR","car_name":"Porsche 911 RSR","categories":["sports_car"]},{"car_id":103,"car_make":"Chevrolet","car_model":"Camaro ZL1","car_name_abbreviated":"ZL1","car_name":"NASCAR Cup Series Chevrolet Camaro ZL1","categories":["oval"]},{"car_id":104,"car_model":"Pro 2","car_name_abbreviated":"PRO2","car_name":"Lucas Oil Off Road Pro 2 Truck","categories":["dirt_road"]},{"car_id":105,"car_make":"Renault","car_model":"Formula 3.5","car_name_abbreviated":"F35","car_name":"Formula Renault 3.5","categories":["formula_car"]},{"car_id":106,"car_make":"Dallara","car_model":"F317","car_name_abbreviated":"F317","car_name":"Dallara F3","categories":["formula_car"]},{"car_id":107,"car_model":"Pro 4","car_name_abbreviated":"PRO4","car_name":"Lucas Oil Off Road Pro 4 Truck","categories":["dirt_road"]},{"car_id":109,"car_make":"BMW","car_model":"M8 GTE","car_name_abbreviated":"BMWM8","car_name":"BMW M8 GTE","categories":["sports_car"]},{"car_id":110,"car_make":"Ford","car_model":"Mustang","car_name_abbreviated":"FM2019","car_name":"NASCAR Cup Series Ford Mustang","categories":["oval"]},{"car_id":111,"car_make":"Chevrolet","car_model":"Silverado","car_name_abbreviated":"CS2019","car_name":"NASCAR Truck Chevrolet Silverado","categories":["oval"]},{"car_id":112,"car_make":"Audi","car_model":"RS 3 LMS","car_name_abbreviated":"RS3","car_name":"Audi RS 3 LMS TCR","categories":["sports_car"]},{"car_id":113,"car_model":"Pro 2 Lite","car_name_abbreviated":"PRO2L","car_name":"Lucas Oil Off Road Pro 2 Lite","categories":["dirt_road"]},{"car_id":114,"car_make":"Chevrolet","car_model":"Camaro","car_name_abbreviated":"XCC","car_name":"NASCAR XFINITY Chevrolet Camaro","categories":["oval"]},{"car_id":115,"car_make":"Ford","car_model":"Mustang","car_name_abbreviated":"XFM","car_name":"NASCAR XFINITY Ford Mustang","categories":["oval"]},{"car_id":116,"car_make":"Toyota","car_model":"Supra","car_name_abbreviated":"XTS","car_name":"NASCAR XFINITY Toyota Supra","categories":["oval"]},{"car_id":117,"car_make":"Holden","car_model":"ZB Commodore","car_name_abbreviated":"HZBC","car_name":"Supercars Holden ZB Commodore","categories":["sports_car"]},{"car_id":118,"car_make":"Ford","car_model":"Mustang GT","car_name_abbreviated":"FMGT","car_name":"Supercars Ford Mustang GT","categories":["sports_car"]},{"car_id":119,"car_make":"Porsche","car_model":"718 Cayman GT4 Clubsport MR","car_name_abbreviated":"P718","car_name":"Porsche 718 Cayman GT4 Clubsport MR","categories":["sports_car"]},{"car_id":120,"car_make":"Indy Pro 2000","car_model":"PM-18","car_name_abbreviated":"PM18","car_name":"Indy Pro 2000 PM-18","categories":["formula_car"]},{"car_id":121,"car_make":"USF 2000","car_model":"PM-17","car_name_abbreviated":"PM17","car_name":"USF 2000","categories":["formula_car"]},{"car_id":122,"car_make":"BMW","car_model":"M4 GT4","car_name_abbreviated":"BMWM4","car_name":"BMW M4 GT4","categories":["sports_car"]},{"car_id":123,"car_make":"Ford","car_model":"F150","car_name_abbreviated":"F150","car_name":"NASCAR Truck Ford F150","categories":["oval"]},{"car_id":124,"car_make":"Chevrolet","car_model":"Monte Carlo","car_name_abbreviated":"C87","car_name":"NASCAR Legends Chevrolet Monte Carlo - 1987","categories":["oval"]},{"car_id":125,"car_make":"Ford","car_model":"Thunderbird","car_name_abbreviated":"F87","car_name":"NASCAR Legends Ford Thunderbird - 1987","categories":["oval"]},{"car_id":127,"car_make":"Chevrolet","car_model":"C8.R","car_name_abbreviated":"C8R","car_name":"Chevrolet Corvette C8.R GTE","categories":["sports_car"]},{"car_id":128,"car_make":"Dallara","car_model":"P217","car_name_abbreviated":"P217","car_name":"Dallara P217","categories":["sports_car"]},{"car_id":129,"car_make":"Dallara","car_model":"iR-01","car_name_abbreviated":"IR01","car_name":"Dallara iR-01","categories":["formula_car"]},{"car_id":131,"car_make":"Dirt Modified","car_model":"Big Block Modified","car_name_abbreviated":"BBM","car_name":"Dirt Big Block Modified","categories":["dirt_oval"]},{"car_id":132,"car_make":"BMW","car_model":"M4 GT3","car_name_abbreviated":"M4GT3","car_name":"BMW M4 GT3","categories":["sports_car"]},{"car_id":133,"car_make":"Lamborghini","car_model":"HuracÃ¡n GT3 EVO","car_name_abbreviated":"LGT3","car_name":"Lamborghini HuracÃ¡n GT3 EVO","categories":["sports_car"]},{"car_id":134,"car_make":"Dirt Modified","car_model":"358 Modified","car_name_abbreviated":"358MOD","car_name":"Dirt 358 Modified","categories":["dirt_oval"]},{"car_id":135,"car_make":"McLaren","car_model":"570S GT4","car_name_abbreviated":"M570S","car_name":"McLaren 570S GT4","categories":["sports_car"]},{"car_id":137,"car_make":"Porsche","car_model":"911 GT3 R","car_name_abbreviated":"PGTR","car_name":"[Legacy] Porsche 911 GT3 R","categories":["sports_car"]},{"car_id":138,"car_make":"Volkswagen","car_model":"Beetle - Lite","car_name_abbreviated":"VWBL","car_name":"VW Beetle - Lite","categories":["dirt_road"]},{"car_id":139,"car_make":"Chevrolet","car_model":"Camaro ZL1","car_name_abbreviated":"NGC","car_name":"NASCAR Cup Series Next Gen Chevrolet Camaro ZL1","categories":["oval"]},{"car_id":140,"car_make":"Ford","car_model":"Mustang","car_name_abbreviated":"NGF","car_name":"NASCAR Cup Series Next Gen Ford Mustang","categories":["oval"]},{"car_id":141,"car_make":"Toyota","car_model":"Camry","car_name_abbreviated":"NGT","car_name":"NASCAR Cup Series Next Gen Toyota Camry","categories":["oval"]},{"car_id":142,"car_make":"Formula Vee","car_model":"Formula Vee","car_name_abbreviated":"FVEE","car_name":"Formula Vee","categories":["formula_car"]},{"car_id":143,"car_make":"Porsche","car_model":"992","car_name_abbreviated":"P992","car_name":"Porsche 911 GT3 Cup (992)","categories":["sports_car"]},{"car_id":144,"car_make":"Ferrari","car_model":"Evo GT3","car_name_abbreviated":"FEVO","car_name":"Ferrari 488 GT3 Evo 2020","categories":["sports_car"]},{"car_id":145,"car_make":"Mercedes","car_model":"W12","car_name_abbreviated":"MW12","car_name":"Mercedes-AMG W12 E Performance","categories":["formula_car"]},{"car_id":146,"car_make":"Hyundai","car_model":"Elantra CN7","car_name_abbreviated":"HECN7","car_name":"Hyundai Elantra N TCR","categories":["sports_car"]},{"car_id":147,"car_make":"Honda","car_model":"Civic Type R","car_name_abbreviated":"HCTR","car_name":"Honda Civic Type R TCR","categories":["sports_car"]},{"car_id":148,"car_make":"FIA","car_model":"F4","car_name_abbreviated":"F4","car_name":"FIA F4","categories":["formula_car"]},{"car_id":149,"car_make":"Radical","car_model":"SR10","car_name_abbreviated":"SR10","car_name":"Radical SR10","categories":["sports_car"]},{"car_id":150,"car_make":"Aston Martin","car_model":"Vantage GT4","car_name_abbreviated":"AMV4","car_name":"Aston Martin Vantage GT4","categories":["sports_car"]},{"car_id":151,"car_make":"Cruze","car_model":"Chevrolet","car_name_abbreviated":"SCCC","car_name":"Stock Car Brasil Chevrolet Cruze","categories":["sports_car"]},{"car_id":152,"car_make":"Toyota","car_model":"Corolla","car_name_abbreviated":"SCTC","car_name":"Stock Car Brasil Toyota Corolla","categories":["sports_car"]},{"car_id":153,"car_make":"Hyundai","car_model":"Veloster N","car_name_abbreviated":"HVTC","car_name":"Hyundai Veloster N TCR","categories":["sports_car"]},{"car_id":154,"car_make":"Buick","car_model":"LeSabre","car_name_abbreviated":"B87","car_name":"NASCAR Legends Buick LeSabre - 1987","categories":["oval"]},{"car_id":155,"car_make":"Toyota","car_model":"Tundra TRD Pro","car_name_abbreviated":"TTP","car_name":"NASCAR Truck Toyota Tundra TRD Pro","categories":["oval"]},{"car_id":156,"car_make":"Mercedes-AMG","car_model":"GT3 Evo","car_name_abbreviated":"MGT3E","car_name":"Mercedes-AMG GT3 2020","categories":["sports_car"]},{"car_id":157,"car_make":"Mercedes-AMG","car_model":"GT4","car_name_abbreviated":"MGT4","car_name":"Mercedes-AMG GT4","categories":["sports_car"]},{"car_id":158,"car_make":"Porsche","car_model":"Porsche Mission R","car_name_abbreviated":"PMR","car_name":"Porsche Mission R","categories":["sports_car"]},{"car_id":159,"car_make":"BMW","car_model":"BMWGTP","car_name_abbreviated":"BMWGTP","car_name":"BMW M Hybrid V8","categories":["sports_car"]},{"car_id":160,"car_make":"Toyota","car_model":"GR86","car_name_abbreviated":"GR86","car_name":"Toyota GR86","categories":["sports_car"]},{"car_id":161,"car_make":"Mercedes","car_model":"W13","car_name_abbreviated":"MW13","car_name":"Mercedes-AMG W13 E Performance","categories":["formula_car"]},{"car_id":162,"car_make":"Renault","car_model":"Clio","car_name_abbreviated":"RENC","car_name":"Renault Clio","categories":["sports_car"]},{"car_id":163,"car_make":"Ray","car_model":"Ray GR22","car_name_abbreviated":"GR22","car_name":"Ray FF1600","categories":["formula_car"]},{"car_id":164,"car_model":"Late Model Stock","car_name_abbreviated":"LM23","car_name":"Late Model Stock","categories":["oval"]},{"car_id":165,"car_make":"Ligier","car_model":"JSP 320","car_name_abbreviated":"LJSP","car_name":"Ligier JS P320","categories":["sports_car"]},{"car_id":167,"car_make":"Chevrolet","car_model":"Gen 4 Cup","car_name_abbreviated":"G4CUP","car_name":"Gen 4 Cup","categories":["oval"]},{"car_id":168,"car_make":"Cadillac","car_model":"V-Series.R GTP","car_name_abbreviated":"CGTP","car_name":"Cadillac V-Series.R GTP","categories":["sports_car"]},{"car_id":169,"car_make":"Porsche","car_model":"992 GT3 R","car_name_abbreviated":"992R","car_name":"Porsche 911 GT3 R (992)","categories":["sports_car"]},{"car_id":170,"car_make":"Acura","car_model":"ARX-06 GTP","car_name_abbreviated":"AGTP","car_name":"Acura ARX-06 GTP","categories":["sports_car"]},{"car_id":171,"car_make":"Dallara","car_model":"Super Formula SF23 - Toyota","car_name_abbreviated":"SF23T","car_name":"Super Formula SF23 - Toyota","categories":["formula_car"]},{"car_id":172,"car_make":"Dallara","car_model":"Super Formula SF23 - Honda","car_name_abbreviated":"SF23H","car_name":"Super Formula SF23 - Honda","categories":["formula_car"]},{"car_id":173,"car_make":"Ferrari","car_model":"Ferrari 296 GT3","car_name_abbreviated":"F296","car_name":"Ferrari 296 GT3","categories":["sports_car"]},{"car_id":174,"car_make":"Porsche","car_model":"Porsche 963 GTP","car_name_abbreviated":"PGTP","car_name":"Porsche 963 GTP","categories":["sports_car"]},{"car_id":175,"car_make":"Pontiac","car_model":"NASCAR Legends Pontiac Grand Prix - 1987","car_name_abbreviated":"P87","car_name":"NASCAR Legends Pontiac Grand Prix - 1987","categories":["oval"]},{"car_id":176,"car_make":"Audi","car_model":"Audi R8 LMS EVO II GT3","car_name_abbreviated":"AEVO2","car_name":"Audi R8 LMS EVO II GT3","categories":["sports_car"]},{"car_id":178,"car_make":"Dallara","car_model":"324","car_name_abbreviated":"SFL324","car_name":"Super Formula Lights","categories":["formula_car"]},{"car_id":179,"car_make":"SRX","car_model":"SRX","car_name_abbreviated":"SRX","car_name":"SRX","categories":["oval"]},{"car_id":180,"car_model":"Winged","car_name_abbreviated":"MSCW","car_name":"Dirt Micro Sprint Car - Winged","categories":["dirt_oval"]},{"car_id":181,"car_model":"Non-Winged","car_name_abbreviated":"MSCNW","car_name":"Dirt Micro Sprint Car - Non-Winged","categories":["dirt_oval"]},{"car_id":182,"car_model":"Winged","car_name_abbreviated":"MSCOW","car_name":"Dirt Outlaw Micro Sprint Car - Winged","categories":["dirt_oval"]},{"car_id":183,"car_model":"Non-Winged","car_name_abbreviated":"MSCONW","car_name":"Dirt Outlaw Micro Sprint Car - Non-Winged","categories":["dirt_oval"]}];
let window_portrait = false;
if ((document.documentElement.clientWidth, window.innerWidth || 0) * 1.3 < (document.documentElement.clientHeight, window.innerHeight || 0)) {
    window_portrait = true;
};

'use strict';
(() => {
    let usernames = document.getElementsByClassName('Username')
    let authors = document.getElementsByClassName('Author')
    let author_wrap = document.getElementsByClassName('AuthorWrap')
    let cars_dict = cars_json2dict(cars_json);
    let names = []
    for (const name of usernames){
        names.push(name.firstChild.data);
    }
    for (const author of authors){
        let driver_info = 'Loading stats...<br>';
        let current_driver = author.getElementsByTagName('a')[0].innerText.replace('Loading\n\n', '');
        author.insertAdjacentHTML('beforeend', '<div class="loadingstats fwb">'+ driver_info +'</div>');
    }
    function years_diff(date) {
        let yearsDifMs = Date.now() - date;
        let yearsDate = new Date(yearsDifMs); // miliseconds from epoch
        return Math.abs(yearsDate.getUTCFullYear() - 1970);
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
    names = [...new Set(names)];
    function driver_licenses(driver){
        let license = '';
        let licenses = [];
        // console.log(driver.member_info.licenses);
        for (let i = 0; i < driver.member_info.licenses.length; i++){
            let license_class = driver.member_info.licenses[i].group_name.replace('Class ', '')
            license_class = license_class.replace('Rookie', 'R');
            license_class = license_class.replace('Pro', 'P');
            let lic_sort = 0;
            switch (sort_licenses) {
                case 1: lic_sort = Number(driver.member_info.licenses[i].irating); break;
                case 2: lic_sort = Number(driver.member_info.licenses[i].cpi); break;
                case 3: lic_sort = 20 * Math.round(driver.member_info.licenses[i].cpi) + Number(driver.member_info.licenses[i].irating); break;
            }
            licenses.push({ 'lic_sort': lic_sort,
                            'category': driver.member_info.licenses[i].category,
                            'category_name': driver.member_info.licenses[i].category_name,
                            'class': license_class,
                            'sr': driver.member_info.licenses[i].safety_rating,
                            'ir': driver.member_info.licenses[i].irating,
                            'cpi': Math.round(driver.member_info.licenses[i].cpi)});
            if (sort_licenses > 0) { licenses.sort((a,b) => b.lic_sort - a.lic_sort); }
        }
        let member_licenses=[]
        licenses.forEach((license, index) => {
            // let license_icon = '<svg viewBox="0 0 24 24" class="ir-cat-svg"><path fill-rule="evenodd" clip-rule="evenodd" d="'+ svg_d[license.category] +'" fill="currentColor"></path></svg>';
            let license_html = '<div class="license-link license-color-'+ license.class +'"> <svg class="ir-cat-svg"'+ svg_add[license.category];
            license_html += license.class + license.sr +' '+ license.ir;
            if (show_cpi) { license_html += '/'+ license.cpi; }
            license_html += '</div>'
            member_licenses.push(license_html)
        })
        return member_licenses.join(' ');
    }
    function driver_infos(driver){
        let member_years = years_diff(new Date(driver.member_info.member_since))
        let infos_html = ''+
            // '<img src="https://ir-core-sites.iracing.com/members/member_images/world_cup/club_logos/club_'+
            // driver.member_info.club_id.toString().padStart(3, '0') +'_long_0128_web.png" alt="'+ driver.member_info.club_name +'" height="24"> &nbsp; '+
            '<b>'+ driver.member_info.club_name +' </b> &nbsp; '+
            '<span title="Member since: '+ driver.member_info.member_since +'">Member: '+ member_years +' years</span> &nbsp; '+
            'Followers: '+ driver.follow_counts.followers +'/'+ driver.follow_counts.follows +' &nbsp; '+
            '<a target="_blank" href="https://members-ng.iracing.com/racing/profile?cust_id='+ driver.cust_id +'" class="driver-link"> Profile </a> &nbsp; '+
            '<a target="_blank" href="https://nyoom.app/search/'+ driver.cust_id +'" class="driver-link"> NYOOM </a> &nbsp; '+
            '<a target="_blank" href="https://members.iracing.com/membersite/member/results.jsp"'+
            ' onclick="navigator.clipboard.writeText('+ driver.cust_id +');"'+
            ' class="driver-link"> Results </a> &nbsp;';
        if (!window_portrait) {
            infos_html += '<a target="_blank" href="https://66736j0um9.execute-api.eu-central-1.amazonaws.com/0-3-1?names='+ driver.member_info.display_name +'" class="driver-link"> API </a> &nbsp; ';
        }
        return infos_html;
    }
    function driver_recent_events(driver) {
        let recent_events_html = '';
        let recent_cars_html = '';
        if (driver && driver.recent_events.length > 0) {
            console.log(driver);
			let recent_events = {
				race: [],
				hosted: [],
				league: [],
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
			let url_subsession = 'https://members.iracing.com/membersite/member/EventResult.do?subsessionid=';
			driver.recent_events.forEach((recent_event, index) => {
				if (recent_event.subsession_id > 0) {
                    let car = cars_dict[recent_event.car_id];
					let carname = car.make +' '+ car.abbr;
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
                        case 'practice': ; break;
                        case 'timetrial': ; break;
                    }
                    let tmp_html = '<a target="_blank" href="'+ url_subsession + recent_event.subsession_id +'" class="driver-link"> &nbsp;';
                    if (window_portrait) {
                        tmp_html += '<svg class="recent-svg"'+ svg_add[car.cat] +
                            ' <span class=""monospace>'+ event_type1 +' '+ event_date2 +' </span>'+ carname + event_pos +'&nbsp;</a>';
                    } else {
                        tmp_html += '<span title="'+ recent_event.event_type +' '+ event_datetime2 +' '+ recent_event.event_name +'" class="border777">';
                        tmp_html += '<svg class="recent-svg"'+ svg_add[car.cat] +
                            ' <span class=""monospace>'+ event_type1 +' '+ event_datetime2 +' </span>'+ recent_event.car_name +
                            ' @ '+ recent_event.track.track_name + event_pos +'&nbsp;</span></a>';
                    }
                    recent_events[event_type].push(tmp_html);
                    if (show_recent_type[event_type] == 1) {
                        recent_events.show1.push(tmp_html);
                        ArrayAddUniqueString(recent_cars.show1, carname);
                    } else if (show_recent_type[event_type] == 2) {
                        recent_events.show2.push(tmp_html);
                        ArrayAddUniqueString(recent_cars.show2, carname);
                    }
				}
			});
            // console.log(driver.member_info.display_name);
            // console.log(recent_events.show1.length);
            if (recent_events.show1.length > 0) {
                for (let i = 0; i < recent_events.show1.length && recent_events.show.length < show_max_recent_events; i++) {
                    recent_events.show.push(recent_events.show1[i]);
                }
            } else {
                for (let i = 0; i < recent_events.show2.length && recent_events.show.length < show_max_recent_events; i++) {
                    recent_events.show.push(recent_events.show2[i]);
                }
            }
            if (recent_cars.show1.length > 0) {
                for (let i = 0; i < recent_cars.show1.length && recent_cars.show.length < show_max_recent_cars; i++) {
                    ArrayAddUniqueString(recent_cars.show, recent_cars.show1[i]);
                }
            } else {
                for (let i = 0; i < recent_cars.show2.length && recent_cars.show.length < show_max_recent_cars; i++) {
                    ArrayAddUniqueString(recent_cars.show, recent_cars.show2[i]);
                }
            }
            // console.log(recent_cars);
            // console.log(recent_events);
            recent_cars_html += '<span>'+ recent_cars.show.join(', ') +'</span>';
			recent_events_html += '<span class="fs90">'+ recent_events.show.join('<br>') +'</span>';
		} else {
            recent_cars_html += '<b> No recent cars. </b>';
			recent_events_html += '<b> No recent events. </b>';
		}
        // console.log(recent_events_html);
        return {
            cars: recent_cars_html,
            events: recent_events_html,
        };
    }
    function getCarInfoById(carId, jsonData) {
        const carData = {};
        for (const car of jsonData) {
            carData[car.car_id] = {
                carNameAbbreviated: car.car_name_abbreviated,
                firstCategory: car.categories[0]
            };
        }
        return carData[carId] || null;
    }
    function render(data, author_wrap){
        const boxes = document.querySelectorAll('.loadingstats');
        boxes.forEach(box => { box.remove(); });
        let idx = 0;
        for (const author of authors){
            let current_driver = author.querySelector('a').innerText;
            let parentE = author.parentElement.parentElement.parentElement;
            let member = data[current_driver];
            let driver_stats = '';
            try {
                let driver_recent = driver_recent_events(member);
                driver_stats += '<span class="fwn">'+ driver_infos(member) + '</span>';
                driver_stats += '<div class="dispflex fs90">'+ driver_licenses(member) + '</div>';
                driver_stats += '<div class="dispflex">'
                driver_stats += '<div id="recent_switch_'+ idx +'" class="noselect"> <b> Recent: </b>&nbsp;</div>';
                driver_stats += '<div id="recent_cars_html_'+ idx +'" class="fwn" style="display: inline;">';
                if (show_max_recent_cars > 0) {
                    driver_stats += driver_recent.cars;
                } else {
                    driver_stats += 'No recent cars!';
                }
                driver_stats += '</div><div id="recent_events_html_'+ idx +'" class="fwn" style="display: none;">';
                if (show_max_recent_events > 0) {
                    driver_stats += driver_recent.events;
                } else {
                    driver_stats += 'No recent events!';
                }
                driver_stats += '</div>';
            } catch(error) {
                driver_stats = '<span class="fs90">Driver stats error! <a target="_blank" '+
                    'href="https://66736j0um9.execute-api.eu-central-1.amazonaws.com/0-3-1?names='+ current_driver +'"> JSON </a></span>';
                console.log(names);
                console.log(error);
            }
            //Write HTML
            let inserE = author;
            if (author.parentElement.parentElement.classList.contains('ConversationMessage')) {
                inserE = author.parentElement.parentElement;
            } else if (author.parentElement.parentElement.parentElement.classList.contains('CommentHeader')
                    || author.parentElement.parentElement.parentElement.classList.contains('DiscussionHeader')) {
                inserE = author.parentElement.parentElement.parentElement;
            }
            idx++;
            inserE.insertAdjacentHTML('beforeend','<div id="driver_infos" class="fwb fs12" >'+ driver_stats +'</div>');
        }
        // addEventListeners to buttons to switch recent cars and events
        for (let i = 0; i <= idx; i++) {
            let recent_switch = document.querySelector('#recent_switch_'+ i);
            if (recent_switch) {
                recent_switch.addEventListener('click', function() {
                    let recent_events_html = document.querySelector('#recent_events_html_'+ i);
                    let recent_cars_html = document.querySelector('#recent_cars_html_'+ i);
                    if (recent_events_html.style.display == 'none') {
                        recent_events_html.style.display = 'inline';
                        recent_cars_html.style.display = 'none';
                    } else {
                        recent_events_html.style.display = 'none';
                        recent_cars_html.style.display = 'inline';
                    }
                });
            };
        };
    };
    fetch('https://66736j0um9.execute-api.eu-central-1.amazonaws.com/0-3-1?names='+names.join(','))
        .then((response) => response.json())
        .then((data) =>render(data, author_wrap));
    console.log('Fetched')
    let x = 0
    function addGlobalStyle(css) {
        const head = document.getElementsByTagName('head')[0];
        if (!head) return;
        const style = document.createElement('style');
        style.innerHTML = css;
        head.appendChild(style);
    };
    addGlobalStyle(`
		.driver-link { color: inherit !important; font-size: inherit !important; font-weight: normal !important; /* text-decoration: underline; */ }
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
        .monospace { font-family: monospace; }
        .hide { display: none; }
        .noselect { user-select: none; }
		.border777 { border: 1px solid #777; border-radius: 6px; }
        .dispflex {display: flex; }
        .Item-Header.Item-Header { flex-wrap: wrap; }
        .ConversationMessage { flex-wrap: wrap; }
        #driver_infos { flex-basis: 100%; }
  `);
})();

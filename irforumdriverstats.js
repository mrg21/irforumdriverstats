// ==UserScript==
// @name         iR Forum user stats
// @namespace    http://tampermonkey.net/
// @version      1.09_2024-04-29
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
const show_recent_type = {
    race: 1, // 0: off, 1: on
    hosted: 1, // 0: off, 1: on, 2: only if no more major event
    league: 1, // 0: off, 1: on, 2: only if no more major event
    timetrial: 1, // 0: off, 1: on, 2: only if no more major event
    practice: 2, // 0: off, 1: on, 2: only if no more major event
};

const svg_d = {
    'oval': 'M18 7.5H6C4.34315 7.5 3 8.84315 3 10.5V11.2918C3 12.4281 3.64201 13.4669 4.65836 13.9751L7.30426 15.298C10.2603 16.776 13.7397 16.776 16.6957 15.298L19.3416 13.9751C20.358 13.4669 21 12.4281 21 11.2918V10.5C21 8.84315 19.6569 7.5 18 7.5ZM6 4.5H18C21.3137 4.5 24 7.18629 24 10.5V11.2918C24 13.5644 22.716 15.642 20.6833 16.6584L18.0374 17.9813C14.2368 19.8816 9.76324 19.8816 5.96262 17.9813L3.31672 16.6584C1.28401 15.642 0 13.5644 0 11.2918V10.5C0 7.18629 2.68629 4.5 6 4.5Z',
    'sports_car': 'M22.5 10.5H21.6215L20.1215 9H21C21.8284 9 22.5 8.32843 22.5 7.5H18.6215L18.0002 6.87868C17.4376 6.31607 16.6746 6 15.8789 6H8.12155C7.3259 6 6.56284 6.31607 6.00023 6.87868L5.37891 7.5H1.5C1.5 8.32843 2.17157 9 3 9H3.87891L2.37891 10.5H1.5C0.671573 10.5 0 11.1716 0 12V16.5C0 17.3284 0.671573 18 1.5 18H3C3.82843 18 4.5 17.3284 4.5 16.5H19.5C19.5 17.3284 20.1716 18 21 18H22.5C23.3284 18 24 17.3284 24 16.5V12C24 11.1716 23.3284 10.5 22.5 10.5ZM19.5002 10.5H4.50023L7.06066 7.93934C7.34196 7.65803 7.7235 7.5 8.12132 7.5H15.8787C16.2765 7.5 16.658 7.65804 16.9393 7.93934L19.5002 10.5ZM8.56066 12.4393L7.81066 13.1893C7.61175 13.3883 7.5 13.658 7.5 13.9393C7.5 14.5251 7.97487 15 8.56066 15H15.4393C16.0251 15 16.5 14.5251 16.5 13.9393C16.5 13.658 16.3883 13.3883 16.1893 13.1893L15.4393 12.4393C15.158 12.158 14.7765 12 14.3787 12H9.62132C9.2235 12 8.84197 12.158 8.56066 12.4393ZM4.79289 13.2071C4.60536 13.3946 4.351 13.5 4.08579 13.5H3V12H6L4.79289 13.2071ZM21 13.5H19.9142C19.649 13.5 19.3946 13.3946 19.2071 13.2071L18 12H21V13.5Z',
    'formula_car': 'M8.95381 9H7.5C6.67157 9 6 9.67157 6 10.5V12.5L4.5 13V12C4.5 11.1716 3.82843 10.5 3 10.5H1.5C0.671573 10.5 0 11.1716 0 12V16.5C0 17.3284 0.671573 18 1.5 18H3C3.82843 18 4.5 17.3284 4.5 16.5V14.5L6.03931 13.9869C6.27193 15.4122 7.50893 16.5 9 16.5H9.85714L10.0714 18H4.5C4.5 18.8284 5.17157 19.5 6 19.5H10.2857L10.2879 19.5151C10.4096 20.3671 11.1393 21 12 21C12.8607 21 13.5904 20.3671 13.7121 19.5151L13.7143 19.5H18C18.8284 19.5 19.5 18.8284 19.5 18H13.9286L14.1429 16.5H15C16.4911 16.5 17.7281 15.4122 17.9607 13.9869L19.5 14.5V16.5C19.5 17.3284 20.1716 18 21 18H22.5C23.3284 18 24 17.3284 24 16.5V12C24 11.1716 23.3284 10.5 22.5 10.5H21C20.1716 10.5 19.5 11.1716 19.5 12V13L18 12.5V10.5C18 9.67157 17.3284 9 16.5 9H15.0461L14.6711 7.5H19.5C20.3284 7.5 21 6.82843 21 6H14.2961L14.2762 5.92025C14.0675 5.08556 13.3176 4.5 12.4572 4.5H11.5428C10.6824 4.5 9.93242 5.08556 9.72375 5.92025L9.70381 6H3C3 6.82843 3.67157 7.5 4.5 7.5H9.32881L8.95381 9ZM15 10.5H16.5V13.5C16.5 14.3284 15.8284 15 15 15H14.3571L15 10.5ZM10.5 9L13.5 9L12.821 6.28405C12.7793 6.11711 12.6293 6 12.4572 6L11.5428 6C11.3707 6 11.2207 6.11711 11.179 6.28405L10.5 9ZM9 10.5H7.5V13.5C7.5 14.3284 8.17157 15 9 15H9.64286L9 10.5Z',
    'dirt_oval': 'M8 3H16C19.7712 3 21.6569 3 22.8284 4.17157C24 5.34315 24 7.22876 24 11V13C24 16.7712 24 18.6569 22.8284 19.8284C21.6569 21 19.7712 21 16 21H8C4.22876 21 2.34315 21 1.17157 19.8284C0 18.6569 0 16.7712 0 13V11C0 7.22876 0 5.34315 1.17157 4.17157C2.34315 3 4.22876 3 8 3ZM9 9H15C16.6569 9 18 10.3431 18 12C18 13.6569 16.6569 15 15 15H9C7.34315 15 6 13.6569 6 12C6 10.3431 7.34315 9 9 9ZM15 6H9C5.68629 6 3 8.68629 3 12C3 15.3137 5.68629 18 9 18H15C18.3137 18 21 15.3137 21 12C21 8.68629 18.3137 6 15 6Z',
    'dirt_road': 'M8 3H16C19.7712 3 21.6569 3 22.8284 4.17157C24 5.34315 24 7.22876 24 11V13C24 16.7712 24 18.6569 22.8284 19.8284C21.6569 21 19.7712 21 16 21H8C4.22876 21 2.34315 21 1.17157 19.8284C0 18.6569 0 16.7712 0 13V11C0 7.22876 0 5.34315 1.17157 4.17157C2.34315 3 4.22876 3 8 3ZM6 18H3V9C3 7.34315 4.34315 6 6 6H10.5C12.1569 6 13.5 7.34315 13.5 9V13C13.5 14.1046 14.3954 15 15.5 15H16C17.1046 15 18 14.1046 18 13V6H21V15C21 16.6569 19.6569 18 18 18H13.5C11.8431 18 10.5 16.6569 10.5 15V11C10.5 9.89543 9.60457 9 8.5 9H8C6.89543 9 6 9.89543 6 11V18Z',
}
const cars_json = [{"car_id":1,"car_name_abbreviated":"SBRS","car_name":"Skip Barber Formula 2000","categories":["formula_car"]},{"car_id":2,"car_make":"Modified","car_model":"SK","car_name_abbreviated":"SK","car_name":"Modified - SK","categories":["oval"]},{"car_id":3,"car_make":"Pontiac","car_model":"Solstice","car_name_abbreviated":"SOL","car_name":"Pontiac Solstice","categories":["sports_car"]},{"car_id":4,"car_name_abbreviated":"PM","car_name":"[Legacy] Pro Mazda","categories":["formula_car"]},{"car_id":5,"car_make":"Legends","car_model":"Advanced","car_name_abbreviated":"LEG","car_name":"Legends Ford '34 Coupe","categories":["oval"]},{"car_id":10,"car_make":"Pontiac","car_model":"Solstice","car_name_abbreviated":"SOL-R","car_name":"Pontiac Solstice - Rookie","categories":["sports_car"]},{"car_id":11,"car_make":"Legends","car_model":"Rookie","car_name_abbreviated":"LEG-R","car_name":"Legends Ford '34 Coupe - Rookie","categories":["oval"]},{"car_id":12,"car_make":"Chevrolet","car_name_abbreviated":"LM","car_name":"[Retired] - Chevrolet Monte Carlo SS","categories":["oval"]},{"car_id":13,"car_make":"Radical ","car_model":" ","car_name_abbreviated":"SR8","car_name":"Radical SR8","categories":["sports_car"]},{"car_id":18,"car_name_abbreviated":"SC","car_name":"Silver Crown","categories":["oval"]},{"car_id":20,"car_make":"Chevrolet","car_model":"Silverado","car_name_abbreviated":"TRUCK","car_name":"[Legacy] NASCAR Truck Chevrolet Silverado - 2008","categories":["oval"]},{"car_id":21,"car_make":"Riley","car_model":"MkXX DP","car_name_abbreviated":"DP","car_name":"[Legacy] Riley MkXX Daytona Prototype - 2008","categories":["sports_car"]},{"car_id":22,"car_make":"Chevrolet","car_model":"Impala","car_name_abbreviated":"CUP","car_name":"[Legacy] NASCAR Cup Chevrolet Impala COT - 2009","categories":["oval"]},{"car_id":23,"car_make":"SCCA Enterprises","car_name_abbreviated":"SRF","car_name":"SCCA Spec Racer Ford","categories":["sports_car"]},{"car_id":24,"car_make":"Chevrolet","car_model":"Impala SS","car_name_abbreviated":"NW09","car_name":"ARCA Menards Chevrolet Impala","categories":["oval"]},{"car_id":25,"car_make":"Lotus","car_model":"Lotus 79","car_name_abbreviated":"L79","car_name":"Lotus 79","categories":["formula_car"]},{"car_id":26,"car_make":"Chevrolet","car_model":"C6R","car_name_abbreviated":"C6R GT1","car_name":"Chevrolet Corvette C6.R GT1","categories":["sports_car"]},{"car_id":27,"car_make":"Volkswagen","car_model":"Jetta TDI","car_name_abbreviated":"VWTDI","car_name":"VW Jetta TDI Cup","categories":["sports_car"]},{"car_id":28,"car_make":"Ford","car_model":"Falcon FG01 V8","car_name_abbreviated":"V8SC","car_name":"[Legacy] V8 Supercar Ford Falcon - 2009","categories":["sports_car"]},{"car_id":29,"car_make":"Dallara","car_model":"IR-05","car_name_abbreviated":"INDY","car_name":"[Legacy] Dallara IR-05","categories":["formula_car"]},{"car_id":30,"car_make":"Ford","car_model":"FR500S","car_name_abbreviated":"FR500","car_name":"Ford Mustang FR500S","categories":["sports_car"]},{"car_id":31,"car_make":"Modified","car_model":"Tour","car_name_abbreviated":"TMOD","car_name":"Modified - NASCAR Whelen Tour","categories":["oval"]},{"car_id":33,"car_make":"Williams","car_model":"FW31","car_name_abbreviated":"FW31","car_name":"Williams-Toyota FW31","categories":["formula_car"]},{"car_id":34,"car_make":"Mazda","car_model":"MX-5 Cup","car_name_abbreviated":"MX5-C","car_name":"[Legacy] Mazda MX-5 Cup - 2010","categories":["sports_car"]},{"car_id":35,"car_make":"Mazda","car_model":"MX-5 Roadster","car_name_abbreviated":"MX5-R","car_name":"[Legacy] Mazda MX-5 Roadster - 2010","categories":["sports_car"]},{"car_id":36,"car_name_abbreviated":"SS","car_name":"Street Stock","categories":["oval"]},{"car_id":37,"car_name_abbreviated":"SPRT","car_name":"Sprint Car","categories":["oval"]},{"car_id":38,"car_make":"Chevrolet","car_name_abbreviated":"IMPB","car_name":"[Legacy] NASCAR Nationwide Chevrolet Impala - 2012","categories":["oval"]},{"car_id":39,"car_make":"HPD","car_model":"ARX-01C","car_name_abbreviated":"ARX","car_name":"HPD ARX-01c","categories":["sports_car"]},{"car_id":40,"car_make":"Ford","car_model":"GT2","car_name_abbreviated":"FGT","car_name":"Ford GT GT2","categories":["sports_car"]},{"car_id":41,"car_make":"Cadillac","car_model":"CTS-VR","car_name_abbreviated":"CTSVR","car_name":"Cadillac CTS-V Racecar","categories":["sports_car"]},{"car_id":42,"car_make":"Lotus","car_model":"Lotus 49","car_name_abbreviated":"L49","car_name":"Lotus 49","categories":["formula_car"]},{"car_id":43,"car_make":"McLaren","car_model":"MP4-12C","car_name_abbreviated":"MP4","car_name":"McLaren MP4-12C GT3","categories":["sports_car"]},{"car_id":44,"car_make":"Kia","car_model":"Optima","car_name_abbreviated":"KIAOPT","car_name":"Kia Optima","categories":["sports_car"]},{"car_id":45,"car_make":"Chevrolet","car_model":"SS","car_name_abbreviated":"CSS","car_name":"[Legacy] NASCAR Cup Chevrolet SS - 2013","categories":["oval"]},{"car_id":46,"car_make":"Ford","car_model":"Fusion-Gen6","car_name_abbreviated":"FF","car_name":"[Legacy] NASCAR Cup Ford Fusion - 2016","categories":["oval"]},{"car_id":48,"car_make":"Ruf","car_model":"AWD","car_name_abbreviated":"R12A","car_name":"Ruf RT 12R AWD","categories":["sports_car"]},{"car_id":49,"car_make":"Ruf","car_model":"RWD","car_name_abbreviated":"R12R","car_name":"Ruf RT 12R RWD","categories":["sports_car"]},{"car_id":50,"car_make":"Ruf","car_model":"Track","car_name_abbreviated":"R12T","car_name":"Ruf RT 12R Track","categories":["sports_car"]},{"car_id":51,"car_make":"Ford","car_model":"Mustang","car_name_abbreviated":"FM","car_name":"[Legacy] NASCAR Xfinity Ford Mustang - 2016","categories":["oval"]},{"car_id":52,"car_make":"Ruf","car_model":"C-Spec","car_name_abbreviated":"R12C","car_name":"Ruf RT 12R C-Spec","categories":["sports_car"]},{"car_id":54,"car_model":"Super Late Model","car_name_abbreviated":"SLM","car_name":"Super Late Model","categories":["oval"]},{"car_id":55,"car_make":"BMW","car_model":"Z4 GT3","car_name_abbreviated":"BMWZ","car_name":"[Legacy] BMW Z4 GT3","categories":["sports_car"]},{"car_id":56,"car_make":"Toyota","car_model":"Camry-Gen6","car_name_abbreviated":"TC","car_name":"NASCAR Cup Series Toyota Camry","categories":["oval"]},{"car_id":57,"car_make":"Dallara","car_model":"DW12","car_name_abbreviated":"DW12","car_name":"[Legacy] Dallara DW12","categories":["formula_car"]},{"car_id":58,"car_make":"Chevrolet","car_model":"Camaro","car_name_abbreviated":"CCB","car_name":"[Legacy] NASCAR Xfinity Chevrolet Camaro - 2014","categories":["oval"]},{"car_id":59,"car_make":"Ford","car_model":"GT3","car_name_abbreviated":"FGT3","car_name":"Ford GT GT3","categories":["sports_car"]},{"car_id":60,"car_make":"Holden","car_model":"Commodore VF","car_name_abbreviated":"HCV8","car_name":"[Legacy] V8 Supercar Holden VF Commodore - 2014","categories":["sports_car"]},{"car_id":61,"car_make":"Ford","car_model":"Falcon FG","car_name_abbreviated":"FFV8","car_name":"[Legacy] V8 Supercar Ford FG Falcon - 2014","categories":["sports_car"]},{"car_id":62,"car_make":"Toyota","car_model":"Tundra","car_name_abbreviated":"TT","car_name":"[Retired] NASCAR Gander Outdoors Toyota Tundra","categories":["oval"]},{"car_id":63,"car_make":"Chevrolet","car_model":"Silverado","car_name_abbreviated":"CS","car_name":"[Retired] NASCAR Trucks Series Chevrolet Silverado - 2018","categories":["oval"]},{"car_id":64,"car_make":"Aston Martin","car_model":"GT1","car_name_abbreviated":"AM1","car_name":"Aston Martin DBR9 GT1","categories":["sports_car"]},{"car_id":67,"car_make":"Mazda","car_model":"MX-5","car_name_abbreviated":"MX16","car_name":"Global Mazda MX-5 Cup","categories":["sports_car"]},{"car_id":69,"car_make":"Toyota","car_model":"Camry","car_name_abbreviated":"NXTC","car_name":"[Legacy] NASCAR Xfinity Toyota Camry - 2015","categories":["oval"]},{"car_id":70,"car_make":"Chevrolet","car_model":"C7 DP","car_name_abbreviated":"C7DP","car_name":"Chevrolet Corvette C7 Daytona Prototype","categories":["sports_car"]},{"car_id":71,"car_make":"McLaren","car_model":"MP4-30","car_name_abbreviated":"MP430","car_name":"McLaren MP4-30","categories":["formula_car"]},{"car_id":72,"car_make":"Mercedes","car_model":"GT3","car_name_abbreviated":"MGT3","car_name":"[Legacy] Mercedes-AMG GT3","categories":["sports_car"]},{"car_id":73,"car_make":"Audi","car_model":"R8 GT3","car_name_abbreviated":"AR8","car_name":"[Legacy] Audi R8 LMS GT3","categories":["sports_car"]},{"car_id":74,"car_make":"Renault","car_model":"Formula 2.0","car_name_abbreviated":"F20","car_name":"Formula Renault 2.0","categories":["formula_car"]},{"car_id":76,"car_make":"Audi","car_model":"90 GTO","car_name_abbreviated":"A90","car_name":"Audi 90 GTO","categories":["sports_car"]},{"car_id":77,"car_make":"Nissan","car_model":"GTP ZX-T","car_name_abbreviated":"ZXT","car_name":"Nissan GTP ZX-T","categories":["sports_car"]},{"car_id":78,"car_make":"Dirt Late Model","car_model":"350","car_name_abbreviated":"DLM350","car_name":"Dirt Late Model - Limited","categories":["dirt_oval"]},{"car_id":79,"car_name_abbreviated":"SSD","car_name":"Dirt Street Stock","categories":["dirt_oval"]},{"car_id":80,"car_make":"Dirt Sprint Car","car_model":"305","car_name_abbreviated":"DSC305","car_name":"Dirt Sprint Car - 305","categories":["dirt_oval"]},{"car_id":81,"car_make":"Ford","car_model":"Fiesta","car_name_abbreviated":"FF-WSC","car_name":"Ford Fiesta RS WRC","categories":["dirt_road"]},{"car_id":82,"car_make":"Legends","car_model":"Dirt","car_name_abbreviated":"LEG-D","car_name":"Dirt Legends Ford '34 Coupe","categories":["dirt_oval"]},{"car_id":83,"car_make":"Dirt Late Model","car_model":"358","car_name_abbreviated":"DLM358","car_name":"Dirt Late Model - Pro","categories":["dirt_oval"]},{"car_id":84,"car_make":"Dirt Late Model","car_model":"438","car_name_abbreviated":"DLM438","car_name":"Dirt Late Model - Super","categories":["dirt_oval"]},{"car_id":85,"car_make":"Dirt Sprint Car","car_model":"360","car_name_abbreviated":"DSC360","car_name":"Dirt Sprint Car - 360","categories":["dirt_oval"]},{"car_id":86,"car_make":"Dirt Sprint Car","car_model":"410","car_name_abbreviated":"DSC410","car_name":"Dirt Sprint Car - 410","categories":["dirt_oval"]},{"car_id":87,"car_make":"Dirt Sprint Car","car_model":"360 Non-Winged","car_name_abbreviated":"DS360NW","car_name":"Dirt Sprint Car - 360 Non-Winged","categories":["dirt_oval"]},{"car_id":88,"car_make":"Porsche","car_model":"911 GT3 Cup","car_name_abbreviated":"P911","car_name":"[Legacy] Porsche 911 GT3 Cup (991)","categories":["sports_car"]},{"car_id":89,"car_make":"Dirt Sprint Car","car_model":"410 Non-Winged","car_name_abbreviated":"DS410NW","car_name":"Dirt Sprint Car - 410 Non-Winged","categories":["dirt_oval"]},{"car_id":91,"car_make":"Volkswagen","car_model":"Beetle","car_name_abbreviated":"VWB","car_name":"VW Beetle","categories":["dirt_road"]},{"car_id":92,"car_make":"Ford","car_model":"GT","car_name_abbreviated":"FGT7","car_name":"Ford GTE","categories":["sports_car"]},{"car_id":93,"car_make":"Ferrari","car_model":"488 GTE","car_name_abbreviated":"488E","car_name":"Ferrari 488 GTE","categories":["sports_car"]},{"car_id":94,"car_make":"Ferrari","car_model":"488 GT3","car_name_abbreviated":"488T3","car_name":"[Legacy] Ferrari 488 GT3","categories":["sports_car"]},{"car_id":95,"car_make":"Dirt UMP Modified","car_model":"UMP Modified","car_name_abbreviated":"UMP","car_name":"Dirt UMP Modified","categories":["dirt_oval"]},{"car_id":96,"car_make":"Dirt Midget","car_model":"Dirt Midget","car_name_abbreviated":"DM","car_name":"Dirt Midget","categories":["dirt_oval"]},{"car_id":98,"car_make":"Audi","car_model":"R18","car_name_abbreviated":"AR18","car_name":"Audi R18","categories":["sports_car"]},{"car_id":99,"car_make":"Dallara","car_model":"IR18","car_name_abbreviated":"IR18","car_name":"Dallara IR18","categories":["formula_car"]},{"car_id":100,"car_make":"Porsche","car_model":"919","car_name_abbreviated":"919","car_name":"Porsche 919","categories":["sports_car"]},{"car_id":101,"car_make":"Subaru","car_model":"WRX STI","car_name_abbreviated":"WRX","car_name":"Subaru WRX STI","categories":["dirt_road"]},{"car_id":102,"car_make":"Porsche","car_model":"911 RSR","car_name_abbreviated":"RSR","car_name":"Porsche 911 RSR","categories":["sports_car"]},{"car_id":103,"car_make":"Chevrolet","car_model":"Camaro ZL1","car_name_abbreviated":"ZL1","car_name":"NASCAR Cup Series Chevrolet Camaro ZL1","categories":["oval"]},{"car_id":104,"car_model":"Pro 2","car_name_abbreviated":"PRO2","car_name":"Lucas Oil Off Road Pro 2 Truck","categories":["dirt_road"]},{"car_id":105,"car_make":"Renault","car_model":"Formula 3.5","car_name_abbreviated":"F35","car_name":"Formula Renault 3.5","categories":["formula_car"]},{"car_id":106,"car_make":"Dallara","car_model":"F317","car_name_abbreviated":"F317","car_name":"Dallara F3","categories":["formula_car"]},{"car_id":107,"car_model":"Pro 4","car_name_abbreviated":"PRO4","car_name":"Lucas Oil Off Road Pro 4 Truck","categories":["dirt_road"]},{"car_id":109,"car_make":"BMW","car_model":"M8 GTE","car_name_abbreviated":"BMWM8","car_name":"BMW M8 GTE","categories":["sports_car"]},{"car_id":110,"car_make":"Ford","car_model":"Mustang","car_name_abbreviated":"FM2019","car_name":"NASCAR Cup Series Ford Mustang","categories":["oval"]},{"car_id":111,"car_make":"Chevrolet","car_model":"Silverado","car_name_abbreviated":"CS2019","car_name":"NASCAR Truck Chevrolet Silverado","categories":["oval"]},{"car_id":112,"car_make":"Audi","car_model":"RS 3 LMS","car_name_abbreviated":"RS3","car_name":"Audi RS 3 LMS TCR","categories":["sports_car"]},{"car_id":113,"car_model":"Pro 2 Lite","car_name_abbreviated":"PRO2L","car_name":"Lucas Oil Off Road Pro 2 Lite","categories":["dirt_road"]},{"car_id":114,"car_make":"Chevrolet","car_model":"Camaro","car_name_abbreviated":"XCC","car_name":"NASCAR XFINITY Chevrolet Camaro","categories":["oval"]},{"car_id":115,"car_make":"Ford","car_model":"Mustang","car_name_abbreviated":"XFM","car_name":"NASCAR XFINITY Ford Mustang","categories":["oval"]},{"car_id":116,"car_make":"Toyota","car_model":"Supra","car_name_abbreviated":"XTS","car_name":"NASCAR XFINITY Toyota Supra","categories":["oval"]},{"car_id":117,"car_make":"Holden","car_model":"ZB Commodore","car_name_abbreviated":"HZBC","car_name":"Supercars Holden ZB Commodore","categories":["sports_car"]},{"car_id":118,"car_make":"Ford","car_model":"Mustang GT","car_name_abbreviated":"FMGT","car_name":"Supercars Ford Mustang GT","categories":["sports_car"]},{"car_id":119,"car_make":"Porsche","car_model":"718 Cayman GT4 Clubsport MR","car_name_abbreviated":"P718","car_name":"Porsche 718 Cayman GT4 Clubsport MR","categories":["sports_car"]},{"car_id":120,"car_make":"Indy Pro 2000","car_model":"PM-18","car_name_abbreviated":"PM18","car_name":"Indy Pro 2000 PM-18","categories":["formula_car"]},{"car_id":121,"car_make":"USF 2000","car_model":"PM-17","car_name_abbreviated":"PM17","car_name":"USF 2000","categories":["formula_car"]},{"car_id":122,"car_make":"BMW","car_model":"M4 GT4","car_name_abbreviated":"BMWM4","car_name":"BMW M4 GT4","categories":["sports_car"]},{"car_id":123,"car_make":"Ford","car_model":"F150","car_name_abbreviated":"F150","car_name":"NASCAR Truck Ford F150","categories":["oval"]},{"car_id":124,"car_make":"Chevrolet","car_model":"Monte Carlo","car_name_abbreviated":"C87","car_name":"NASCAR Legends Chevrolet Monte Carlo - 1987","categories":["oval"]},{"car_id":125,"car_make":"Ford","car_model":"Thunderbird","car_name_abbreviated":"F87","car_name":"NASCAR Legends Ford Thunderbird - 1987","categories":["oval"]},{"car_id":127,"car_make":"Chevrolet","car_model":"C8.R","car_name_abbreviated":"C8R","car_name":"Chevrolet Corvette C8.R GTE","categories":["sports_car"]},{"car_id":128,"car_make":"Dallara","car_model":"P217","car_name_abbreviated":"P217","car_name":"Dallara P217","categories":["sports_car"]},{"car_id":129,"car_make":"Dallara","car_model":"iR-01","car_name_abbreviated":"IR01","car_name":"Dallara iR-01","categories":["formula_car"]},{"car_id":131,"car_make":"Dirt Modified","car_model":"Big Block Modified","car_name_abbreviated":"BBM","car_name":"Dirt Big Block Modified","categories":["dirt_oval"]},{"car_id":132,"car_make":"BMW","car_model":"M4 GT3","car_name_abbreviated":"M4GT3","car_name":"BMW M4 GT3","categories":["sports_car"]},{"car_id":133,"car_make":"Lamborghini","car_model":"HuracÃ¡n GT3 EVO","car_name_abbreviated":"LGT3","car_name":"Lamborghini HuracÃ¡n GT3 EVO","categories":["sports_car"]},{"car_id":134,"car_make":"Dirt Modified","car_model":"358 Modified","car_name_abbreviated":"358MOD","car_name":"Dirt 358 Modified","categories":["dirt_oval"]},{"car_id":135,"car_make":"McLaren","car_model":"570S GT4","car_name_abbreviated":"M570S","car_name":"McLaren 570S GT4","categories":["sports_car"]},{"car_id":137,"car_make":"Porsche","car_model":"911 GT3 R","car_name_abbreviated":"PGTR","car_name":"[Legacy] Porsche 911 GT3 R","categories":["sports_car"]},{"car_id":138,"car_make":"Volkswagen","car_model":"Beetle - Lite","car_name_abbreviated":"VWBL","car_name":"VW Beetle - Lite","categories":["dirt_road"]},{"car_id":139,"car_make":"Chevrolet","car_model":"Camaro ZL1","car_name_abbreviated":"NGC","car_name":"NASCAR Cup Series Next Gen Chevrolet Camaro ZL1","categories":["oval"]},{"car_id":140,"car_make":"Ford","car_model":"Mustang","car_name_abbreviated":"NGF","car_name":"NASCAR Cup Series Next Gen Ford Mustang","categories":["oval"]},{"car_id":141,"car_make":"Toyota","car_model":"Camry","car_name_abbreviated":"NGT","car_name":"NASCAR Cup Series Next Gen Toyota Camry","categories":["oval"]},{"car_id":142,"car_make":"Formula Vee","car_model":"Formula Vee","car_name_abbreviated":"FVEE","car_name":"Formula Vee","categories":["formula_car"]},{"car_id":143,"car_make":"Porsche","car_model":"992","car_name_abbreviated":"P992","car_name":"Porsche 911 GT3 Cup (992)","categories":["sports_car"]},{"car_id":144,"car_make":"Ferrari","car_model":"Evo GT3","car_name_abbreviated":"FEVO","car_name":"Ferrari 488 GT3 Evo 2020","categories":["sports_car"]},{"car_id":145,"car_make":"Mercedes","car_model":"W12","car_name_abbreviated":"MW12","car_name":"Mercedes-AMG W12 E Performance","categories":["formula_car"]},{"car_id":146,"car_make":"Hyundai","car_model":"Elantra CN7","car_name_abbreviated":"HECN7","car_name":"Hyundai Elantra N TCR","categories":["sports_car"]},{"car_id":147,"car_make":"Honda","car_model":"Civic Type R","car_name_abbreviated":"HCTR","car_name":"Honda Civic Type R TCR","categories":["sports_car"]},{"car_id":148,"car_make":"FIA","car_model":"F4","car_name_abbreviated":"F4","car_name":"FIA F4","categories":["formula_car"]},{"car_id":149,"car_make":"Radical","car_model":"SR10","car_name_abbreviated":"SR10","car_name":"Radical SR10","categories":["sports_car"]},{"car_id":150,"car_make":"Aston Martin","car_model":"Vantage GT4","car_name_abbreviated":"AMV4","car_name":"Aston Martin Vantage GT4","categories":["sports_car"]},{"car_id":151,"car_make":"Cruze","car_model":"Chevrolet","car_name_abbreviated":"SCCC","car_name":"Stock Car Brasil Chevrolet Cruze","categories":["sports_car"]},{"car_id":152,"car_make":"Toyota","car_model":"Corolla","car_name_abbreviated":"SCTC","car_name":"Stock Car Brasil Toyota Corolla","categories":["sports_car"]},{"car_id":153,"car_make":"Hyundai","car_model":"Veloster N","car_name_abbreviated":"HVTC","car_name":"Hyundai Veloster N TCR","categories":["sports_car"]},{"car_id":154,"car_make":"Buick","car_model":"LeSabre","car_name_abbreviated":"B87","car_name":"NASCAR Legends Buick LeSabre - 1987","categories":["oval"]},{"car_id":155,"car_make":"Toyota","car_model":"Tundra TRD Pro","car_name_abbreviated":"TTP","car_name":"NASCAR Truck Toyota Tundra TRD Pro","categories":["oval"]},{"car_id":156,"car_make":"Mercedes-AMG","car_model":"GT3 Evo","car_name_abbreviated":"MGT3E","car_name":"Mercedes-AMG GT3 2020","categories":["sports_car"]},{"car_id":157,"car_make":"Mercedes-AMG","car_model":"GT4","car_name_abbreviated":"MGT4","car_name":"Mercedes-AMG GT4","categories":["sports_car"]},{"car_id":158,"car_make":"Porsche","car_model":"Porsche Mission R","car_name_abbreviated":"PMR","car_name":"Porsche Mission R","categories":["sports_car"]},{"car_id":159,"car_make":"BMW","car_model":"BMWGTP","car_name_abbreviated":"BMWGTP","car_name":"BMW M Hybrid V8","categories":["sports_car"]},{"car_id":160,"car_make":"Toyota","car_model":"GR86","car_name_abbreviated":"GR86","car_name":"Toyota GR86","categories":["sports_car"]},{"car_id":161,"car_make":"Mercedes","car_model":"W13","car_name_abbreviated":"MW13","car_name":"Mercedes-AMG W13 E Performance","categories":["formula_car"]},{"car_id":162,"car_make":"Renault","car_model":"Clio","car_name_abbreviated":"RENC","car_name":"Renault Clio","categories":["sports_car"]},{"car_id":163,"car_make":"Ray","car_model":"Ray GR22","car_name_abbreviated":"GR22","car_name":"Ray FF1600","categories":["formula_car"]},{"car_id":164,"car_model":"Late Model Stock","car_name_abbreviated":"LM23","car_name":"Late Model Stock","categories":["oval"]},{"car_id":165,"car_make":"Ligier","car_model":"JSP 320","car_name_abbreviated":"LJSP","car_name":"Ligier JS P320","categories":["sports_car"]},{"car_id":167,"car_make":"Chevrolet","car_model":"Gen 4 Cup","car_name_abbreviated":"G4CUP","car_name":"Gen 4 Cup","categories":["oval"]},{"car_id":168,"car_make":"Cadillac","car_model":"V-Series.R GTP","car_name_abbreviated":"CGTP","car_name":"Cadillac V-Series.R GTP","categories":["sports_car"]},{"car_id":169,"car_make":"Porsche","car_model":"992 GT3 R","car_name_abbreviated":"992R","car_name":"Porsche 911 GT3 R (992)","categories":["sports_car"]},{"car_id":170,"car_make":"Acura","car_model":"ARX-06 GTP","car_name_abbreviated":"AGTP","car_name":"Acura ARX-06 GTP","categories":["sports_car"]},{"car_id":171,"car_make":"Dallara","car_model":"Super Formula SF23 - Toyota","car_name_abbreviated":"SF23T","car_name":"Super Formula SF23 - Toyota","categories":["formula_car"]},{"car_id":172,"car_make":"Dallara","car_model":"Super Formula SF23 - Honda","car_name_abbreviated":"SF23H","car_name":"Super Formula SF23 - Honda","categories":["formula_car"]},{"car_id":173,"car_make":"Ferrari","car_model":"Ferrari 296 GT3","car_name_abbreviated":"F296","car_name":"Ferrari 296 GT3","categories":["sports_car"]},{"car_id":174,"car_make":"Porsche","car_model":"Porsche 963 GTP","car_name_abbreviated":"PGTP","car_name":"Porsche 963 GTP","categories":["sports_car"]},{"car_id":175,"car_make":"Pontiac","car_model":"NASCAR Legends Pontiac Grand Prix - 1987","car_name_abbreviated":"P87","car_name":"NASCAR Legends Pontiac Grand Prix - 1987","categories":["oval"]},{"car_id":176,"car_make":"Audi","car_model":"Audi R8 LMS EVO II GT3","car_name_abbreviated":"AEVO2","car_name":"Audi R8 LMS EVO II GT3","categories":["sports_car"]},{"car_id":178,"car_make":"Dallara","car_model":"324","car_name_abbreviated":"SFL324","car_name":"Super Formula Lights","categories":["formula_car"]},{"car_id":179,"car_make":"SRX","car_model":"SRX","car_name_abbreviated":"SRX","car_name":"SRX","categories":["oval"]},{"car_id":180,"car_model":"Winged","car_name_abbreviated":"MSCW","car_name":"Dirt Micro Sprint Car - Winged","categories":["dirt_oval"]},{"car_id":181,"car_model":"Non-Winged","car_name_abbreviated":"MSCNW","car_name":"Dirt Micro Sprint Car - Non-Winged","categories":["dirt_oval"]},{"car_id":182,"car_model":"Winged","car_name_abbreviated":"MSCOW","car_name":"Dirt Outlaw Micro Sprint Car - Winged","categories":["dirt_oval"]},{"car_id":183,"car_model":"Non-Winged","car_name_abbreviated":"MSCONW","car_name":"Dirt Outlaw Micro Sprint Car - Non-Winged","categories":["dirt_oval"]}];
let cars_dict = {};
for (const car of cars_json) {
    cars_dict[car.car_id] = {
        make: car.car_make || '',
        model: car.car_model || '',
        abbr: car.car_name_abbreviated,
        cat: car.categories[0]
    };
};
let window_portrait = false;
if ((document.documentElement.clientWidth, window.innerWidth || 0) * 1.2 < (document.documentElement.clientHeight, window.innerHeight || 0)) {
    window_portrait = true;
};
'use strict';
(() => {
    let usernames = document.getElementsByClassName('Username')
    let author_info = document.getElementsByClassName('Author')
    let names = []
    for (const name of usernames){
        names.push(name.firstChild.data);
    }
    for (const author of author_info){
        let driver_info = 'Loading stats...<br>';
        let current_driver = author.getElementsByTagName('a')[0].innerText.replace('Loading\n\n', '');
        author.insertAdjacentHTML('beforeend', '<div class="loadingstats fwb">'+ driver_info +'</div>');
    }
    function years_diff(date) {
        let yearsDifMs = Date.now() - date;
        let yearsDate = new Date(yearsDifMs); // miliseconds from epoch
        return Math.abs(yearsDate.getUTCFullYear() - 1970);
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
            let license_icon = '<svg viewBox="0 0 24 24" class="ir-cat-svg"><path fill-rule="evenodd" clip-rule="evenodd" d="'+ svg_d[license.category] +'" fill="currentColor"></path></svg> ';
            let license_html = '<span class="license-link license-color-'+ license.class +'">&nbsp;'+ license_icon +' &nbsp; &nbsp; &nbsp; &nbsp; '+
                license.class + license.sr;
            // if (window_portrait) { license_html += '<br>'; }
            license_html += ' '+ license.ir;
            if (show_cpi) { license_html += '/'+ license.cpi; }
            license_html += '&nbsp; </span>'
            member_licenses.push(license_html)
        })
        return member_licenses.join('&nbsp; ');
    }
    function driver_infos(driver){
        let member_years = years_diff(new Date(driver.member_info.member_since))
        let infos_html = ''+
            // '<img src="https://ir-core-sites.iracing.com/members/member_images/world_cup/club_logos/club_'+
            // driver.member_info.club_id.toString().padStart(3, '0') +'_long_0128_web.png" alt="'+ driver.member_info.club_name +'" height="24"> &nbsp; '+
            '<b>'+ driver.member_info.club_name +' </b> &nbsp; '+
            member_years +' years &nbsp; '+
            driver.follow_counts.followers +' Followers &nbsp; '+
            'Member since: '+ driver.member_info.member_since +' &nbsp; '+
            'ID: '+ driver.member_info.cust_id +' &nbsp; '+
            '<a target="_blank" href="https://nyoom.app/search/'+ driver.member_info.cust_id +'" class="driver-link"> Web profile </a> &nbsp; '+
            '<a target="_blank" href="https://members.iracing.com/membersite/member/results.jsp" class="driver-link"> Results </a> &nbsp; '+
            '<a target="_blank" href="https://66736j0um9.execute-api.eu-central-1.amazonaws.com/0-3-1?names='+ driver.member_info.display_name +'" class="driver-link"> JSON </a>';
        return infos_html;
    }
    function driver_recent_events(driver){
        let recent_events_html = '';
        if (driver.recent_events.length > 0) {
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
			let session_style = '';
            let recent_events_tmp_html = '';
			let url_subsession = 'https://members.iracing.com/membersite/member/EventResult.do?subsessionid=';
			driver.recent_events.forEach((recent_event, index) => {
				if (recent_event.subsession_id > 0) {
                    let car = cars_dict[recent_event.car_id];
					let carname = car.make +' '+ car.abbr;
                    let event_type = recent_event.event_type.toLowerCase().replace(/\s/g, '');
                    let event_type1 = recent_event.event_type[0];
					let event_dt = new Date(recent_event.start_time);
					let event_dt_string = event_dt.toISOString().slice(2, 10);
					let event_pos = '';
                    switch (event_type) {
                        case 'race': event_pos = ' S'+ (recent_event.starting_position+1) + ' F'+ (recent_event.finish_position+1); break;
                        case 'hosted': event_pos = ' S'+ (recent_event.starting_position+1) + ' F'+ (recent_event.finish_position+1); break;
                        case 'league': event_pos = ' S'+ (recent_event.starting_position+1) + ' F'+ (recent_event.finish_position+1); break;
                        case 'practice': ; break;
                        case 'timetrial': ; break;
                    }
                    let tmp_html = '<a target="_blank" href="'+ url_subsession + recent_event.subsession_id +'" class="driver-link"> &nbsp;'+
						'<span class="border777"> '+ event_type1 +' '+ event_dt_string +' '+ carname + event_pos +'&nbsp</span></a>';
                    recent_events[event_type].push(tmp_html);
                    if (show_recent_type[event_type] == 1) {
                        recent_events.show1.push(tmp_html);
                    } else if (show_recent_type[event_type] == 2) {
                        recent_events.show2.push(tmp_html);
                    }
				}
			});
            // console.log(driver.member_info.display_name);
            // console.log(recent_events.show1.length);
            if (recent_events.show1.length > 0) {
                for (var i = 0; i < recent_events.show1.length && recent_events.show.length < show_max_recent_events; i++) {
                    recent_events.show.push(recent_events.show1[i]);
                }
            } else {
                for (var j = 0; j < recent_events.show2.length && recent_events.show.length < show_max_recent_events; j++) {
                    recent_events.show.push(recent_events.show2[j]);
                }
            }
            // console.log(recent_events);
			recent_events_html += '<b> Recent: </b><span class="fs90">'+ recent_events.show.join(' '); +'</span>';
		} else {
			recent_events_html += '<b><span class="fs110"> No recent events. </b>';
		}
        // console.log(recent_events_html);
        return recent_events_html;
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
    function render(data, author_info){
        const boxes = document.querySelectorAll('.loadingstats');
        boxes.forEach(box => { box.remove(); });
        for (const driver_name of author_info){
            let current_driver = driver_name.getElementsByTagName('a')[0].innerText.replace('Loading\n\n', '');
            let member = data[current_driver];
            let driver_stats = '';
            try {
                driver_stats += '<span class="fs90">'+ driver_licenses(member) + '</span><br>';
                driver_stats += '<span class="fwn">'+ driver_infos(member) + '</span><br>';
                if (show_max_recent_events > 0) { driver_stats += '<span class="fwn">'+ driver_recent_events(member) + '</span>'; };
            } catch(error) {
                driver_stats = '<span class="fs90">Driver stats error! <a target="_blank" href="https://66736j0um9.execute-api.eu-central-1.amazonaws.com/0-3-1?names='+ current_driver +'"> JSON </a></span>';
                console.log(names);
                console.log(error);
            }
            //Write HTML
            driver_name.insertAdjacentHTML('afterend','<div class="fwb">'+ driver_stats +'</div><br>')
        }
    }
    fetch('https://66736j0um9.execute-api.eu-central-1.amazonaws.com/0-3-1?names='+names.join(','))
        .then((response) => response.json())
        .then((data) =>render(data, author_info));
    console.log('Fetched')
    let x = 0
    function addGlobalStyle(css) {
        const head = document.getElementsByTagName('head')[0];
        if (!head) return;
        const style = document.createElement('style');
        style.innerHTML = css;
        head.appendChild(style);
    }
    addGlobalStyle(`
		.driver-link { color: inherit; font-size: inherit; /* text-decoration: underline; */ }
		.license-link { border-radius: 6px; font-weight: bold; }
		.license-color-R { border: 1px solid #E1251B; background-color: #F3A8A4; color: #5D1214; }
		.license-color-D { border: 1px solid #FF6600; background-color: #FFC299; color: #692C09; }
		.license-color-C { border: 1px solid #FFCC00; background-color: #FFEB99; color: #50410A; }
		.license-color-B { border: 1px solid #33CC00; background-color: #ADEB99; color: #175509; }
		.license-color-A { border: 1px solid #006EFF; background-color: #99C5FF; color: #032F6F; }
		.license-color-P { border: 1px solid #828287; background-color: #CDCDCF; color: #37373F; }
		.ir-cat-svg { width:2em; height:2em; position:absolute; margin-top:2px; }
		.fwb { font-weight:bold; }
		.fwn { font-weight:normal; }
		.fs90 { font-size:90%; }
		.fs100 { font-size:100%; }
		.fs110 { font-size:110%; }
		.border777 { border: 1px solid #777; border-radius: 6px; }
        .ConversationMessage-content .ir-cat-svg {margin-top: -1px; height:1.9em; }
  `);
})();

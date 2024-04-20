// ==UserScript==
// @name         iR Forum user stats
// @namespace    http://tampermonkey.net/
// @version      1.03_2024-04-20
// @description  Show user stats in the iRacing forum
// @author       MR
// @match        https://forums.iracing.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// ==/UserScript==


(function() {
    'use strict';
    let svg_d = {
        'oval': 'M18 7.5H6C4.34315 7.5 3 8.84315 3 10.5V11.2918C3 12.4281 3.64201 13.4669 4.65836 13.9751L7.30426 15.298C10.2603 16.776 13.7397 16.776 16.6957 15.298L19.3416 13.9751C20.358 13.4669 21 12.4281 21 11.2918V10.5C21 8.84315 19.6569 7.5 18 7.5ZM6 4.5H18C21.3137 4.5 24 7.18629 24 10.5V11.2918C24 13.5644 22.716 15.642 20.6833 16.6584L18.0374 17.9813C14.2368 19.8816 9.76324 19.8816 5.96262 17.9813L3.31672 16.6584C1.28401 15.642 0 13.5644 0 11.2918V10.5C0 7.18629 2.68629 4.5 6 4.5Z',
        'sports_car': 'M22.5 10.5H21.6215L20.1215 9H21C21.8284 9 22.5 8.32843 22.5 7.5H18.6215L18.0002 6.87868C17.4376 6.31607 16.6746 6 15.8789 6H8.12155C7.3259 6 6.56284 6.31607 6.00023 6.87868L5.37891 7.5H1.5C1.5 8.32843 2.17157 9 3 9H3.87891L2.37891 10.5H1.5C0.671573 10.5 0 11.1716 0 12V16.5C0 17.3284 0.671573 18 1.5 18H3C3.82843 18 4.5 17.3284 4.5 16.5H19.5C19.5 17.3284 20.1716 18 21 18H22.5C23.3284 18 24 17.3284 24 16.5V12C24 11.1716 23.3284 10.5 22.5 10.5ZM19.5002 10.5H4.50023L7.06066 7.93934C7.34196 7.65803 7.7235 7.5 8.12132 7.5H15.8787C16.2765 7.5 16.658 7.65804 16.9393 7.93934L19.5002 10.5ZM8.56066 12.4393L7.81066 13.1893C7.61175 13.3883 7.5 13.658 7.5 13.9393C7.5 14.5251 7.97487 15 8.56066 15H15.4393C16.0251 15 16.5 14.5251 16.5 13.9393C16.5 13.658 16.3883 13.3883 16.1893 13.1893L15.4393 12.4393C15.158 12.158 14.7765 12 14.3787 12H9.62132C9.2235 12 8.84197 12.158 8.56066 12.4393ZM4.79289 13.2071C4.60536 13.3946 4.351 13.5 4.08579 13.5H3V12H6L4.79289 13.2071ZM21 13.5H19.9142C19.649 13.5 19.3946 13.3946 19.2071 13.2071L18 12H21V13.5Z',
        'formula_car': 'M8.95381 9H7.5C6.67157 9 6 9.67157 6 10.5V12.5L4.5 13V12C4.5 11.1716 3.82843 10.5 3 10.5H1.5C0.671573 10.5 0 11.1716 0 12V16.5C0 17.3284 0.671573 18 1.5 18H3C3.82843 18 4.5 17.3284 4.5 16.5V14.5L6.03931 13.9869C6.27193 15.4122 7.50893 16.5 9 16.5H9.85714L10.0714 18H4.5C4.5 18.8284 5.17157 19.5 6 19.5H10.2857L10.2879 19.5151C10.4096 20.3671 11.1393 21 12 21C12.8607 21 13.5904 20.3671 13.7121 19.5151L13.7143 19.5H18C18.8284 19.5 19.5 18.8284 19.5 18H13.9286L14.1429 16.5H15C16.4911 16.5 17.7281 15.4122 17.9607 13.9869L19.5 14.5V16.5C19.5 17.3284 20.1716 18 21 18H22.5C23.3284 18 24 17.3284 24 16.5V12C24 11.1716 23.3284 10.5 22.5 10.5H21C20.1716 10.5 19.5 11.1716 19.5 12V13L18 12.5V10.5C18 9.67157 17.3284 9 16.5 9H15.0461L14.6711 7.5H19.5C20.3284 7.5 21 6.82843 21 6H14.2961L14.2762 5.92025C14.0675 5.08556 13.3176 4.5 12.4572 4.5H11.5428C10.6824 4.5 9.93242 5.08556 9.72375 5.92025L9.70381 6H3C3 6.82843 3.67157 7.5 4.5 7.5H9.32881L8.95381 9ZM15 10.5H16.5V13.5C16.5 14.3284 15.8284 15 15 15H14.3571L15 10.5ZM10.5 9L13.5 9L12.821 6.28405C12.7793 6.11711 12.6293 6 12.4572 6L11.5428 6C11.3707 6 11.2207 6.11711 11.179 6.28405L10.5 9ZM9 10.5H7.5V13.5C7.5 14.3284 8.17157 15 9 15H9.64286L9 10.5Z',
        'dirt_oval': 'M8 3H16C19.7712 3 21.6569 3 22.8284 4.17157C24 5.34315 24 7.22876 24 11V13C24 16.7712 24 18.6569 22.8284 19.8284C21.6569 21 19.7712 21 16 21H8C4.22876 21 2.34315 21 1.17157 19.8284C0 18.6569 0 16.7712 0 13V11C0 7.22876 0 5.34315 1.17157 4.17157C2.34315 3 4.22876 3 8 3ZM9 9H15C16.6569 9 18 10.3431 18 12C18 13.6569 16.6569 15 15 15H9C7.34315 15 6 13.6569 6 12C6 10.3431 7.34315 9 9 9ZM15 6H9C5.68629 6 3 8.68629 3 12C3 15.3137 5.68629 18 9 18H15C18.3137 18 21 15.3137 21 12C21 8.68629 18.3137 6 15 6Z',
        'dirt_road': 'M8 3H16C19.7712 3 21.6569 3 22.8284 4.17157C24 5.34315 24 7.22876 24 11V13C24 16.7712 24 18.6569 22.8284 19.8284C21.6569 21 19.7712 21 16 21H8C4.22876 21 2.34315 21 1.17157 19.8284C0 18.6569 0 16.7712 0 13V11C0 7.22876 0 5.34315 1.17157 4.17157C2.34315 3 4.22876 3 8 3ZM6 18H3V9C3 7.34315 4.34315 6 6 6H10.5C12.1569 6 13.5 7.34315 13.5 9V13C13.5 14.1046 14.3954 15 15.5 15H16C17.1046 15 18 14.1046 18 13V6H21V15C21 16.6569 19.6569 18 18 18H13.5C11.8431 18 10.5 16.6569 10.5 15V11C10.5 9.89543 9.60457 9 8.5 9H8C6.89543 9 6 9.89543 6 11V18Z',
    }
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
        for (let i = 0; i < driver.member_info.licenses.length; i++){
            let license_class = driver.member_info.licenses[i].group_name.replace('Class ', '')
            license_class = license_class.replace('Rookie', 'R');
            license_class = license_class.replace('Pro', 'P');
            licenses.push({'weight': 15 * Math.round(driver.member_info.licenses[i].cpi) + Number(driver.member_info.licenses[i].irating),
                          'category': driver.member_info.licenses[i].category,
                          'category_name': driver.member_info.licenses[i].category_name,
                          'class': license_class,
                          'sr': driver.member_info.licenses[i].safety_rating,
                          'ir': driver.member_info.licenses[i].irating,
                          'cpi': Math.round(driver.member_info.licenses[i].cpi)})
            licenses.sort((a,b) => b.weight - a.weight);
        }
        let member_licenses=[]
        licenses.forEach((license, index) => {
            let license_icon = '<svg viewBox="0 0 24 24" class="ir-cat-svg"><path fill-rule="evenodd" clip-rule="evenodd" d="'+ svg_d[license.category] +'" fill="currentColor"></path></svg> ';
            member_licenses.push('<span class="license-link license-color-'+ license.class +'">&nbsp;'+
                license_icon +' &nbsp; &nbsp; &nbsp; &nbsp; '+ license.class + license.sr +' '+ license.ir +'&nbsp; CPI '+ license.cpi + '&nbsp;</span>')
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
				'RACE': { 'html': '', 'count': 0, },
				'TIME TRIAL': { 'html': '', 'count': 0, },
				'HOSTED': { 'html': '', 'count': 0, },
				'LEAGUE': { 'html': '', 'count': 0, },
				'PRACTICE': { 'html': '', 'count': 0, },
			};
			let session_style = '';
			let url_subsession = 'https://members.iracing.com/membersite/member/EventResult.do?subsessionid=';
			driver.recent_events.forEach((recent_event, index) => {
				if (recent_event.subsession_id > 0) {
					let carname = recent_event.car_name.replace('CTS-V Racecar', 'CTS-VR');
					let event_dt = new Date(recent_event.start_time);
					let event_dt_string = event_dt.toISOString().slice(2, 10);
					let event_pos = '';
					if (recent_event.event_type == 'RACE') {
						event_pos = ' S'+ (recent_event.starting_position+1) + ' F'+ (recent_event.finish_position+1);
					};
					recent_events[recent_event.event_type].count += 1;
					recent_events[recent_event.event_type].html  += '<a target="_blank" href="'+ url_subsession + recent_event.subsession_id +'" class="driver-link"> &nbsp;'+
						'<span class="border777"> '+ recent_event.event_type[0] + recent_events[recent_event.event_type].count +' '+ event_dt_string +' '+ carname + event_pos +' &nbsp;</span></a> ';
				}
			})
			let recent_events_str = recent_events['RACE'].html + ' '+ recent_events['TIME TRIAL'].html +' '+ recent_events['HOSTED'].html +' '+ recent_events['LEAGUE'].html;
			if (recent_events_str.replace(/\s/g, '') == '') { recent_events_str = recent_events['PRACTICE'].html };
			recent_events_html += '<b> Recent: <b><span class="fs90">'+ recent_events_str +'</span>';
		} else {
			recent_events_html += '<b class="fs110"> No recent events. <b>';
		}
        return recent_events_html;
    }
    function render(data, author_info){
        const boxes = document.querySelectorAll('.loadingstats');
        boxes.forEach(box => { box.remove(); });
        for (const driver_name of author_info){
            let current_driver = driver_name.getElementsByTagName('a')[0].innerText.replace('Loading\n\n', '');
            let member = data[current_driver];
            let driver_stats = '';
            try{
                driver_stats += '<span class="fs90">'+ driver_licenses(member) + '</span><br>';
                driver_stats += '<span class="fwn">'+ driver_infos(member) + '</span><br>';
                driver_stats += '<span class="fwn">'+ driver_recent_events(member) + '</span>';
            }catch(error){
                driver_stats = '<span class="fs90">Driver stats error! <a target="_blank" href="https://66736j0um9.execute-api.eu-central-1.amazonaws.com/0-3-1?names='+ current_driver +'"> JSON </a></span>';
                console.log(names)
                console.log(error)
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
  `);
})();

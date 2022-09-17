// ==UserScript==
// @name         irForum stats
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Provide drivers information in the forum
// @author       eXenZa
// @match        https://forums.iracing.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=iracing.com
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/exenza/irforumstats/main/irforumstats.js
// @updateURL    https://raw.githubusercontent.com/exenza/irforumstats/main/irforumstats.js
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    var usernames = document.getElementsByClassName("Username")
    var author_info = document.getElementsByClassName("Author")
    var names = []

    for (const name of usernames){
     names.push(name.firstChild.data);
    }

    function setcolor(){
        if(document.getElementsByTagName('html')[0].outerHTML.split('data-iracing-forums-user-color-scheme="dark"').length>1){
            return "lightgrey"
        } else {
            return "black"
        }
    }

        console.log(setcolor())

    function getlicense(driver, i){
            var license=driver.member_info.licenses[i].group_name.replace('Class ', '')
            license=license.replace('Rookie', 'R')
            license+=driver.member_info.licenses[i].safety_rating
            license+=" "+driver.member_info.licenses[i].irating
            return license
    }

    function render(data, author_info){
        var x=0
        for (const driver of data){
            var irstats=''
            var years=driver.member_info.member_since.split("-")
            var thisyear=new Date().getFullYear()
            years=Number(thisyear)-Number(years[0])
            irstats+=driver.member_info.club_name+" - "+years+" years ("+driver.member_info.member_since+")"
            irstats+='<br>Most recent '+driver.recent_events[0].event_name+' ('+driver.recent_events[0].event_type+') at '+driver.recent_events[0].track.track_name+' on the '+driver.recent_events[0].car_name
            irstats+="<br>Oval: "+getlicense(driver, 0)+" - Dirt Oval: "+getlicense(driver, 2)+" /-/ Dirt Road: "+getlicense(driver, 3)+" - Road: "+getlicense(driver, 1)
            author_info[x].insertAdjacentHTML('beforeend',"<div style='color:"+setcolor()+";font-weight:bold;'>"+irstats+"</div>")
            x++
        }
    }


    fetch('https://66736j0um9.execute-api.eu-central-1.amazonaws.com/prod?names='+names.join(','))
    .then((response) => response.json())
    .then((data) =>render(data, author_info));
    console.log("Fetched")
    var x = 0
})();

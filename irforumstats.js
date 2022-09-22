// ==UserScript==
// @name         irForum stats
// @namespace    http://tampermonkey.net/
// @version      0.3.2
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
    var usernames = document.getElementsByClassName("Username")
    var author_info = document.getElementsByClassName("Author")
    var names = []
    for (const name of usernames){
        names.push(name.firstChild.data);
    }

    for (const author of author_info){
        var irstats="<br>Loading stats...<br><br>"
        var current_driver=author.getElementsByTagName('a')[0].innerText.replace("Loading\n\n", "")
        author.insertAdjacentHTML('beforeend',"<div class='loadingstats' style='color:"+setcolor()+";font-weight:bold;'>"+irstats+"</div>")
    }

    names = [...new Set(names)];
    function setcolor(){
        if(document.getElementsByTagName('html')[0].outerHTML.split('data-iracing-forums-user-color-scheme="dark"').length>1){
            return "lightgrey"
        } else {
            return "black"
        }
    }

    function getlicense(driver, i){
        var license=driver.member_info.licenses[i].group_name.replace('Class ', '')
        license=license.replace('Rookie', 'R')
        license+=driver.member_info.licenses[i].safety_rating
        license+=" "+driver.member_info.licenses[i].irating
        return license
    }

    function render(data, author_info){
        const boxes = document.querySelectorAll('.loadingstats');

        boxes.forEach(box => {
            box.remove();
        });
        for (const driver_name of author_info){
            var current_driver=driver_name.getElementsByTagName('a')[0].innerText.replace("Loading\n\n", "")
            var driver_stats=data[current_driver]
            // Set driver stats
            var irstats=''
            try{
                var years=driver_stats.member_info.member_since.split("-")
                var thisyear=new Date().getFullYear()
                years=Number(thisyear)-Number(years[0])
                irstats+=driver_stats.member_info.club_name+" - "+years+" years ("+driver_stats.member_info.member_since+")"
                if(driver_stats.recent_events.length>0){
                    var results=""
                    if(driver_stats.recent_events[0].subsession_id > 0){
                        results=' - <a href="#" onclick="window.open(\'https://members.iracing.com/membersite/member/EventResult.do?subsessionid='+driver_stats.recent_events[0].subsession_id+'\')" style="color:'+setcolor()+';" >RESULTS</a>'
                    }

                    irstats+='<br>Most recent '+driver_stats.recent_events[0].event_name+' ('+driver_stats.recent_events[0].event_type+') at '+driver_stats.recent_events[0].track.track_name+' on the '+driver_stats.recent_events[0].car_name+results

                } else {
                    irstats+="<br>No recent events."
                }
                irstats+="<br>Oval: "+getlicense(driver_stats, 0)+" - Dirt Oval: "+getlicense(driver_stats, 2)+" /-/ Dirt Road: "+getlicense(driver_stats, 3)+" - Road: "+getlicense(driver_stats, 1)
            }catch{
                irstats="<br>iRacing Maintenance<br><br>"
            }
            //Write HTML
            driver_name.insertAdjacentHTML('beforeend',"<div style='color:"+setcolor()+";font-weight:bold;'>"+irstats+"</div>")
        }
    }


    fetch('https://66736j0um9.execute-api.eu-central-1.amazonaws.com/0-3-1?names='+names.join(','))
        .then((response) => response.json())
        .then((data) =>render(data, author_info));
    console.log("Fetched")
    var x = 0
    })();

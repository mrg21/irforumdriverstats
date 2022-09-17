// ==UserScript==
// @name         irForum stats
// @namespace    http://tampermonkey.net/
// @version      0.1
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

    function render(data, author_info){
        var x=0
        for (const driver of data){
            //Oval
            var oval=driver.member_info.licenses[0].group_name
            oval+=" "+driver.member_info.licenses[0].safety_rating
            oval+=" "+driver.member_info.licenses[0].irating
            //Dirt Oval
            var dirt_oval=driver.member_info.licenses[2].group_name
            dirt_oval+=" "+driver.member_info.licenses[2].safety_rating
            dirt_oval+=" "+driver.member_info.licenses[2].irating
            //Dirt Road
            var dirt_road=driver.member_info.licenses[3].group_name
            dirt_road+=" "+driver.member_info.licenses[3].safety_rating
            dirt_road+=" "+driver.member_info.licenses[3].irating
            //Road
            var road=driver.member_info.licenses[1].group_name
            road+=" "+driver.member_info.licenses[1].safety_rating
            road+=" "+driver.member_info.licenses[1].irating
            author_info[x].insertAdjacentHTML('beforeend',"<div style='color:lightgrey;font-weight:bold;'>"+driver.member_info.club_name+" > Oval: ["+oval+"] - Dirt Oval: ["+dirt_oval+"] - Dirt Road: ["+dirt_road+"] - Road: ["+road+"]</div>")
            x++
        }
    }


    fetch('https://66736j0um9.execute-api.eu-central-1.amazonaws.com/prod?names='+names.join(','))
    .then((response) => response.json())
    .then((data) =>render(data, author_info));
    console.log("Fetched")
    var x = 0
})();

# HTML5 microdata testing tool #

To see this tool in action, visit [http://krofdrakula.github.com/microdata-tool](http://krofdrakula.github.com/microdata-tool).

This tool was written to aid in debugging and browsing HTML5 microdata.

To use this tool, simply include the script anywere after the inclusion
of the [jQuery](http://jquery.com) library. When you view the page, a list
will appear in the bottom left listing all the microdata objects detected
on the page.

In addition, you need to provide the schemas to validate against; some are already
implemented in `schemas.js` which is to be included immediately after the
`jquery.microdata.js` script. To add your own, you can use the
`$.microdata.addDefinition(url, fields)` function as used in `schemas.js`.

This tool is a work-in-progress and still doesn't adhere to the full specs (yet).
Plans to support the full microdata spec + data vocabulary validation are on
the drawing board. ;)

Thanks to @peterhost we now have a bookmarklet available (source: https://gist.github.com/1397528) for your use without
having to modify your page's source code! Simply [drag this link](javascript: (function(){function a(a,b){var c=document.createElement("script");c.src=a;var d=document.getElementsByTagName("head")[0],e=!1;c.onload=c.onreadystatechange=function(){!e&&(!this.readyState||this.readyState==="loaded"||this.readyState==="complete")&&(e=!0,b(),c.onload=c.onreadystatechange=null,d.removeChild(c))},d.appendChild(c)}function b(){c.innerHTML=msg,d.appendChild(c),window.setTimeout(function(){typeof jQuery=="undefined"?d.removeChild(c):(jQuery(c).fadeOut("slow",function(){jQuery(this).remove()}),otherlib&&($jq=jQuery.noConflict()))},2500)}var c=document.createElement("div"),d=document.getElementsByTagName("body")[0];otherlib=!1,msg="",c.style.position="fixed",c.style.height="32px",c.style.width="220px",c.style.marginLeft="-110px",c.style.top="0",c.style.left="50%",c.style.padding="5px 10px",c.style.zIndex=1001,c.style.fontSize="12px",c.style.color="#222",c.style.backgroundColor="#f99",typeof jQuery!="undefined"?(msg="This page already using jQuery v"+jQuery.fn.jquery+"... proceeding",b()):(typeof $=="function"&&(otherlib=!0),a("http://code.jquery.com/jquery-latest.min.js",function(){return typeof jQuery=="undefined"?msg="Sorry, but jQuery wasn't able to load":(msg="This page is now jQuerified with v"+jQuery.fn.jquery,otherlib&&(msg+=" and noConflict(). Use $jq(), not $().")),b()})),typeof $=="function"&&(otherlib=!0),a("https://github.com/KrofDrakula/microdata-tool/raw/master/jquery.microdata.js",function(){return typeof $.microdata=="undefined"?msg="Sorry, but jquery.microdata.js wasn't able to load":msg="jquery.microdata.js loaded "}),typeof $=="function"&&(otherlib=!0),a("https://github.com/KrofDrakula/microdata-tool/raw/master/schemas.js",function(){return typeof $.microdata=="undefined"?msg="Sorry, but schema.js wasn't able to load":msg="schema.js loaded "})})();)
to your bookmarks bar and you're set to go.
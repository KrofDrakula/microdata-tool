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

Thanks to [@peterhost](https://github.com/peterhost) we now have a bookmarklet available 
(source: https://gist.github.com/1397528) for your use without having to modify your page's source code!
Simply visit [this page](http://jsfiddle.net/peterhost/ZJfpL/14/embedded/result/) and drag
the link to your bookmark bar and you're set to go.

6.03.2014 - Changes made by Evgeniy Orlov, chilly_bang@yahoo.de

-- schemas.js:  Added 106 new classes with properties accordingly to official Schema Version 1.0f

-- jquery.microdata.js:  Added validations for number and data

-- file schemas-stub.js added. File contains the part of code for adding new classes/properties to schemas.js.
For adding new classes/properties: open schemas-stub.js, copy and edit code, add the code to schemas.js, like it done there.

-- [Go to this page and drop the given link to your bookmarks](http://jsfiddle.net/chilly_bang/mf3xt/embedded/result/) This bookmarklet works with updated and enriched schemas.js and jquery.microdata.js and is based on this one from [@peterhost](https://gist.github.com/1397528). 

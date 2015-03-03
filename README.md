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

# Looking for maintainers for this project!

Due to other obligations taking up my time I haven't been as responsive as I
would have liked to be, so I've decided to open up this repository to someone
willing to maintain it. If you think you can pick up the workload, please
[contact me](https://github.com/KrofDrakula).

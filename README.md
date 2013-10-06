Huemulator
==========

Huemulator acts as an emulator for the [Philips Hue](http://www.meethue.com/) bridge.

It isn't a complete implementation, specifically the schedule API is not yet implemented
but most of the rest of the API is there.

It runs as a node application, and you just connect your browser to it to see the current status.
Each API call that is made to the emulator is mirrored on the web display, to ease debugging.  
Details of the request and response are given if you click on the individual call.  

Additional lights can be added on the website by clicking the "Add Light" button. There is no limit 
to the number of lights you can add (unlike with the official Hue bridge), but they won't all display 
at the moment.  

The emulator is discoverable in the same way as the normal bridge is, so your standard UPnP discovery 
library should discover the emulator just as it would the bridge.

Installation
------------

Huemulator is a [node.js](http://www.nodejs.org) application, so you need to install node.js first.
Then you can just

    npm install -g huemulator

Running
-------

Once installed, on Linux or Mac just run

    sudo huemulator

You need the sudo because it listens per-default on port 80.  You can specify a port on the command line if 
you don't want to run it on port 80, but bear in mind that there appears to be limitations with the SDK if
you're not running your bridge on port 80 (there's obviously nothing wrong with running it on another port, as
long as your library supports it, it should be fine).

On Windows, you'll probably need to run the huemulator command from a command prompt with administrator privileges.
I've not tested this yet though.

Known Issues
------------

The colour conversion routines are not right yet, specifically when you use the XY coordinates, the red component 
will be wrong (a green XY for example, has a considerable red component).  The RGB values that come out of the
conversion routine are also scaled incorrectly.  I've posted a [question to Philips](http://www.everyhue.com/?page_id=38#/discussion/1192/issue-with-xy-to-rgb-conversion) regarding this.

The CT colour conversion is also a very rough approximation, and meant only to show a ball park colour. 
If I get some more information on how to properly convert the CT colour, I'll add it in (pull requests are welcome!)

The schedule API is not implemented at all.

Transitions, effects and alerts are not yet implemented.  These would be a nice addition if anyone has time.

I've tested the emulator with the official Hue android app, and it works as expected (aside from the
issues already discussed.)

It only supports the normal light bulb, not the strips. This could be added quite easily, once the colour conversion
is fixed.

Contributing
------------

Pull requests and issue reports are welcome.  We specifically need help fixing the colour conversion routines in
api/utility/color.js.  There is some information on [the Philips developer site](http://developers.meethue.com/coreconcepts.html), and more in the [application design note for color conversion](https://github.com/PhilipsHue/PhilipsHueSDKiOS/blob/master/ApplicationDesignNotes/RGB%20to%20xy%20Color%20conversion.md)

If you own a hue, once we've got the colour conversions corrected, it would be great to compare the colours displayed
and see if we can get them as near to the real thing as possible.


Disclaimer
----------

The is a weekend hack to better explore the Philips API, and have a better play with [Angular.JS](http://www.angularjs.org), as such, things might not be too smooth or there may be issues lurking.  I went against my principals and didn't 
write tests, as there were too many new libraries for me to fight with. Sorry. When I'm more comfortable with the libraries, I'll restructure it a bit so that it's more testable, and write some proper tests.



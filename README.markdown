# TipTap.js

The TipTap library was created to ease the pain when dealing with advanced tapping on mobile devices. It does this by giving you transparent access to new fancy tap events fired using regular DOM events. It also integrates the immensely good $1 Unistroke recognizer with the Protractor enhancement, meaning a crazy fast unistroke recognizer you can throw on any element by adding the class <code>strokable</code> to it.

Check out the [demo](http://link/to/demo), especially on your iOS device. Android support is currently somewhat wonky.

# New tap events

TipTap gives you the following crafted touch events. Events using more than one finger is prefixed with the number of fingers, like twofingertap and threefingerdoubletap.

Available events are:

- tap
- taphold
- doubletap
- tripletap
- quadtap
- swipeleft
- swiperight

and all the custom stroke events included and the ones you add yourself.

# TODO

* Make it work properly on Android

# License
MIT License

# Included projects
The $1 Unistroke Recognizer - Copyright (c) 2007-2011, Jacob O. Wobbrock, Andrew D. Wilson and Yang Li. Released under New BSD License

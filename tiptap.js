(function (document, Object) {
    var hasTouch = 'ontouchstart' in document.documentElement,
        startEvent = hasTouch ? 'touchstart' : 'mousedown',
        moveEvent = hasTouch ? 'touchmove' : 'mousemove',
        endEvent = hasTouch ? 'touchend' : 'mouseup',
        slice = Array.prototype.slice,
        addEventListener = 'addEventListener',

        recognizer = typeof DollarRecognizer !== "undefined" && new DollarRecognizer();

    // document.elementFromPoint wants different arguments depending on browser. This should use some clever feature detection instead of sniffing.
    var elementFromWhat = /safari|opera|chrome/i.test(navigator.userAgent) ? 'client' : 'page',
		iphone = /iphone|ipad|ipod/i.test(navigator.userAgent),
		whatX = elementFromWhat + 'X',
		whatY = elementFromWhat + 'Y';

        // Name maps
        numTapMap = {
            2: 'double',
            3: 'triple',
            4: 'quad',
			5: 'quint'
        },
        numFingerMap = {
            2: 'twofinger',
            3: 'threefinger',
            4: 'fourfinger',
			5: 'fivefinger'
        };

    function getEventNameFromGroups(groups, tapHold) {
        var arr = Object.keys(groups).map(function (key) {
                return groups[key];
            }),
            num, fingers, name = false;

        if (arr.length > 5) {
            name = 'supercustom';
            //implement tap-to-note algorithm :)
        } else if ((num = arr.length) && (fingers = arr[0])) {
            name = (numFingerMap[fingers] || '') + (numTapMap[num] || '') + 'tap' + (tapHold ? 'hold' : '');
        }
        return name;
    }

    function getTouches(e, t) {
        return e[t = 'changedTouches'] ? slice.call(e[t]) : [e];
    }

    function fireEvent(target, name) {
        if (!(target && name)) {
            return;
        }
        var customEvent = document.createEvent("Events");
        
		if(name && target){
			target = (target.nodeType == 3 ? target.parentNode : target);
			target.dispatchEvent(customEvent, customEvent.initEvent(name, true, true));
		}
     
    }

    function fireUniqueTapEvent(groups, target, direct, tapHold) {
        if (
        		direct || 
				(
					(
						((keys = Object.keys(groups)).length > 1) || 
						((keys && groups[keys[0]]) > 1)
					) && 
					(str = JSON.stringify(groups)) && 
					(!groupMap[str]) && 
					(groupMap[str] = true)
				)
		) {
            var name = getEventNameFromGroups(groups, tapHold);
            fireEvent(target, name);
        }
    }

    var touchTimer, clearTimer, canvas, ctx,
		touches = {},
        longGroups = {},
        groupMap = {},
        
		clearQueue = [],
        distanceThreshold = 20,
		swipeThreshold = 30,
        identifier = 'identifier';
        
    document[addEventListener](startEvent, function (e) {
		
        var t, o, el, parent, gesture,
			ts = getTouches(e),
            i = ts.length,
            docEl = document.documentElement,
            reGestureClass = /(^|\s)strokable(\s|$)/;

        while ((t = ts[--i])) {
	
            if (touches[t[identifier]]) {
                o = touches[t[identifier]];
                o.touches++;
                o.changed = true;
                o.gesture = gesture = false;
            } else {
	
                parent = t.target;
                gesture = false;
                do {
                    if (reGestureClass.test(parent.className)) {
                        gesture = true;
                    }
                } while (!gesture && (parent !== docEl) && (parent = parent.parentNode));

                o = {
                    start: Date.now(),
                    startX: t[whatX],
                    startY: t[whatY],
                    touches: 1,
                    groups: [],
                    changed: true,
                    gesture: gesture
                };

                Object.keys(t).forEach(function (key) {
                    o[key] = t[key];
                });
                touches[t[identifier]] = o;
            }
            o.touching = true;
            o.moveX = o.moveY = false;
            o.points = [];
            o.d = 0;

            if (gesture) {
                if (hasTouch) {
                    e.preventDefault(); // Prevent scrolling on touch devices
                }

                if (!canvas) {
                    canvas = document.createElement('canvas');
                    canvas.style.position = 'absolute';
                    canvas.style.top = '0px';
                    canvas.style.left = '0px';
                    canvas.style.zIndex = '10000';
                    canvas.style.pointerEvents = 'none';

                    ctx = canvas.getContext("2d");
					ctx.dy = 0;
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;

                    document.body.appendChild(canvas);
                } else {
                    canvas.width = window.innerWidth;
                    ctx = canvas.getContext("2d");
                    ctx.beginPath();
                }

				ctx.dy = 0; // iphone ? window.pageYOffset : 0; // This is not needed anymore
				canvas.style.top = window.pageYOffset + 'px';

                ctx.strokeStyle = "#9ed5ff";
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(o.startX, o.startY - ctx.dy);
            }
        }

        if (!touchTimer) {
            var str,
				loopIndex = 0,
                deletes = {},
                cleanse, intervalLength = 50,
                cleanseEvery = 7;

            touchTimer = setInterval(function () {
                var ts = Object.keys(touches).map(function (key) {
                    	return touches[key];
                	}),
                    ended = ts.filter(function (t) {
                        return t.end && (t.changed && ((t.changed = false) || true));
                    }),
                    stationary = ended.filter(function (t) {
                        var d = Math.abs(t.endX - t.startX) + Math.abs(t.endY - t.startY);

                        t.group = loopIndex;
                        t.groups.push(loopIndex);
                        return d < distanceThreshold;
                    }),
                    now = Date.now(),
                    tapHolds = ts.filter(function (t) {
                        return !t.tapHold && !t.end && (now - t.start > intervalLength * cleanseEvery) && (!(t.moveX && t.moveY) || (Math.abs(t.moveX - t.startX) + Math.abs(t.moveY - t.startY)) < distanceThreshold);
                    });

                if (tapHolds.length) {

                    var tapHoldX = 0,
                        tapHoldY = 0,
                        len = tapHolds.length;

                    tapHolds = tapHolds.map(function (t) {
                        tapHoldX += t.startX;
                        tapHoldY += t.startY;
                        t.tapHold = true;
                        return t;
                    });

                    var target = document.elementFromPoint(tapHoldX / len, tapHoldY / len);
                    fireUniqueTapEvent({
                        0: len
                    }, target, true, true);
                }

                if (ended.length) {
                    deletes[loopIndex + cleanseEvery] = ended;
                }

                if ((cleanse = deletes[loopIndex]) && cleanse.length) {
                    var startTime = cleanse[0].start,
                        endTime = Date.now(),
                        groups = {},
                        x = 0,
                        y = 0,
                        len = 0;

                    ts.filter(function (o) {
                        return o.end && o.end <= endTime && o.start >= startTime;
                    }).forEach(function (t) {
                        t.groups.forEach(function (g) {
                            groups[g] = (groups[g] || 0) + 1;
                        });

                        x += t.startX;
                        y += t.startY;
                        len++;
                    });

                    for (var p in groups) {
                        longGroups[p] = groups[p];
                    }

                    var target = document.elementFromPoint(x / len, y / len);
                    fireUniqueTapEvent(groups, target);


                    clearQueue = clearQueue.concat(cleanse);
                    delete deletes[loopIndex];

                    if (clearTimer) {
                        clearTimeout(clearTimer);
                    }
                    clearTimer = setTimeout(function () {
                        clearQueue.forEach(function (t) {
                            delete touches[t[identifier]];
                        });
                        clearQueue = [];

                        if (!Object.keys(touches).length) {
                            fireUniqueTapEvent(longGroups, target);

                            clearInterval(touchTimer);
                            touchTimer = null;
                            longGroups = {};
                            groupMap = {};
                        }

                    }, intervalLength * cleanseEvery);

                }

                ++loopIndex;

            }, intervalLength);

        }
    }, false);

    document[addEventListener](moveEvent, function (e) {
        var t, o, el,
			ts = getTouches(e),
            i = ts.length;

        while ((t = ts[--i])) {
	
            if ((o = touches[t[identifier]])) {
				if (hasTouch && o.gesture) {
                    e.preventDefault();
                }

                if ((!hasTouch && !o.touching) || Math.abs(t[whatX] - o.moveX) + Math.abs(t[whatY] - o.moveY) < 4) {
                    return;
                }

                if (o.gesture) {
                    ctx.beginPath();
                    if (o.moveX||o.moveY) {
						ctx.moveTo(o.moveX, o.moveY - ctx.dy);
                    }
                    ctx.lineTo(t[whatX], t[whatY] - ctx.dy);
                    ctx.stroke();
                    ctx.closePath();
                }

                o.d += Math.abs(t[whatX] - o.moveX) + Math.abs(t[whatY] - o.moveY);
                o.moved = true;
                o.moveX = t[whatX];
                o.moveY = t[whatY];

                o.points.push({
                    X: o.moveX,
                    Y: o.moveY
                });
            }
        }
    }, false);

    document[addEventListener](endEvent, function (e) {
        var t, o, el, 
			ts = getTouches(e),
            i = ts.length,
            groups = {};


        while ((t = ts[--i])) {
            o = touches[t[identifier]] || {};
            o.end = Date.now();
            o.endX = t[whatX];
            o.endY = t[whatY];

            if (Math.abs(o.endX - o.startX) + Math.abs(o.endY - o.startY) < distanceThreshold) {
                groups[i] = 1;
            }

            if (o.gesture) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

				if(o.points && o.points.length && recognizer){
					var res = recognizer.Recognize(o.points);
	                if (res && res.Name) {
	                    fireEvent(o.target, res.Name.toLowerCase().replace(/\W+/g, ''));
	                }
				}
				
            }
        }

		if (o && (Math.abs(o.endX - o.startX) > swipeThreshold)){
			fireEvent(o.target, (numFingerMap[Object.keys(touches).length]||'')+'swipe' + (o.endX > o.startX ? 'right' : 'left'));
		}

        o.touching = false;
        o.d < distanceThreshold && fireUniqueTapEvent(groups, o.target, true);
    }, false);

})(document, Object);
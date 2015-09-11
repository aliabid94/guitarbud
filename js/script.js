var bcanvas = document.getElementById('back-canvas');
var bcontext = bcanvas.getContext('2d');
var fcanvas = document.getElementById('front-canvas');
var fcontext = fcanvas.getContext('2d');
var tab;
var tablen;
var start = null;
var playLoc = 0;
var dfs = 7;
var spf = 100;
var speed = 3.5;
var scale = 1;
var xoff = -14;
var yoff;
var scaleLength = 510;
var lastkey = [0,0,0,0,0,0];
var alllastkey;
var lastpluck = ['*',0,'*',0,'*',0,'*',0,'*',0,'*',0];
var lastfinger = ["*","*","*","*","*"];
var alllastfinger;
var progress = 0;
var lastpoint=0;
var mx = 0;
var my = 0;
var smx = 0;
var smy = 0;
var mousedown = false;
var mouseclick = false;
var looping=false;
var acoustic;
var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var tuning = [["E", 4],["B",3],["G",3],["D",3],["A",2],["E",2]];
var stringsnom = "zyxwvu";
var fingerrels = [[-6,-10],[-20,-16],[-32,-13],[-40,2],[3,-35]];
var fingernames = "1234T"

$(window).resize(function(){
	drawGuitarPic();
});

$("#left-control a").click(function () {

	if ($(this).hasClass("faster") && spf < 200)
	{
		spf += 20;
	} 
	else if ($(this).hasClass("slower") && spf > 20)
	{
		spf -= 20;
	} 
	else if ($(this).find("div").hasClass("speed-marker"))
	{
		spf = 100;
	}
	if (speed != 0)
	{
		speed = dfs * spf / 100;
	}
	$(".speed-marker").html(spf + "%")
});

$("#right-control a").click(function () {
	if ($(this).find("div").hasClass("control-btn-selected")) 
	{
		$(this).find("div").removeClass("control-btn-selected");
	}
	else
	{
		$(this).find("div").addClass("control-btn-selected");		
	}
});

$("#mid-control .pause").click(pausefunc);

function pausefunc() {
	speed = 0;
	$("#mid-control .pause-set").hide();
	$("#mid-control .play-set").show();	
}

$("#mid-control .play").click(playfunc);


function playfunc() {
	speed = dfs * spf / 100;
	$("#mid-control .play-set").hide();
	$("#mid-control .pause-set").show();
}

$("#loop").click(loopfunc);

$("#prev-step").click(function() {
	progress = Math.max(progress-1000, 0)
});
$("#next-step").click(function() {
	progress = progress+1000;
});


function loopfunc() {
	looping = !looping;
}

$(document).ready(function() {
	$("#mid-control .pause-set").hide();
	speed = 0;
	fcanvas.addEventListener('mousemove', function(evt) {
		var mousePos = getMousePos(bcanvas, evt);
		mx = mousePos.x;
		my = mousePos.y;
		smx = mx/scale - xoff;
		smy = my/scale - yoff;		
	});
	fcanvas.addEventListener('mousedown', function(evt) {
		mousedown = true;
	});
	fcanvas.addEventListener('mouseup', function(evt) {
		if (mousedown = true)
		{
			mousedown = false;
			mouseclick = true;
		}
	});
	acoustic = Synth.createInstrument('acoustic');
	Synth.setVolume(0.20);
});

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
	};
}

function drawGuitarPic()
{
	fitToContainer(bcanvas);
	fitToContainer(fcanvas);
	var guitarLength = 580;
	scale = bcanvas.width / guitarLength;
	bcontext.clearRect(0, 0, bcanvas.width, bcanvas.height);
	yoff = bcanvas.height/2/scale - 25/scale;
	bcontext.scale(scale, scale);
	bcontext.translate(xoff, yoff);
	fcontext.scale(scale, scale);
	fcontext.translate(xoff, yoff);
	drawFullGuitar(bcontext, 1, 0, 0);
}

function playTab2(speed, newTab)
{
	var ptab1 = newTab.split("#");
	tablen = ptab1[0].length;
	tab = makeArray(tablen, 6);
	for (i=0; i<ptab1.length; i++)
	{
		istr = ptab1[i];
		lnum = istr.charAt(0);
		if (lnum == "T") lnum = 5;
		if (lnum == "S") lnum = 6;
		lnum = lnum - 1;
		for (j=2; j<istr.length; j++)
		{
			if (istr.charAt(j) != "-")
			{
				var lenm = tab[lnum][j] = istr.substring(j, istr.indexOf("-", j));
				j += lenm.length - 1;
			}
		}
	}
	createAllLocs();
	window.requestAnimationFrame(play2);
}

function play2(timestamp)
{
	if (!start) start = timestamp;
	var curpoint = timestamp - start;
	progress += (curpoint - lastpoint) * speed;
	if (progress > tablen * 1000)
	{
		progress -= tablen * 1000;
		lastkey = [0,0,0,0,0,0];
		lastpluck = ['*',0,'*',0,'*',0,'*',0,'*',0,'*',0];
		lastfinger = ["*","*","*","*","*","*"];
		if (!looping)
		{
			pausefunc();
		}
	}
	lastpoint = curpoint;
	var nextPlayLoc = Math.floor(progress / 1000);
	if (nextPlayLoc != playLoc)
	{
		lastfinger = alllastfinger[nextPlayLoc];
		lastkey = alllastkey[nextPlayLoc];
		var pluckvals = tab[5][nextPlayLoc];
		if (pluckvals != null) 
		{
			var pluckval = stringsnom.indexOf(pluckvals);
			pluck(pluckval, curpoint);
		} 
	}
	playLoc = nextPlayLoc;
	drawPlay2(curpoint, progress, playLoc);
	window.requestAnimationFrame(play2);
}

function createAllLocs()
{
	var tlen = tab[0].length;
	alllastkey = makeArray(6, tlen);
	alllastfinger = makeArray(5, tlen);


	var ilastkey = [0,0,0,0,0,0];
	var ilastfinger = ["*","*","*","*","*"];
	for (playLoc = 0; playLoc <= tlen; playLoc++)
	{
		for (i=0; i<5; i++)
		{
			var letter = tab[i][playLoc];
			if (letter != null)
			{
				lf = ilastfinger[i];
				if (lf != "*")
				{
					fs = getfns(lf);
					s = fs[1];
					ilastkey[s] = 0;
					for (k=0; k<5; k++)
					{
						lf2 = ilastfinger[k];
						if (lf2 != "*")
						{
							fs2 = getfns(lf2);
							f2 = fs2[0];
							s2 = fs2[1];
							if (s2 == s && k != i && ilastkey[s] < f2) ilastkey[s] = f2;
						}
					}
				}
				ilastfinger[i] = letter;
				if (letter != "*")
				{
					fs = getfns(letter);
					f = fs[0];
					s = fs[1];

					if (ilastkey[s] < f) ilastkey[s] = f;
				}
			}
		}
		alllastfinger[playLoc] = ilastfinger.slice(0);
		alllastkey[playLoc] = ilastkey.slice(0);
	}
}


function pluck(i, time)
{
	j = lastpluck[2*i] = lastkey[i];
	lastpluck[2*i+1] = time;

	var base = tuning[i];
	var bnote = base[0];
	var boct = base[1];
	var bnotenum = notes.indexOf(bnote);
	var fnotenum = (parseInt(bnotenum) + parseInt(j)) % 12;
	var fnote = notes[fnotenum];
	var offset = parseInt(bnotenum) + parseInt(j);
	var foct = boct + Math.floor(offset / 12);
	acoustic.play(fnote, foct, 1);

}

function drawPlay2(time, progress, playLoc)
{
	fcontext.clearRect(-fcanvas.width, -fcanvas.height, 2*fcanvas.width, 2*fcanvas.height);
	for (i=0; i<6; i++) {
		var fsp = getFSPoint(lastkey[i], i);
		drawCircle(fcontext, 2, fsp[0], fsp[1], 'white', 0, 'white');
		var pluckdelay = 500;
		if (lastpluck[2*i] != "*" && time-lastpluck[2*i+1]<pluckdelay){
			fcontext.globalAlpha = 1-((time-lastpluck[2*i+1])/pluckdelay);
			fsp = getFSPoint(lastpluck[2*i], i);
			drawRect(fcontext, 27-fsp[0], 1, fsp[0], fsp[1]-0.5, 'white', 0, 'white');
			fcontext.globalAlpha = 1;
		}
	}
	drawHand(lastfinger, alllastfinger[playLoc + 1], progress % 1000, '#E0C266');
	drawPlayProgress(fcontext, playLoc);
}

function drawHand(fingerpos, fingerpos2, ms, color)
{
	var fxys = getFingerXY(fingerpos);
	var fxys2 = getFingerXY(fingerpos2);
	var stime = 250;
	var ctime = 1000 - stime;
	var alp = [0,0,0,0,0];
	if (ms > ctime)
	{
		var ms2 = ms - ctime;
		var f2f = ms2 / stime;
		var f1f = 1 - f2f;
		var fxys3 = [0,0,0,0,0]
		for (var i=0; i<5; i++)
		{
			fxys3[i] = [fxys[i][0] * f1f + fxys2[i][0] * f2f, fxys[i][1] * f1f + fxys2[i][1] * f2f];
			alp[i] = (f1f * ((fingerpos[i] == "*") ? 0.35 : 1) + f2f * ((fingerpos2[i] == "*") ? 0.35 : 1));
		}
		fxys = fxys3;
	}
	for (var i=0; i<5; i++)
	{
		var ang = (i == 4) ? -5*Math.PI / 6 : -Math.PI / 6;
		if (alp[i] == 0) alp[i] = (fingerpos[i] == "*") ? 0.35 : 1;
		drawFinger2(fcontext, color, fingernames.charAt(i), 5, 7, fxys[i][0], fxys[i][1], ang, alp[i]);
	}
}

function getFingerXY(fingerpos){
	var fixedfing = [0,0,0,0,0];
	var corrdist = [10,10,10,10,10]
	var anchors = 0;
	for (var i=0; i<5; i++)
	{
		if (fingerpos[i] != "*")
		{
			anchors += 1;
			fs = getfns(fingerpos[i]);
			f = fs[0];
			s = fs[1];
			var fsp = getFSPoint(f, s);
			var fsp2 = getFSPoint(f-1, s);
			fsp15 = (fsp[0]*4 + fsp2[0])/5;
			fixedfing[i] = [fsp15, fsp[1]];
		}
	}
	for (var i=0; i<4; i++)
	{
		if (fingerpos[i] == "*" || fingerpos[i] == "!")
		{
			if (fingerpos[i] == "*") fixedfing[i] = [0,0];
			for (var k=0; k<5; k++)
			{
				if (fingerpos[k] != "*" && Math.abs(k - i) < corrdist[i])
				{
					fixedfing[i][0] = fixedfing[k][0] + fingerrels[i][0] - fingerrels[k][0];
					fixedfing[i][1] = fixedfing[k][1] + fingerrels[i][1] - fingerrels[k][1];
					corrdist[i] = Math.abs(k - i);
				}
				else if (fingerpos[k] != "*" && Math.abs(k - i) == corrdist[i])
				{
					fixedfing[i][0] += (fixedfing[k][0] + fingerrels[i][0] - fingerrels[k][0]);
					fixedfing[i][1] += (fixedfing[k][1] + fingerrels[i][1] - fingerrels[k][1]);
					fixedfing[i][0] /= 2;
					fixedfing[i][1] /= 2;
				}
			}
		}
	}	
	return fixedfing;
}

function drawFinger2(ctx, color, finger, radius, fingerlen, xoff, yoff, angle, alpha) {
	ctx.save();
	ctx.beginPath();
	ctx.globalAlpha = alpha;
	ctx.translate(xoff, yoff);
	ctx.rotate(angle);
	ctx.moveTo(-radius, fingerlen);
	ctx.lineTo(-radius, 0);
	ctx.arcTo(0, -100, radius, 0, radius);
	ctx.lineTo(radius, fingerlen);
    ctx.fillStyle = color;
    ctx.fill();
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'black';
    ctx.stroke();
	ctx.globalAlpha = 1;
    ctx.restore();
	ctx.font =  "bold 8px Courier";
	ctx.fillStyle = 'black';
	ctx.fillText(finger, xoff-2, yoff+3);
}


function drawPlayProgress(ctx, playLoc) {
	drawRect(ctx, 400, 12, 100, 45, 'black', 1, '#BFC5CA');
	var unitdist =  400 / tab[1].length;
	if (tab[1].length < 60)
	{
		for (i=0; i<tab[1].length; i++)
		{
			drawRect(ctx, 100 + i * unitdist, 2, 6, 'black', 1, 'black')
			ctx.moveTo(100 + i * unitdist, 48);
			ctx.lineTo(100 + i * unitdist, 54);
		 	ctx.lineWidth = 0;
	  		ctx.strokeStyle = 'black';
	  		ctx.stroke();		
		}
	}
	drawRect(ctx, 8, 16, 100+(playLoc * unitdist)-4, 43, '#black', 1, '#AAB2B9')
	if (smx > 100 && smx < 500 && smy > 45 && smy < 45+12)
	{
//		ctx.fillStyle = 'black';
//		ctx.fillText(smx + " & " + smy, 180, 30);
		ctx.globalAlpha = 0.5;
		drawRect(ctx, 8, 16, smx-4, 43, '#black', 1, '#80E6FF');
		newunits = Math.floor((smx - 100) / unitdist);
		drawHand(alllastfinger[newunits], alllastfinger[newunits], 0, '#80E6FF')
		ctx.globalAlpha = 1;	
		if (mouseclick)
		{
			progress = newunits * 1000;
			mouseclick = false;
			lastfinger = alllastfinger[newunits];
			lastkey = alllastkey[newunits];
		}
	}
	else
	{
//		ctx.fillStyle = 'black';
//		ctx.fillText(smx + " & " + smy, 180, 20);		
	}
}

function getFSPoint(fret, string) {
	var x = fretLocation(scaleLength, fret)+53;
	var y = 17-6*string;
	return [x,y];
}


function getfns(seq)
{
	lfret = seq.charAt(0);
	lstrs = seq.charAt(1);
	lstr = stringsnom.indexOf(lstrs);
	return	[lfret, lstr];
}






//back-canvas
//
//

function drawFullGuitar(ctx)
{
	var guitarShape = [-77,144,-98,59,-97,3,
						-96,-32,-95,-124,-5,-125,
						69,-119,99,-81,134,-85,
						161,-88,227,-105,239,-66,
						250,-31,249,20,246,20,
						165,12,215,78,207,91,
						199,103,170,93,158,91,
						96,72,80,121,3,141];
	var headShape = [10,-10,30,-10,30,80,10,80,0,70];
	var tuning = ["E", "A", "D", "G", "B", "E"]

	
	drawBShape(ctx, guitarShape, 0, 0, 'black', 1, '#D68533');
	drawCircle(ctx, 40, 127, 0, 'black', 1, '#1F0F00');
	drawShape(ctx, headShape, 561, -32, 'black', 1, '#260D00'); //headstock
	drawRect(ctx, 400, 38, 162, -17, 'black', 1, '#7F3300'); //neck
	drawRect(ctx, 18, 68, 18, -32, 'black', 1, '#111111'); //bridge
	drawFrets(ctx, 1, 22, scaleLength, 2, 40, 10, 5, 52, -18);
	drawRect(ctx, 4, 40, 560, -18, 'black', 1, '#E6E65C'); //nut
	drawStrings(ctx, 1.8, 535, 27, -13);
	writeTuning(ctx, tuning, 577, -29);
}

function drawStrings(ctx, boltRadius, length, xoff, yoff)
{
	for (i=0; i<6; i++)
	{
		drawCircle(ctx, boltRadius, xoff, yoff + 6 * i, 'black', 1., '#999999');
		drawRect(ctx, length, 1, xoff, yoff + 6 * i - 0.4, '#999999', 1, '#999999');
	}
}

function drawRect(ctx, width, height, xoff, yoff, outlineColor, outlineWidth, fillColor)
{
	ctx.beginPath();
	ctx.rect(xoff, yoff, width, height);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.lineWidth = outlineWidth;
    ctx.strokeStyle = outlineColor;
    ctx.stroke();
}

function drawFrets(ctx, first, last, scaleLength, fretWidth, fretLength, markerDist, markerRadius, xoff, yoff) {
	ctx.font = "bold "+Math.round(markerRadius*1.2)+'px Courier';
	ctx.textAlign = 'center';
	for (i = first; i <=last; i++) {
		var d = fretLocation(scaleLength, i);
		drawRect(ctx, fretWidth, fretLength, xoff+d, yoff, 'black', 0.5, '#939322')
		if ((i > 2) && (i % 2 == 1 || i == 12) && (i != 11) && (i != 13)) {
			var mid = (fretLocation(scaleLength, i) + fretLocation(scaleLength, i-1)) / 2 + 1;
			if (i == 12)
			{
				drawCircle(ctx, markerRadius+2, xoff+mid, yoff-markerDist, '#BBBBBB', 0.5, '#2b3e50');				
			}
			drawCircle(ctx, markerRadius, xoff+mid, yoff-markerDist, '#BBBBBB', 0.5, '#2b3e50');
			ctx.fillStyle = '#DDDDDD';
			ctx.fillText(i, xoff+mid, yoff-(markerDist*0.80));
		}
	}
}

function fretLocation(scaleLength, i) {
	return scaleLength / Math.pow(2, i / 12);
}

function drawCircle(ctx, radius, xoff, yoff, outlineColor, outlineWidth, fillColor) {
	ctx.beginPath();
	ctx.arc(xoff, yoff, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fillColor;
    ctx.fill();
	ctx.lineWidth = outlineWidth;
	ctx.strokeStyle = outlineColor;
    ctx.stroke();
}

function drawBShape(ctx, shape, xoff, yoff, outlineColor, outlineWidth, fillColor) {
  ctx.beginPath();
  ctx.moveTo(xoff, yoff);
  for (i = 0; i < shape.length; i+=6)	
  {
  	ctx.bezierCurveTo((xoff+shape[i]), (yoff+shape[i+1]), (xoff+shape[i+2]), (yoff+shape[i+3]), (xoff+shape[i+4]), (yoff+shape[i+5]))
  }
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.lineWidth = outlineWidth;
  ctx.strokeStyle = outlineColor;
  ctx.stroke();
}

function drawShape(ctx, shape, xoff, yoff, outlineColor, outlineWidth, fillColor) {
  ctx.beginPath();
  ctx.moveTo(xoff, yoff);
  for (i = 0; i < shape.length; i+=2)	
  {
  	ctx.lineTo((xoff+shape[i]), (yoff+shape[i+1]));
  }
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.lineWidth = outlineWidth;
  ctx.strokeStyle = outlineColor;
  ctx.stroke();
}

function writeTuning(ctx, tuning, xoff, yoff) {
	ctx.font =  "12px Courier";
	ctx.fillStyle = '#AAAAAA';
	for (i=0; i<6; i++)
	{
		ctx.fillText(tuning[i], xoff, (yoff+14*i));
	}

}

function fitToContainer(canvas){
  // Make it visually fill the positioned parent
  canvas.style.width ='100%';
  canvas.style.height='100%';
  // ...then set the internal size to match
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function makeArray(d1, d2) {
    var arr = [];
    for(i = 0; i < d2; i++) {
        arr.push(new Array(d1));
    }
    return arr;
}
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
var slaptime = -10000;
var lastfinger = ["*","*","*","*","*"];
var delaypluck = [0,0,0,0,0,0];
var subs = []
var alllastfinger;
var allfingersubs;
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
var notes = ["C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs", "A", "As", "B"];
var tuning = [["E", 4],["B",3],["G",3],["D",3],["A",2],["E",2]];
var stringsnom = "zyxwvu";
var fingerrels = [[-6,6],[-20,3],[-32,6],[-40,21],[3,-16]];
var fxys;
var fingernames = "1234T"
var capo;
var patt_bar = /([0-9]+)([uvwxyz])[|]([uvwxyz])/;
var patt_bend = /([0-9]+)([uvwxyz])[\^]/;
var patt_hammer = /([0-9]+)([uvwxyz])H/;
var patt_pulloff = /\*P/;
var patt_slide = /([0-9]+)([uvwxyz])[\\\/]([0-9]+)/;
var patt_standard = /([0-9]+)([uvwxyz])/

var patt_pluck = /^([zyxwvu])+$/;
var patt_strum = /^([zyxwvu])>([zyxwvu])$/;
var patt_slap = /^[X]$/;

var patterns = [patt_bar, patt_bend, patt_hammer, patt_slide, patt_standard]
var softplucks = []
var slides = []

$(window).resize(function(){
	drawGuitarPic(capo);
});

$("#left-control a").click(function () {

	if ($(this).hasClass("faster") && spf < 100)
	{
		spf += 10;
	} 
	else if ($(this).hasClass("slower") && spf > 10)
	{
		spf -= 10;
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
	progress = Math.floor(progress/1000) *1000;
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
	loadAll();
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
});


function loadAll()
{
	var assetsPath = "ac-nylon/";
	var sounds = [
		{src: "E2.mp3", id: "E2"},
		{src: "F2.mp3", id: "F2"},
		{src: "Fs2.mp3", id: "Fs2"},
		{src: "G2.mp3", id: "G2"},
		{src: "Gs2.mp3", id: "Gs2"},
		{src: "A2.mp3", id: "A2"},
		{src: "As2.mp3", id: "As2"},
		{src: "B2.mp3", id: "B2"},
		{src: "C3.mp3", id: "C3"},
		{src: "Cs3.mp3", id: "Cs3"},
		{src: "D3.mp3", id: "D3"},
		{src: "Ds3.mp3", id: "Ds3"},
		{src: "E3.mp3", id: "E3"},
		{src: "F3.mp3", id: "F3"},
		{src: "Fs3.mp3", id: "Fs3"},
		{src: "G3.mp3", id: "G3"},
		{src: "Gs3.mp3", id: "Gs3"},
		{src: "A3.mp3", id: "A3"},
		{src: "As3.mp3", id: "As3"},
		{src: "B3.mp3", id: "B3"},
		{src: "C4.mp3", id: "C4"},
		{src: "Cs4.mp3", id: "Cs4"},
		{src: "D4.mp3", id: "D4"},
		{src: "Ds4.mp3", id: "Ds4"},
		{src: "E4.mp3", id: "E4"},
		{src: "F4.mp3", id: "F4"},
		{src: "Fs4.mp3", id: "Fs4"},
		{src: "G4.mp3", id: "G4"},
		{src: "Gs4.mp3", id: "Gs4"},
		{src: "A4.mp3", id: "A4"},
		{src: "As4.mp3", id: "As4"},
		{src: "B4.mp3", id: "B4"},
		{src: "C5.mp3", id: "C5"},
		{src: "Cs5.mp3", id: "Cs5"},
		{src: "D5.mp3", id: "D5"},
		{src: "Ds5.mp3", id: "Ds5"},
		{src: "slap.mp3", id: "slap"},
	];
	createjs.Sound.alternateExtensions = ["mp3"];	// add other extensions to try loading if the src file extension is not supported
	createjs.Sound.addEventListener("fileload", createjs.proxy(soundLoaded, this)); // add an event listener for when load is completed
	createjs.Sound.registerSounds(sounds, assetsPath);
}
var loadcount = 0
var toload = 36
function soundLoaded(event) {
	loadcount += 1;

}

function stop() {
	if (preload != null) {
		preload.close();
	}
	createjs.Sound.stop();
}


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
	};
}

function drawGuitarPic(capoloc)
{
	capo = parseInt(capoloc);
	fitToContainer(bcanvas);
	fitToContainer(fcanvas);
	var guitarLength = 580;
	scale = bcanvas.width / guitarLength;
	bcontext.clearRect(0, 0, bcanvas.width, bcanvas.height);
	yoff = bcanvas.height/2/scale - 14;
	bcontext.scale(scale, scale);
	bcontext.translate(xoff, yoff);
	fcontext.scale(scale, scale);
	fcontext.translate(xoff, yoff);
	drawFullGuitar(bcontext, 1, 0, 0);
}

function playTab2(speed, newTab)
{
	dfs = speed;
	fxys = fingerrels.slice();
	var ptab1 = newTab.split("#");
	tablen = ptab1[0].length;
	tab = makeArray(tablen, 8);
	subs = new Array(tablen);
	for (i=0; i<ptab1.length; i++)
	{
		istr = ptab1[i];
		inum = lnum = istr.charAt(0);
		if (lnum == "T") lnum = 5;
		if (lnum == "S") lnum = 6;
		if (lnum == "l") lnum = 7;
		if (lnum == "C") lnum = 8;
		lnum = lnum - 1;
		for (j=2; j<istr.length; j++)
		{
			if (istr.charAt(j) != "-")
			{
				var lenm = tab[lnum][j] = istr.substring(j, istr.indexOf("-", j));
				if (lnum != "l") addIns(j, inum, lenm);
				j += lenm.length - 1;
			}
		}
	}
	logIns(2, tablen-2);
	if (getNextAfter(-1, tab[6]) != null) createSubtitles();
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
		scrollToIns(nextPlayLoc);
		lastfinger = alllastfinger[nextPlayLoc];
		lastkey = alllastkey[nextPlayLoc];
		var pluckvals = tab[5][nextPlayLoc];
		for (var i = 0; i < 6; i++)
		{
			if (softplucks[nextPlayLoc][i])
			{
				pluck(i, curpoint, 0, true);
			} 
		}
		if (pluckvals != null) 
		{
			if (patt_pluck.test(pluckvals)){
				for (i=0; i<pluckvals.length; i++)
				{
					var stg = pluckvals.charAt(i);
					var pluckval = stringsnom.indexOf(stg);
					pluck(pluckval, curpoint, 0, false);
				}
			}
			else if (patt_strum.test(pluckvals)){
				var matches = pluckvals.match(patt_strum);
				var fromstg = matches[1];
				var tostg = matches[2];
				var fromval = stringsnom.indexOf(fromstg);
				var toval = stringsnom.indexOf(tostg);
				var move = (fromval > toval) ? -1 : 1;
				var strumtime = 0;
				pluck(fromval, curpoint, 0, false);
				for (i=fromval+move; i!=toval+move; i+=move)
				{
					strumtime += 30;
					pluck(i, curpoint, strumtime, false);
				}
			}
			else if (patt_slap.test(pluckvals)){
				slapMute(curpoint);
			}

		} 
	}
	for (i=0; i<6; i++) {
		if (delaypluck[i] > 0 && delaypluck[i] < curpoint)
		{
//			pluck(i, curpoint);
			delaypluck[i] = 0;
		}
	}
	playLoc = nextPlayLoc;
	drawPlay2(curpoint, progress, playLoc);
	window.requestAnimationFrame(play2);
}

function createSubtitles()
{
	var index = -1;
	array = tab[6];
	var curstart = getNextAfter(index, array);
	var toaddnext = ""
	var index = -1;
	while(getNextAfter(index, array) != array.length){
		index = getNextAfter(index, array);
		if (subs[curstart] == null) subs[curstart] = "";	
		var cursub = array[index];
		var cut = cursub.indexOf("/");
		if (cut != -1)
		{
			subs[curstart] += cursub.substring(0,cut);
			var nextindex = getNextAfter(index, array);
			curstart = Math.floor((nextindex*cut + index*(cursub.length-cut))/cursub.length);
			subs[curstart] = cursub.substring(cut+1);
		}
		else
		{
			subs[curstart] += cursub;
		}
	}
}

function createAllLocs()
{
	var tlen = tab[0].length;
	softplucks = makeArray(6, tlen)
	slides = makeArray(6, tlen+2)
	alllastkey = makeArray(6, tlen);
	alllastfinger = makeArray(5, tlen);
	allfingersubs = makeArray(5, tlen+1);
	var ilastkey = [capo,capo,capo,capo,capo,capo];
	var ilastfinger = ["*","*","*","*","*"];
	for (playLoc = 0; playLoc <= tlen; playLoc++)
	{
		for (i=0; i<5; i++)
		{
			var letter = tab[i][playLoc];
			if (letter != null)
			{
				if (letter.match(patt_bar))
				{
					allfingersubs[playLoc][i] = "bar";
				}
				else if (letter.match(patt_hammer))
				{
					allfingersubs[playLoc][i] = "hammer";
					fs = getfns(letter)
					s = fs[1]
					softplucks[playLoc][s] = true;
				}
				else if (letter.match(patt_pulloff))
				{
					allfingersubs[playLoc][i] = "pull off";
					fs = getfns(ilastfinger[i])
					s = fs[1]
					softplucks[playLoc][s] = true;
					letter = "*";
				}
				else if (letter.match(patt_bend))
				{
					allfingersubs[playLoc][i] = "bend";
				}
				else if (letter.match(patt_slide))
				{
					fs = getfns(letter)
					f = fs[0];
					s = fs[1];
					f2 = fs[2];
					s2 = fs[3];
					allfingersubs[playLoc][i] = "slide"
					var oldletter = (f-capo) + stringsnom.charAt(s);
					var newletter = (f2-capo) + stringsnom.charAt(s);
					tab[i][playLoc+2] = newletter;
					softplucks[playLoc+2][s] = true;
					slides[playLoc][i] = [oldletter, newletter, 0];
					if (playLoc < tlen-2) slides[playLoc+1][i] = [oldletter, newletter, 0.5];
					if (playLoc < tlen-3) slides[playLoc+2][i] = [oldletter, newletter, 1];
				}
				for (k=1; k<3; k++)
				{
					if (k<2 || letter.match(patt_slide))
					{
						if (playLoc < tlen-k && !letter.match(patt_bar) && allfingersubs[playLoc][i] != null)
						{ 
							allfingersubs[playLoc+k][i] = allfingersubs[playLoc][i] + "*";
							fs = getfns(ilastfinger[i])
						}
					}
				}
				lf = ilastfinger[i];
				if (lf != "*")
				{
					fs = getfns(lf);
					s = fs[1];
					s2 = fs[3];
					for (si = s; si >= s2; si--)
					{
						ilastkey[si] = capo;
						for (k=0; k<5; k++)
						{
							lfb = ilastfinger[k];
							if (lfb != "*")
							{
								fsb = getfns(lfb);
								fb = fsb[0];
								sb = fsb[1];
								sb2 = fsb[3];
								for (sib = sb; sib >= sb2; sib--)
								{
									if (sib == si && k != i && ilastkey[si] < fb) ilastkey[si] = fb;
								}
							}
						}
					}
				}
				ilastfinger[i] = letter;
				if (letter != "*")
				{
					fs = getfns(letter);
					f = fs[0];
					s = fs[1];
					s2 = fs[3];
					for (si = s; si >= s2; si--)
					{
						if (ilastkey[si] < f) ilastkey[si] = f;
					}
				}
			}
			else
			{
				if (playLoc != 0 && allfingersubs[playLoc-1][i] == "bar")
				{ 
					allfingersubs[playLoc][i] = 'bar';
				}
			}
		}
		alllastfinger[playLoc] = ilastfinger.slice(0);
		alllastkey[playLoc] = ilastkey.slice(0);
	}
}




straudio = [null, null, null, null, null, null]
function slapMute(time)
{
	createjs.Sound.play("slap");
	lastpluck = ['*',0,'*',0,'*',0,'*',0,'*',0,'*',0];
	for (var i = 0; i < 6; i++)
	{
		if (straudio[i] != null) straudio[i].stop();
	}
	slaptime = time;
}

function pluck(i, time, delayt, soft)
{
	j = lastpluck[2*i] = lastkey[i];
	lastpluck[2*i+1] = time;
	var oldpos = [0,0,0,0,0,0]
	if (straudio[i] != null)
	{
		oldpos[i] = straudio[i].position;
		straudio[i].stop();
	}
	var base = tuning[i];
	var bnote = base[0];
	var boct = base[1];
	var bnotenum = notes.indexOf(bnote);
	var fnotenum = (parseInt(bnotenum) + parseInt(j)) % 12;
	var fnote = notes[fnotenum];
	var offset = parseInt(bnotenum) + parseInt(j);
	var foct = boct + Math.floor(offset / 12);
	var note = fnote + foct;
	var ppc = new createjs.PlayPropsConfig().set({delay: delayt})
	straudio[i] = createjs.Sound.play(note, ppc);
	if (soft) straudio[i].position = 300;
	//	var noteaud = document.getElementById(note);
	//	if (noteaud != null)
	//  {
	//		noteaud.currentTime = 0.1;
	//		noteaud.play();
	//	}
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
	drawHand(lastfinger, alllastfinger[playLoc + 1], progress % 1000, '#E0C266', allfingersubs[playLoc], allfingersubs[playLoc+1], slides[playLoc], slides[playLoc+1]);
	var slapdelay = 300;
	if (time-slaptime<slapdelay)
	{
		fcontext.globalAlpha = 0.7;
		var difftime = time-slaptime;
		var radboost = (slapdelay/2 - difftime) / 60
		radius1 = 30 - radboost * radboost
		drawCircle(fcontext, radius1, 127, 0, 'white', 1, 'white');
		fcontext.globalAlpha = 1;
		drawSub(fcontext, "slap", 127, 10)
	}
	drawHandSubs(fcontext);
	drawPlayProgress(fcontext, playLoc);
}

var ihand = false;
function drawHand(fingerpos, fingerpos2, ms, color, subs, subs2, slide1, slide2)
{
	ihand = false;
	var ind;
	for (i=0; playLoc >= i && arrayIsAll(fingerpos,"*"); i++) 
	{
		ihand = true;
		ind = i;
		fingerpos=alllastfinger[playLoc-i].slice();

	}
	if (ind == playLoc)
	{
		fxys = getFingerXY(["1y","*","*","*","*"]);
	}
	else
	{
		fxys = getFingerXY(fingerpos);
	}

	var fxys2 = fxys;
	if (!arrayIsAll(fingerpos2,"*")) fxys2 = getFingerXY(fingerpos2);
	var stime = 300;
	var ctime = 1000 - stime;
	var alp = [0,0,0,0,0];
	var ms2 = ms - ctime;
	var f2f = ms2 / stime;
	var f1f = 1 - f2f;

	var fxys3 = [0,0,0,0,0]
	var touched = [false, false, false, false, false];
	for (var i=0; i<5; i++)
	{
		if (slide1[i] != null && slide2[i] != null)
		{
			s1pos = fingerpos.slice();
			s2pos = fingerpos.slice();
			letter1 = slide1[i][0];
			letter2 = slide1[i][1];
			weight1 = 1000 * slide1[i][2];
			weight2 = 1000 * slide2[i][2];
			weightdiff = weight2 - weight1;
			t2 = ms * weightdiff / 1000 + weight1;
			s1pos[i] = letter1
			s2pos[i] = letter2
			s1fxys = getFingerXY(s1pos);
			s2fxys = getFingerXY(s2pos);
			fxys3[i] = [s1fxys[i][0] * ((1000-t2)/1000) + s2fxys[i][0] * (t2/1000) , s1fxys[i][1]];
			fnt = getFingerXY(s1pos, fxys3, i);
			fxys3 = fnt[0];
			var ntouched = fnt[1];
			console.log(ntouched);
			for (var k=0; k<4; k++)
			{
				if (k==i || ntouched[k]) {
					fxys[i] = fxys3[i];
					touched[k] = ntouched[k];
				}
			}
		}
		else if (ms > ctime)
		{
			fxys3[i] = [fxys[i][0] * f1f + fxys2[i][0] * f2f, fxys[i][1] * f1f + fxys2[i][1] * f2f];
			alp[i] = (f1f * ((fingerpos[i] == "*") ? 0.35 : 1) + f2f * ((fingerpos2[i] == "*") ? 0.35 : 1));
			fxys[i] = fxys3[i]
		}
	}
	for (var i=4; i>=0; i--)
	{
		if (touched[i]) fxys[i] = touched[i];
	}

	for (var i=4; i>=0; i--)
	{
		if (alp[i] == 0) alp[i] = (fingerpos[i] == "*") ? 0.35 : 1;
		if (ihand) 
		{
				fxys[i][0] += 3;
				alp[i] = 0.35;
		}
	}
	var baseloc = 0;
	var fingdist = 12;
	for (var i=3; i>=0; i--) { baseloc += fxys[i][0]; }
	baseloc /= 4;
	baseloc += fingdist;
	var tobar = false;
	for (var i=3; i>=0; i--) {
		if (subs[i] == "bar")
		{
			baseloc = fxys[i][0] + (i-1.5) * fingdist + 1;
			tobar = true;
		}
		if (subs[i] == "bend")
		{
			if (ms < ctime / 2) {fxys[i][1] -= ms/ctime * 6;}
			else if (ms < ctime) {fxys[i][1] -= (ctime-ms)/ctime * 6;}

		}	
	}
	var orderfired = [];
	var invis = [];
	var vis = [];
	for (var i=4; i>=0; i--)
	{
		if (fingerpos[i] == "*")
		{
			invis.push(i);
		}
		else
		{
			if (vis.length == 0)
			{
				vis.push(i);
			}
			else
			{
				for (var j=0; j<vis.length;j++)
				{
					if (fxys[i][1] > fxys[vis[j]][1])
					{
						vis.splice(j, 0, i);
						break;
					}
					else if (j == vis.length-1)
					{
						vis.splice(j+1, 0, i);	
						break;				
					}
				}
			}
		}
	}
	orderfired = invis.concat(vis);

	var fw = 4;
	for (var ii=0; ii<=4; ii++)
	{
		i = orderfired[ii];
		fcontext.beginPath();
		var curx = baseloc-fingdist*(i-1.5);
		var cury = 30;
		fw=3.5;
		if (i == 4)
		{
 			curx = fxys[i][0] - 2;
			cury = -21;
			fw=4.5;
		}
		var finx = fxys[i][0];
		var finy = fxys[i][1];
		if (finy > cury && i != 4) finy = cury - 2;
		var knuckoff = ((finx > curx && i < 2) || (finx < curx && i >= 2)) ? 0.8 : 0.2;
		if (i == 4) knuckoff = 0.8;
		var midx = curx*.5 + finx*0.5;
		var midy = cury*knuckoff + finy*(1-knuckoff);
		var angle = getangle(curx, cury, midx, midy);
		var angle2 = getangle(midx, midy, finx, finy);
		var angle3 = getangle(curx, cury, finx, finy);
		var cang = fw*Math.cos(angle);
		var sang = fw*Math.sin(angle);
		var cang2 = fw*Math.cos(angle2);
		var sang2 = fw*Math.sin(angle2);
		var cang3 = fw*Math.cos(angle3);
		var sang3 = fw*Math.sin(angle3);
		if (i == 4)
		{
 			cang = cang2 = cang3;
 			sang = sang2 = sang3;
		}
		fcontext.moveTo(curx+sang,cury-cang);
		fcontext.arcTo(midx+0.5*sang+0.5*sang2,midy-0.5*cang-0.5*cang2,finx+sang2,finy-cang2,16);
		fcontext.lineTo(finx+sang2,finy-cang2);
		fcontext.arcTo(finx+300*cang2,finy+300*sang2,finx-sang2,finy+cang2,fw);
		fcontext.lineTo(finx-sang2,finy+cang2);
		fcontext.arcTo(midx-0.5*sang2-0.5*sang,midy+0.5*cang2+0.5*cang,curx-sang,cury+cang,16);
		fcontext.lineTo(curx-sang,cury+cang);
//		fcontext.lineTo(finx, finy);
//		fcontext.lineWidth = 2;
		fcontext.globalAlpha = alp[i];
		fcontext.strokeStyle = 'black';
	    fcontext.stroke();		
	    fcontext.fillStyle = color;
	    fcontext.fill();
		fcontext.globalAlpha = 1;
	}
}

function drawHandSubs(ctx){
	for (i=0; i<4; i++)
	{
		if (allfingersubs[playLoc][i] != null) 
		{
			var nowtext = allfingersubs[playLoc][i];
			while (nowtext.charAt(nowtext.length - 1) == "*") {nowtext = nowtext.substring(0,nowtext.length - 1);}
			drawSub(ctx, nowtext, fxys[i][0], fxys[i][1])
		}
	}
	ctx.globalAlpha = 1;
	ctx.textAlign = 'left';
}

function drawSub(ctx, text, xoff, yoff)
{
	ctx.font =  "bold 8px Josefin Sans";
	ctx.textAlign = 'center';
	ctx.globalAlpha = 0.8;
	var metrics = ctx.measureText(text);
	var width = metrics.width;
	drawRect(ctx, width+4, 9, xoff-width/2-2, yoff-13.5, 'black', 0.5, 'white');
	ctx.fillStyle = "black";
	ctx.fillText(text,xoff,yoff-6);	
	ctx.globalAlpha = 1;
}

function getFingerXY(fingerpos, preset, ctrlpoint){
	var touched = [false, false, false, false, false];
	var fixedfing = (preset == null) ? [0,0,0,0,0] : preset;
	var corrdist = [10,10,10,10,10]
	var pushover = [1,1,1,1,1]
	var anchors = 0;
	for (var i=4; i>-1; i--)
	{
		if (fingerpos[i] != "*" && fixedfing[i] == 0)
		{
			anchors += 1;
			fs = getfns(fingerpos[i]);
			f = fs[0];
			s = fs[1];
			var fsp = getFSPoint(f, s);
			var fsp2 = getFSPoint(f-1, s);
			if (i != 4)
			{
				for (k=0; k<4; k++)
				{
					if (i != k)
					{
						pfs = getfns(fingerpos[k]);
						pf = pfs[0];
						ps = pfs[1];
						if (f == pf && Math.abs(s - ps) == 1)
						{
							if (k > i)
							{
								pushover[i] = pushover[k]+1;
							}
							else
							{
								pushover[k] = pushover[i]+1;
							}
						}
					}
				}
			}
			fsp15 = (fsp[0]*(5-pushover[i]) + fsp2[0]*(pushover[i]))/5;
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
				if (fingerpos[k] != "*")
				{
					if (Math.abs(k - i) < corrdist[i])
					{
						fixedfing[i][0] = fixedfing[k][0] + fingerrels[i][0] - fingerrels[k][0];
						fixedfing[i][1] = fixedfing[k][1] + fingerrels[i][1] - fingerrels[k][1];
						corrdist[i] = Math.abs(k - i);
						if (k == ctrlpoint) touched[i] = fixedfing[i];
					}
					else if (Math.abs(k - i) == corrdist[i])
					{
						fixedfing[i][0] += (fixedfing[k][0] + fingerrels[i][0] - fingerrels[k][0]);
						fixedfing[i][1] += (fixedfing[k][1] + fingerrels[i][1] - fingerrels[k][1]);
						fixedfing[i][0] /= 2;
						fixedfing[i][1] /= 2;
						if (k == ctrlpoint) touched[i] = fixedfing[i];
					}
				}
			}
		}
	}	
	if (!ctrlpoint) return fixedfing;
	return [fixedfing, touched];
}

var bluepress1 = false;
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
	bluepress1 = false;
	if (smx > 100 && smx < 500 && smy > 45 && smy < 45+12)
	{
		bluepress1 = true;
		ctx.globalAlpha = 0.5;
		drawRect(ctx, 8, 16, smx-4, 43, '#black', 1, '#80E6FF');
		newunits = Math.floor((smx - 100) / unitdist);
		if (mouseclick)
		{
			setnewloc();
		}
	}
	else if (blueclick)
	{
		setnewloc();		
	}
	if (bluepress1 || bluepress2) bluehand(newunits);
	if (getPrevBefore(playLoc, subs) != -1)
	{
		var sloc = getPrevBefore(playLoc, subs);
		var sloc2 = getNextAfter(playLoc, subs);
		var sub = subs[sloc];
		var diffdist = Math.min(Math.abs(progress-(sloc+1)*1000), Math.abs(progress-(sloc2+1)*1000));
		if (diffdist < 1000) ctx.globalAlpha = diffdist / 1000;
		ctx.font =  "bold 14px Josefin Sans";
		ctx.fillStyle = "white";
		ctx.textAlign = 'center';
		ctx.fillText(sub,290,37);	
		ctx.textAlign = 'left';
		ctx.globalAlpha = 1;
	} 
}

function bluehand()
{
	bluepress = true;
	fcontext.globalAlpha = 0.5;
	drawHand(alllastfinger[newunits], alllastfinger[newunits], 0, '#80E6FF',allfingersubs[newunits],["","","","",""], slides[newunits], slides[newunits+1])
	fcontext.globalAlpha = 1;
}

function setnewloc()
{
	progress = newunits * 1000;
	mouseclick = false;
	lastfinger = alllastfinger[newunits];
	lastkey = alllastkey[newunits];
	blueclick = false;	
}

function getFSPoint(fret, string) {
	var x = fretLocation(scaleLength, fret)+53;
	var y = 17-6*string;
	return [x,y];
}


var allpseq = ""
function getfns(seq)
{
	var retmat = []
	if (seq == "*" || seq.match(patt_pulloff))
	{
		retmat = [null, 0, 0, 0]
	}
	else if (seq.match(patt_bar))
	{
		matches = seq.match(patt_bar);
		retmat = [matches[1], matches[2], matches[1], matches[3]]
	}
	else if (seq.match(patt_slide))
	{
		matches = seq.match(patt_slide);
		retmat = [matches[1], matches[2], matches[3], matches[2]]
	}
	else if (seq.match(patt_standard))
	{
		matches = seq.match(patt_standard);
		retmat = [matches[1], matches[2], matches[1], matches[2]]
	}
	else
	{
		retmat [null, 0, 0, 0];
	}
	if (allpseq.indexOf(seq) < 0)
	{
		allpseq = allpseq + seq;
	} 
	return [parseInt(retmat[0])+capo, stringsnom.indexOf(retmat[1]), parseInt(retmat[2])+capo, stringsnom.indexOf(retmat[3])];
}

function getangle(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); 
  return theta;
}

function arrayIsAll(array, item, item2)
{
	for (i=0; i<array.length; i++)
	{
		if (array[i] != item && array[i] != item2) return false;
	}
	return true;
}

function getNextAfter(index, array)
{
	for (i=index+1; i<array.length; i++){
		if (array[i] != null) return i;
	}
	return array.length;
}
function getPrevBefore(index, array)
{
	for (i=index-1; i>-1; i--){
		if (array[i] != null) return i;
	}
	return -1;
}

function approximatelyEqual(a, b, epsilon) {
	if (epsilon == null) epsilon = 0.05;
    var A = Math.abs(a), B = Math.abs(b);
    return Math.abs(A - B) <= (A < B ? B : A) * epsilon;
}
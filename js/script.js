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
var patt_bar = /[0-9]+[uvwxyz][|][uvwxyz]/;
var patt_bend = /[0-9]+[uvwxyz][^]/;
var patt_hammer = /[0-9]+[uvwxyz]H/;

$(window).resize(function(){
	drawGuitarPic(capo);
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

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
	};
}

function drawGuitarPic(capoloc)
{
	capo = capoloc;
	fitToContainer(bcanvas);
	fitToContainer(fcanvas);
	var guitarLength = 580;
	scale = bcanvas.width / guitarLength;
	bcontext.clearRect(0, 0, bcanvas.width, bcanvas.height);
	yoff = bcanvas.height/2/scale - 36;
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
	tab = makeArray(tablen, 7);
	subs = new Array(tablen);
	for (i=0; i<ptab1.length; i++)
	{
		istr = ptab1[i];
		lnum = istr.charAt(0);
		if (lnum == "T") lnum = 5;
		if (lnum == "S") lnum = 6;
		if (lnum == "l") lnum = 7;
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
		lastfinger = alllastfinger[nextPlayLoc];
		lastkey = alllastkey[nextPlayLoc];
		var pluckvals = tab[5][nextPlayLoc];
		if (pluckvals != null) 
		{
			var patt1 = /^([zyxwvu]+)$/;
			var patt2 = /^([zyxwvu])>([zyxwvu])$/;
			if (patt1.test(pluckvals)){
				for (i=0; i<pluckvals.length; i++)
				{
					var stg = pluckvals.charAt(i);
					var pluckval = stringsnom.indexOf(stg);
					pluck(pluckval, curpoint);
				}
			}
			else if (patt2.test(pluckvals)){
				var matches = pluckvals.match(patt2);
				var fromstg = matches[1];
				var tostg = matches[2];
				var fromval = stringsnom.indexOf(fromstg);
				var toval = stringsnom.indexOf(tostg);
				var move = (fromval > toval) ? -1 : 1;
				var strumtime = 0;
				pluck(fromval, curpoint);
				for (i=fromval+move; i!=toval+move; i+=move)
				{
					strumtime += 20;
					delaypluck[i] = curpoint + strumtime;
				}
			}

		} 
	}
	for (i=0; i<6; i++) {
		if (delaypluck[i] > 0 && delaypluck[i] < curpoint)
		{
			pluck(i, curpoint);
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
				}
				else if (letter.match(patt_bend))
				{
					allfingersubs[playLoc][i] = "bend";
				}
				if (playLoc < tlen-1 && !letter.match(patt_bar) && allfingersubs[playLoc][i] != null)
				{ 
					allfingersubs[playLoc+1][i] = allfingersubs[playLoc][i] + "*";
				}
				lf = ilastfinger[i];
				if (lf != "*")
				{
					fs = getfns(lf);
					s = fs[1];
					s2 = fs[2];
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
								sb2 = fsb[2];
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
					s2 = fs[2];
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
	var note = fnote + foct;
	var noteaud = document.getElementById(note);
	if (noteaud != null)
	{
		noteaud.currentTime = 0.1;
		noteaud.play();
	}
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
	drawHand(lastfinger, alllastfinger[playLoc + 1], progress % 1000, '#E0C266', allfingersubs[playLoc], allfingersubs[playLoc+1]);
	drawHandSubs(fcontext);
	drawPlayProgress(fcontext, playLoc);
}

var ihand = false;
function drawHand(fingerpos, fingerpos2, ms, color, subs, subs2)
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
	if (ms > ctime)
	{
		var fxys3 = [0,0,0,0,0]
		for (var i=0; i<5; i++)
		{
			fxys3[i] = [fxys[i][0] * f1f + fxys2[i][0] * f2f, fxys[i][1] * f1f + fxys2[i][1] * f2f];
			alp[i] = (f1f * ((fingerpos[i] == "*") ? 0.35 : 1) + f2f * ((fingerpos2[i] == "*") ? 0.35 : 1));
		}
		fxys = fxys3;
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
	var fw = 4;
	for (var i=4; i>=0; i--)
	{
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
	ctx.font =  "bold 8px Josefin Sans";
	ctx.textAlign = 'center';
	ctx.globalAlpha = 0.8;
	for (i=0; i<4; i++)
	{
		if (allfingersubs[playLoc][i] != null) 
		{
			var nowtext = allfingersubs[playLoc][i];
			if (nowtext.charAt(nowtext.length - 1) == "*") nowtext = nowtext.substring(0,nowtext.length - 1);
      		var metrics = ctx.measureText(nowtext);
      		var width = metrics.width;
      		drawRect(ctx, width+4, 9, fxys[i][0]-width/2-2, fxys[i][1]-13.5, 'black', 0.5, 'white')
			ctx.fillStyle = "black";
			ctx.fillText(nowtext,fxys[i][0],fxys[i][1]-6);	
		}
	}
	ctx.globalAlpha = 1;
	ctx.textAlign = 'left';
}

function getFingerXY(fingerpos){
	var fixedfing = [0,0,0,0,0];
	var corrdist = [10,10,10,10,10]
	var pushover = [1,1,1,1,1]
	var anchors = 0;
	for (var i=4; i>-1; i--)
	{
		if (fingerpos[i] != "*")
		{
			anchors += 1;
			fs = getfns(fingerpos[i]);
			f = fs[0];
			s = fs[1];
			var fsp = getFSPoint(f, s);
			var fsp2 = getFSPoint(f-1, s);
			if (i != 4)
			{
				pfs = getfns(fingerpos[i+1]);
				pf = pfs[0];
				ps = pfs[1];
				if (f == pf && s == ps + 1) pushover[i] = pushover[i]+1;
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
		ctx.globalAlpha = 0.5;
		drawRect(ctx, 8, 16, smx-4, 43, '#black', 1, '#80E6FF');
		newunits = Math.floor((smx - 100) / unitdist);
		drawHand(alllastfinger[newunits], alllastfinger[newunits], 0, '#80E6FF',allfingersubs[newunits],["","","","",""])
		ctx.globalAlpha = 1;	
		if (mouseclick)
		{
			progress = newunits * 1000;
			mouseclick = false;
			lastfinger = alllastfinger[newunits];
			lastkey = alllastkey[newunits];
		}
	}
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
		ctx.fillText(sub,290,90);	
		ctx.textAlign = 'left';
		ctx.globalAlpha = 1;
	} 
}

function getFSPoint(fret, string) {
	var x = fretLocation(scaleLength, fret)+53;
	var y = 17-6*string;
	return [x,y];
}


function getfns(seq)
{
	lfret = parseInt(seq.charAt(0)) + capo;
	lstrs = seq.charAt(1);
	var lstrf = lstr = stringsnom.indexOf(lstrs);
	if (seq.match(patt_bar)) lstrf = stringsnom.indexOf(seq.charAt(3));
	return	[lfret, lstr, lstrf];
}

function getangle(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); 
  return theta;
}

function arrayIsAll(array, item)
{
	for (i=0; i<array.length; i++)
	{
		if (array[i] != item) return false;
	}
	return true;
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
	if (capo != 0) 	drawRect(ctx, 8, 45, getFSPoint(capo, 0)[0]+3, -21, 'black', 1, '#B22400'); //capo

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
		var col = (i == capo) ? '#E6E65C' : '#939322';
		drawRect(ctx, fretWidth, fretLength, xoff+d, yoff, 'black', 0.5, col)
		j = i-capo;
		var mid = (fretLocation(scaleLength, i) + fretLocation(scaleLength, i-1)) / 2 + 1;
		if ((i > 2) && (i % 2 == 1 || i == 12) && (i != 11) && (i != 13)) {
			if (i == 12)
			{
				drawCircle(ctx, markerRadius+2, xoff+mid, yoff-markerDist, '#BBBBBB', 0.5, '#2b3e50');				
			}
			drawCircle(ctx, markerRadius, xoff+mid, yoff-markerDist, '#BBBBBB', 0.5, '#2b3e50');
			ctx.fillStyle = '#DDDDDD';
			if (j>0) ctx.fillText(j, xoff+mid, yoff-(markerDist*0.80));			
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
var bcanvas = document.getElementById('back-canvas');
var bcontext = bcanvas.getContext('2d');
var fcanvas = document.getElementById('front-canvas');
var fcontext = fcanvas.getContext('2d');
var tab;
var start = null;
var playLoc = 0;
var dfs = 7;
var spf = 1;
var speed = 3.5;
var scale = 1;
var xoff = -14;
var yoff;
var scaleLength = 510;
var lastkey = [0,0,0,0,0,0];
var lastpluck = ['*',0,'*',0,'*',0,'*',0,'*',0,'*',0];
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

$(window).resize(function(){
	drawGuitarPic();
});

$("#left-control a").click(function () {
	$("#left-control").find("div").removeClass("control-btn-selected");
	$(this).find("div").addClass("control-btn-selected");
	spf = $(this).data("spf");
	if (speed != 0)
	{
		speed = dfs * spf;
	}
});

$("#right-control a").click(function () {
	$("#right-control").find("div").removeClass("control-btn-selected");
	$(this).find("div").addClass("control-btn-selected");
});

$("#mid-control .pause").click(pausefunc);

function pausefunc() {
	speed = 0;
	$("#mid-control .pause-set").hide();
	$("#mid-control .play-set").show();	
}

$("#mid-control .play").click(playfunc);


function playfunc() {
	speed = dfs * spf;
	$("#mid-control .play-set").hide();
	$("#mid-control .pause-set").show();
}

$("#mid-control .loop").click(loopfunc);


function loopfunc() {
	looping = !looping;
	if (looping)
	{
		$(this).find("div").html("unloop");
	}
	else
	{
		$(this).find("div").html("loop");
	}
}

$(document).ready(function() {
	$("#mid-control .pause-set").hide();
	speed = 0;
	fcanvas.addEventListener('mousemove', function(evt) {
		var mousePos = getMousePos(fcanvas, evt);
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
	yoff = bcanvas.height/2/scale;
	bcontext.scale(scale, scale);
	bcontext.translate(xoff, yoff);
	fcontext.scale(scale, scale);
	fcontext.translate(xoff, yoff);
	drawFullGuitar(bcontext, 1, 0, 0);
}

function playTab(speed, newTab)
{
	tab = newTab.split("#");
	window.requestAnimationFrame(play);
}

function play(timestamp)
{
	if (!start) start = timestamp;
	var curpoint = timestamp - start;
	progress += (curpoint - lastpoint) * speed;
	if (progress > tab[1].length * 1000)
	{
		progress -= tab[1].length * 1000;
		lastkey = [0,0,0,0,0,0];
		lastpluck = ['*',0,'*',0,'*',0,'*',0,'*',0,'*',0];
		if (!looping)
		{
			pausefunc();
		}
	}
	lastpoint = curpoint;
	var nextPlayLoc = Math.round(progress / 1000);
	if (nextPlayLoc != playLoc)
	{
		for (i=0; i<6; i++)
		{
			var letter = tab[i].charAt(playLoc % (tab[i].length));
			if (letter != "-")
			{
				lastkey[i] = letter;
			}
			if (letter == "*") 
			{
				lastkey[i] = 0;
			}
			if ($.isNumeric(letter)){
				pluck(i, curpoint);
			}
		}
	}
	drawPlay(curpoint, playLoc);
	playLoc = nextPlayLoc;
	window.requestAnimationFrame(play);
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

function drawPlay(time, playLoc)
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
		if (lastkey[i] != 0)
		{
			var fsp2 = getFSPoint(lastkey[i]-1, i);
			drawFinger(fcontext, 4, 4, (fsp[0]*4 + fsp2[0])/5, fsp[1], -Math.PI/5);
		}
	}
	drawPlayProgress(fcontext, playLoc);
}


function drawPlayProgress(ctx, playLoc) {
	drawRect(ctx, 400, 12, 100, 45, 'black', 1, '#F8C0B2');
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
	drawRect(ctx, 8, 16, 100+(playLoc * unitdist)-4, 43, '#black', 1, '#EF7B5E')
	if (smx > 100 && smx < 500 && smy > 45 && smy < 45+12)
	{
		ctx.globalAlpha = 0.5;
		drawRect(ctx, 8, 16, smx-4, 43, '#black', 1, '#EF7B5E');
		ctx.globalAlpha = 1;	
		if (mouseclick)
		{
			newunits = Math.round((smx - 100) / unitdist);
			progress = newunits * 1000;
			mouseclick = false;
		}
	}
}

function getFSPoint(fret, string) {
	var x = fretLocation(scaleLength, fret)+53;
	var y = 17-6*string;
	return [x,y];
}

function drawFinger(ctx, radius, fingerlen, xoff, yoff, angle) {
	ctx.beginPath();
	ctx.save();
	ctx.globalAlpha = 0.8;
	ctx.translate(xoff, yoff);
	ctx.rotate(angle);
	ctx.moveTo(-radius, fingerlen);
	ctx.lineTo(-radius, 0);
	ctx.arcTo(0, -100, radius, 0, radius);
	ctx.lineTo(radius, fingerlen);
    ctx.fillStyle = '#E0C266';
    ctx.fill();
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'black';
    ctx.stroke();
	ctx.globalAlpha = 1;
    ctx.restore();
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
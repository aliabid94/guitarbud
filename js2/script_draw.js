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

function drawShadowGuitar(ctx,color)
{
	drawBShape(ctx, guitarShape, 0, 0, color, 1, color);
	drawCircle(ctx, 40, 127, 0, color, 1, color);
	drawShape(ctx, headShape, 561, -32, color, 1, color); //headstock
	drawRect(ctx, 400, 38, 162, -17, color, 1, color); //neck
	drawRect(ctx, 18, 68, 18, -32, color, 1, color); //bridge
	drawRect(ctx, 4, 40, 560, -18, color, 1, color); //nut
}

function drawFullGuitar(ctx)
{

	
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
		ctx.fillText(tuning[i][0], xoff, (yoff+14*i));
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
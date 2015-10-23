var mcanvas;
var mcontext;

$('#song-input').bind("enterKey", submitted);
$('#song-input').keyup(function(e){
    if(e.keyCode == 13)
    {
        $(this).trigger("enterKey");
    }
});
function submitted(e){
	if ($("#song-input").val() != "") window.location.assign("/search/"+$("#song-input").val());
}
$('#hb1').click(submitted);
$('#hb2').click(function (){
   window.location.assign("/random/");
});


$(document).ready(function(){
	mcanvas = document.getElementById('shadow-canvas');
	mcontext = mcanvas.getContext('2d');
	drawGuitarPic();
	$('#song-input').focus();
	refreshsongs();
});

var waselig = false;
$('#song-input').bind('input', refreshsongs);
function refreshsongs() {
	var iselig = true; 
	var searchtext = $('#song-input').val();
	if (searchtext.length < 3) iselig = false;
	if (iselig)
	{
		$.post('/getsongs/'+searchtext+'/',
		{
		}
		,
		function (data)
		{
			$("#info").html(data);
		});		
	}
	if (!iselig)
	{
		$.post('/getsongs/-/',
		{
		}
		,
		function (data)
		{
			$("#info").html(data);
		});
	}
	waselig = iselig;
}

function drawGuitarPic()
{
	var xoff = -16;
	var yoff;
	capo = 0;
	fitToContainer(mcanvas);
	var guitarLength = 580;
	var scale = mcanvas.width / guitarLength;
	mcontext.clearRect(0, 0, mcanvas.width, mcanvas.height);
	yoff = mcanvas.height/2/scale - 34;
	mcontext.scale(scale, scale);
	mcontext.translate(xoff, yoff);
	drawShadowGuitar(mcontext, '#364554');
}


$(window).resize(function(){
	drawGuitarPic();
});

var instructions = {};
var stringsnom = "zyxwvu";

var patt_bar = /([0-9]+)([uvwxyz])[|]([uvwxyz])/;
var patt_bend = /([0-9]+)([uvwxyz])[\^]/;
var patt_hammer = /([0-9]+)([uvwxyz])H/;
var patt_pulloff = /\*P/;
var patt_clear = /\*/;
var patt_slide = /([0-9]+)([uvwxyz])[\\\/]([0-9]+)/;
var patt_standard = /([0-9]+)([uvwxyz])/;

var left_patterns = [[patt_bar, "bar"], [patt_bend, "bend"], [patt_hammer, "hammer"], [patt_pulloff, "pull"], [patt_clear, "clear"], [patt_slide, "slide"], [patt_standard, "standard"]]

var patt_pluck = /^([zyxwvu])+$/;
var patt_getplucks = /([zyxwvu])/g;
var patt_strum = /^([zyxwvu])>([zyxwvu])$/;
var patt_slap = /^[X]$/;

var newunits;
var bluepress2 = false;
var blueclick = false;

var finger_names = {"1":"Index", "2":"Middle", "3":"Ring", "4":"Pinky", "T":"Thumb"};
var finger_nums = {"1":0, "2":1, "3":2, "4":3, "T":4};
var patt_instruction = {
						"bar": "Bar *1 from the *2 to the *3.",
						"bend": "Bend the *2 at the *1.",
						"hammer": "Hammer on at the *1 of the *2.",
						"pull": "Pull off.",
						"clear": "Off.",
						"slide": "Slide on the the *2 from the *1 to the *3.",
						"standard": "Fret the *2 at the *1.",
						};

function addIns(time, type, input)
{
	if (instructions[time] == null) instructions[time] = []
	instructions[time].push([type, input])
}

var divtimes = [];
function logIns(start, end)
{
	var divmatrix = makeArray(6, end - start + 1);;
	var divtable = makeArray(6, end - start + 3);
	var fingertable = [[],[],[],[],[]]
	var dc = 0;	
	var fingerstoslide = [];
	pretable = [0,0,0,0,0,0];
	for (i=start; i<=end; i++)
	{
		curiset = instructions[i];
		leftins = [];
		rightins = [];
		resetpretable(fingertable, pretable);
		if (curiset != null)
		{
			for (j=0; j<curiset.length; j++)
			{
				type = curiset[j][0];
				ins = curiset[j][1];
				if (finger_names[type] != null)
				{
					var fnum = finger_nums[type];
					pretable = [0,0,0,0,0,0];
					for (p=0; p<left_patterns.length; p++)
					{
						curpat = left_patterns[p];
						curpattype = curpat[1];
						matches = ins.match(curpat[0]);
						if (matches)
						{
							outins = finger_names[type]+": "
							rtomatch = [];
							for (m=1; m<matches.length; m++)
							{
								match2 = matches[m];
								strnum = getstrnum(match2);
								if (strnum > 0) 
								{
									match2 = ordinal(strnum) + " string"
								}
								else 
								{
									match2 = ordinal(match2) + " fret"
								}
								rtomatch.push(["*"+m, match2]);
							}
							var ispull = false;
							var ishammer = false;
							var isslide = false;
							switch (curpattype){
								case "clear":
									fingertable[fnum]=[];								
									break;
								case "pull":
									ispull = true;
									strtopull = 5-fingertable[fnum][0][0];
									divtable[dc][strtopull] = "*";			
							 		divmatrix[dc-1][strtopull] = "&#8594;";
									fingertable[fnum]=[[]];
								case "hammer":
									ishammer = true;
									if (!ispull) {
										divtable[dc][getstrnum(matches[2])-1] = "*";
								 		divmatrix[dc-1][getstrnum(matches[2])-1] = "&#8594;";
								 	}
								case "slide":
									isslide = true;
									if (!ishammer) {
										divtable[dc][getstrnum(matches[2])-1] = "*";
										divtable[dc+2][getstrnum(matches[2])-1] = "*";
										divtable[dc+1][getstrnum(matches[2])-1] = "\\";
										fingerstoslide.push([fnum, 6-getstrnum(matches[2]), parseInt(matches[3])]);
								 	}
								case "bend":
									if (!isslide) divtable[dc][getstrnum(matches[2])-1] = "b";
								case "standard":
									fingertable[fnum]=[[6-getstrnum(matches[2]),parseInt(matches[1])]];
									break;
								case "bar":
									bmin = Math.min(getstrnum(matches[3]), getstrnum(matches[2]))
									bmax = Math.max(getstrnum(matches[3]), getstrnum(matches[2]))
									for (var b=bmin;b<=bmax;b++)
									{
										fingertable[fnum].push([6-b,parseInt(matches[1])])
									}
									break;
							}
							outins = outins + replaceinner(patt_instruction[curpattype], rtomatch);
							leftins.push(outins);
							resetpretable(fingertable, pretable);
							break;
						}
					}
				}
				else
				{
					if (type == "C")
					{
						outins = "Form the "+ins+" chord.";
						leftins.unshift(outins);			
					}
					else if (patt_pluck.test(ins))
					{
						matches = ins.match(patt_getplucks);
						outins = "Pluck the "
						for (m=0; m<matches.length; m++)
						{
							if (m != 0) outins = outins + ", ";
							if (m == matches.length - 1 && m != 0) outins = outins + "and ";
							var strn = getstrnum(matches[m]);
							if (divtable[dc][strn-1] != "b") {divtable[dc][strn-1] = "*";}
							else {divtable[dc][strn-1] = "*b";}
							outins = outins + ordinal(strn);
						}
						outins = outins + " string";
						if (matches.length > 1) outins = outins + "s together";
						outins = outins + ".";
						rightins.push(outins);
					}
					else if (patt_strum.test(ins))
					{
						matches = ins.match(patt_strum);
						var a = matches[1];
						var b = matches[2];
						var sa = getstrnum(matches[1]);
						var sb = getstrnum(matches[2]);
						var down = false;
						outins = "Up strum"
						if (a < b) 
						{
							outins = "Down strum";
							down = true;
						}
						for (var c=Math.min(sa,sb); c<=Math.max(sa,sb); c+=1)
						{
							divtable[dc][c-1] = pretable[6-c];
							if (down) {divtable[dc][c-1]+="&#8593";}
							else {divtable[dc][c-1]+="&#8595";}
						}
						outins = outins + " from the " + ordinal(getstrnum(a)) + " string to the " + ordinal(getstrnum(b)) + " string."
						rightins.push(outins);						
					}
					else if (patt_slap.test(ins))
					{
						ffoutins = "* Slap *"
						divtable[dc] = ["-","X","X","X","X","-"];
						rightins.push(outins);						
					}

				}
			}
		}
		divline = [];
		for (var si=0; si<6; si++)
		{
			if (divtable[dc][si] == "*") {divline.push(pretable[5-si]);}
			else if (divtable[dc][si] == "*b") {divline.push(pretable[5-si] + "&#10548");}
			else if (divtable[dc][si] == "b") {divline.push("&#10548");}
			else if (divtable[dc][si] == null) {divline.push("-");}
			else {divline.push(divtable[dc][si])};
		}
		divmatrix[dc] = divline;
		divtimes.push(i-1);
		dc += 1;
		for (var f=0; f<fingerstoslide.length; f+=1)
		{
			var ff = fingerstoslide[f];
			var dfinger = ff[0];
			var fs = ff[0];
			var fs1 = ff[1];
			var fs2 = ff[2];
			fingertable[fs] = [[fs1,fs2]];
		}
		fingerstoslide = [];
	}

	divtext = "<table id=\"ins-table\"> <tr id=\"ins-tr\">";
	for (dc=0; dc<divmatrix.length; dc++)
	{
		divtext += "</a></div>";
		divtext += "<td><a href=\"javascript:;\" class=\"ins-a\"><div class=\"ins\" id=\"ins-"+(dc+1)+"\">";
		for (var si=0; si<6; si++)
		{
			divtext += divmatrix[dc][si];
			divtext += "<br>";
		}
		divtext += "</td>";
	}
	divtext += "</tr></table>";
	$("#info2").append(divtext);
	$(".ins-a").hover(
		function hoverin(){
			var divchild = $(this).find(">:first-child");
			divchild.addClass("ins-a-hover");
			var divid = divchild.attr("id");
			newunits = parseInt(divid.substr(4))+1;
			bluepress2 = true;
		},
		function hoverout(){
			bluepress2 = false;
			$(this).find(">:first-child").removeClass("ins-a-hover");
		});
	$(".ins-a").click(
		function() {
			var divchild = $(this).find(">:first-child");
			divchild.addClass("ins-a-hover");
			var divid = divchild.attr("id");
			newunits = parseInt(divid.substr(4))+1;
			blueclick = true;
	});
}

function resetpretable(fingertable, pretable)
{
	for (var f=0; f<5; f+=1)
	{
		var ff = fingertable[f];
		for (var f2=0; f2<ff.length; f2+=1)
		{
			ff2 = ff[f2];
			if (ff2[1]>pretable[ff2[0]]) pretable[ff2[0]] = ff2[1];
		}
	}
}

var pdtime = 0;
function scrollToIns(time)
{
	$("#info3").html(time);
	var dtime = divtimes[0];
	for (d=0; divtimes[d]<time && d<divtimes.length; d++)
	{
		dtime = divtimes[d];
	}
	if (pdtime != dtime) 
	{
		var target = $("#ins-"+dtime);
		var w2 = target.width()*3;
		if ((target.position().left > $("#info2").width() - w2) || (target.position().left < w2))
		{
			$("#info2").animate({scrollLeft:
				$("#info2").scrollLeft() + target.position().left - w2}, 'fast');
		}
		$(".ins").removeClass("ins-select");
		target.addClass("ins-select");
	}
	pdtime = dtime;
}

function getstrnum(str)
{
	return stringsnom.indexOf(str) + 1;

}

function replaceinner(string, replacements)
{
	for (var i=0; i<replacements.length; i++)
	{
		var a = replacements[i][0];
		var b = replacements[i][1];
		var  ind = string.indexOf(a);
		if (ind > 0)
		{
			string = string.substr(0, ind)+b+string.substr(ind+a.length);
		}
	}
	return string;
}

function ordinal(num)
{
	if (num == 1) return num + "st";
	if (num == 2) return num + "nd";
	if (num == 3) return num + "rd";
	return num + "th";
}

function makeArray(d1, d2) {
    var arr = [];
    for(i = 0; i < d2; i++) {
        arr.push(new Array(d1));
    }
    return arr;
}
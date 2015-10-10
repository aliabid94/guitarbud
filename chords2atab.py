chords = ["G", "Cadd9", "Am7", "C", "Dsus4", "G", "Cadd9", "Am7", "C", "Dsus4", "G", "Cadd9", "Am7", "C", "Dsus4", "G", "Cadd9", "Am7", "C", "Dsus4", "Em", "C", "D", "G", "D/F#", "Em", "C", "Am7", "D", "G7", "G/B", "C", "Am7", "G", "G6", "Em7", "C", "D", ]
strum = "--------"
gchord = {1:'2v', 2:'3u', 3:'3y', 4:'3z', 5:"*", 'top':'u', 'bottom':'z'}
gbchord = {1:'*', 2:'3v', 3:'3y', 4:'3z', 5:"*", 'top':'v', 'bottom':'z'}
cadd9chord = {1:'2w', 2:'3v', 3:'3y', 4:'3z', 5:"*", 'top':'v', 'bottom':'z'}
am7chord = {1:'1y', 2:'2w', 3:'*', 4:'*', 5:"*", 'top':'v', 'bottom':'z'}
dsus4chord = {1:'2x', 2:'*', 3:'3y', 4:'3z', 5:"*", 'top':'w', 'bottom':'z'}
cchord = {1:'1y', 2:'2w', 3:'3v', 4:'*', 5:"*", 'top':'v', 'bottom':'z'}
dchord = {1:'2x', 2:'2z', 3:'3y', 4:'*', 5:"*", 'top':'w', 'bottom':'z'}
amchord = {1:'1y', 2:'2w', 3:'2x', 4:'*', 5:"*", 'top':'v', 'bottom':'z'}
fchord = {1:'1y', 2:'2x', 3:'3w', 4:'*', 5:"1u", 'top':'u', 'bottom':'z'}
emchord = {1:'2v', 2:'2w', 3:'*', 4:'*', 5:"*", 'top':'u', 'bottom':'z'}
dfschord = {1:'2x', 2:'2z', 3:'3y', 4:'*', 5:"2u", 'top':'u', 'bottom':'z'}
g7chord = {1:'1z', 2:'2v', 3:'3u', 4:'*', 5:"*", 'top':'u', 'bottom':'z'}
g6chord = {1:'2v', 2:'3u', 3:'3y', 4:'*', 5:"*", 'top':'u', 'bottom':'z'}
em7chord = {1:'2v', 2:'2w', 3:'3y', 4:'3z', 5:"*", 'top':'u', 'bottom':'z'}

chordsdict = {"G":gchord, "G/B":gbchord,"Cadd9":cadd9chord,"Am7":am7chord,"Dsus4":dsus4chord, "C":cchord, "D":dchord,"Am":amchord, "F":fchord,"Em":emchord, "D/F#":dfschord, "G7":g7chord, "G6":g6chord, "Em7":em7chord,}


def convert(chords, strum):
	atab = []
	lastchord = None;
	chordval = None;
	top = None;
	bottom = None;
	for i in range(7):
		atab.append({})
	timer = 0
	for chord in chords:
		if lastchord != chord:
			chordval = chordsdict[chord]
			for key, value in chordval.iteritems():
				if (key != 'top' and key != 'bottom'):
					atab[key-1][timer] = value
			top = chordval['top']
			bottom = chordval['bottom']
			atab[6][timer] = chord
		for i in range(8):
			dup = strum[timer%len(strum)];
			if (dup == "D"):
				atab[5][timer] = top + ">" + bottom
			elif (dup == "U"):
				atab[5][timer] = bottom + ">" + top
			timer += 1
	tabheaders = ["1*","2*","3*","4*","T*","S*","C*"]
	atabs = list(tabheaders)
	atabsdiv = [0,1,2,3,4,5,6]
	for i in range(8*len(chords)):
		for j in range(len(atabs)):
			firstline = atabsdiv[j]
			lastline = len(atabs)-1
			if j != len(atabs)-1:
				lastline = atabsdiv[j+1]-1
			if i in atab[j]:
				listy = list(range(firstline, lastline+1))
				listy.append("newline")
				for line in listy:
					if line == "newline":
						newline = tabheaders[j]
						for k in range(2*i-1):
							newline = newline + "-"
						newline += atab[j][i]
						atabs.insert(lastline + 1, newline)
						for k in range(j+1,6):
							atabsdiv[k] = atabsdiv[k] + 1
					else:
						curline = atabs[line]
						if curline[-1] == "-" or len(curline) <= 2:
							atabs[line] += atab[j][i]
							break;
		for j in range(len(atabs)):
			while len(atabs[j]) < 3 + 2*i:
				atabs[j] = atabs[j] + "-"
	atabsstr = ""
	for line in atabs:
		atabsstr += line + "#\n"
	return atabsstr[0:-2]

text_file = open("atab.txt", "w")
text_file.write(convert(chords, strum))
text_file.close()

print "Done"
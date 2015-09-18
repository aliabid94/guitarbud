chords = ["Am","F","C","G","Am","F","C","G"]
strum = "D-DU-UDU"
gchord = {1:'2v', 2:'3u', 3:'3y', 4:'3z', 5:"*", 'top':'u', 'bottom':'z'}
cchord = {1:'1y', 2:'2w', 3:'3v', 4:'*', 5:"*", 'top':'v', 'bottom':'z'}
dchord = {1:'2x', 2:'2z', 3:'3y', 4:'*', 5:"*", 'top':'w', 'bottom':'z'}
amchord = {1:'1y', 2:'2w', 3:'2x', 4:'*', 5:"*", 'top':'v', 'bottom':'z'}
fchord = {1:'1y', 2:'2x', 3:'3w', 4:'*', 5:"1u", 'top':'u', 'bottom':'z'}
chordsdict = {"G":gchord, "C":cchord, "D":dchord, "F":fchord, "Am":amchord}


def convert(chords, strum):
	atab = []
	lastchord = None;
	chordval = None;
	top = None;
	bottom = None;
	for i in range(6):
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
		for i in range(8):
			dup = strum[timer%len(strum)];
			if (dup == "D"):
				atab[5][timer] = top + ">" + bottom
			elif (dup == "U"):
				atab[5][timer] = bottom + ">" + top
			timer += 1
	tabheaders = ["1*","2*","3*","4*","T*","S*",]
	atabs = list(tabheaders)
	atabsdiv = [0,1,2,3,4,5]
	for i in range(8*len(chords)):
		for j in range(6):
			firstline = atabsdiv[j]
			lastline = len(atabs)-1
			if j != 5:
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


print(convert(chords, strum))

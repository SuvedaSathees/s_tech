import sys
from PIL import Image
names=sys.argv[2:]
ims=[Image.open(f'shots/{n}.png') for n in names]
w,h=ims[0].size
rows=(len(ims)+1)//2
out=Image.new('RGB',(w,rows*h//2))
for i,im in enumerate(ims):
    out.paste(im.resize((w//2,h//2)),((i%2)*w//2,(i//2)*h//2))
out.save(f'shots/{sys.argv[1]}.png')

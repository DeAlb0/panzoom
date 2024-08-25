# panzoom

panzoom is a javascript and css to include in .html pages to enable opening images in the full window and enable pan and zoom operations

It is specifically developed to work in .html files generated in Sphinx with .png and .svg files included through the figure or plantuml directive.

It may work or be adaptable for other uses cases.

Developer's Guide
-----------------

- when using sphinx edit your conf.py
  - add the following line to the html_js_files = [ ... ] array (or add this array in case it does not exist)
```
    'https://dealb0.github.io/panzoom/code/panzoom.v1.x.js',
```    
  - add the following line to the html_css_files = [ ... ] array (or add this array in case it does not exist)
```  
    'https://dealb0.github.io/panzoom/code/panzoom.v1.x.css',
```    
  - of course you need to rebuild after adding these lines, but that's all you have to do

User's Guide
------------

The user of panzoom can do the following operations :

- mouse operations
  - click on the image to enlarge into the full window (with a small border, configurable with CSS)
  - use mouse wheel to enlarge the image or make it smaller = zoom in or out
  - use drag = click, hold and move with the 1st (usually left) mouse button to move around the image
  - click in the full window image to leave full window mode
- keyboard operation
  - press 'enter' on the image with focus to enter full window mode
    - please note that it is unfortunately not so easy to gain keyboard focus for an image, you have to press Tab a lot of times
    - if possible, you probably easier start here with the mouse and use the keyboard after that
  - use the arrow keys left, right, up, down to move the image as if you where changing your view direction
    - this practically means the image will move down when you press the up key, go left, when you press the key to the right
    - this sounds strange but feels more naturally like telling in which direction you would move your head
  - use the '+' and '-' key to enlarge or make it smaller = zoom in and out
  - press '*' or 'x' on the numeric keypad to return to default size and position
  - press '/' or '&divide;' on the numeric keypad to see the image in real size, even if that is too big for the window and requires panning to see everything
  - use the enter key to leave full window mode

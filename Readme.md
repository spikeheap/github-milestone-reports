Generate reports of the current state of your GitHub milestones 

### Running

This is currently a terminal application. 

To install the dependencies:

```bash
npm install
```

To run it just use:

```bash
node index.js > output.html
```

and then open the generated HTML in a browser, e.g. `open output.html`.

### Authentication

To run locally, create a file named `.env`, [create a personal access token](https://github.com/settings/tokens), and add it as a `GITHUB_PERSONAL_TOKEN` variable:

```bash
# Replace the random letters with your own key
GITHUB_PERSONAL_TOKEN=1e290ac8433d555bce009b162cb869d01e290ac8
```

### License

The MIT License (MIT)

Copyright (c) 2015 Ryan Brooks

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
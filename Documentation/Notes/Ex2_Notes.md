# AWE Ex 2 Documentation
_by Taliesin Talab_
***

## Demo 1: Package manager

### Decision: npm over pnpm

To be honest, I had no idea what pnpm is, and I already had a lot of experience of using npm. I learned a tiny thing about it and came up with the following reasons:
- npm ships with Node, so there's nothing extra I need to install
- npm 10's lockfile is already fast enough, so the speed gap to pnpm doesn't apply here. On a big monorepo, that might be a different story
- basically everything (Vite, ESLint, Github Actions) assumes that you'll be using npm. I don't quite know how much extra work using pnpm would be over that, but I'd rather not

### Commands

>npm init -y
>
>npm install --save-dev serve
>
>npm start

Don't forget to commit package.json, package-lock.json, and .gitignore.


>npm init -y
>

generated a couple of things:
- name from the folder name
- version 1.0.0 (I won't bother to change this throughout, it's a pain)
- description first line of README.md under '## About'
- main index.js (straight up doesn't exist)
- scripts.test placeholder that just exits 1
- repo, bugs, homepage read from the git remote
- license ISC (npm's default, didn't change it cuz idk)
  I had to change a few things by hand though:
- 'main': 'js/main.js' is the real entry point
- 'private': true npm refuses to publish it
- 'type': 'module' every .js file is treated like an ES module by node. It'll be important for vite.config.js and eslint.config.js later, since i want import/export to work there instead of require()
- 'scripts.start': replaced the useless placeholder with 'start': 'serve'

### Serve
'serve' is a plain static file server the README told me to use with 'npx serve .'. Installing it locally means 'npm start' works on any machine after 'npm install'.

> npm install --save-dev serve
>

### Questions
_What does a package manager solve that "download the lib into a folder" doesn't?_
1. Serve pulled 84 packages on it s own, I would've had to find and download every one of those in version that work together, = massive pain
2. package.json says which range of versions I accept, the lockfile says what I have, and updating is simply 'npm update'
3. 'npm install' on a new device produces identical modules

_Dependencies vs devDependencies_
- dependencies = code the app needs at runtime, shipped to the user (e.g. date library imported from main.js)
- devDependencies = tools needed only to develop, test, and build the app. Vite, ESLint, Prettier, and TypeScript are only for development and are not needed when shipping

_What is a lockfile for, what breaks without it?_
- Package.json has version ranges, the lockfile records the exact version, the download URL, and an integrity hash for every package.
- Without the lockfile, teammates or CI installing next in the future get whatever the newest matching versions are, differing from mine. Perfect for 'works on my pc' bugs

_I chose npm, what would I have gained / lost with pnpm on a larger project?_
- Gain: install speed and disk space (global content-addressable store, packages are hard linked, not copied per project), a strict node_modules where only declared deps are importable
- Lose: extra thing to install everywhere (other machines, CI), some tools and older packages assume npm and would need a config flag, and I've no fucking idea how it works

## Demo 2: Vite

>npm install --save-dev vite
>
>mkdir public
>
>(move data/ and assets/ into it, DO NOT REFRACTOR, IT'LL BREAK IMPORTS)
>
>npm run dev

Manual changes:
- added 'dev': 'vite' to package.json
- index.html img src='assets/logo/logo.svg' -> img src='/assets/logo/logo.svg'
- data/ -> public/data/, assets/ -> public/assets/
### Why public/ ?
Vite has two kinds of files:
1. source it can trace from index.html, the script type="module" chain, link css, img src.
2. everything else. The server happily serves any file under the project's root so it would've worked as is for now. Issue is that 'vite build' for Demo 3 only emits what it traced and a fetch request at runtime would have been invisible to it. public/ is an escape hatch for it, since it is copied 1 to 1 in dist/ when built.

### Dev server
The dev server did three things that serve did not do. To see them, go into your browser's DevTools  -> Network, cache disabled and reload
1. main.js, state.js, api.js, router.js, views/\*.js each fetched separately. Vite does NOT bundle in dev. It serves the ES module graph and lets the browser follow the imports
2. main.js comes back almost as written, but import paths are rewritten to absolute paths ('/js/api.js'). Bare imports like 'shitlib' would be rewritten to '/node_modules/.vite/deps/…' because browsers can't resolve bare specifiers.

### Questions
_Static server vs Vite dev  server, one thing Vite does that serve doesn't?_
- serve maps URL -> file on disk and sends the bytes
- Vite sits in between, it rewrites imports, transforms files that browsers can't load directly, pre-bundles node_modules deps with esbuild

_What is HMR, what did I see happen and not happen?_
- Hot Module Replacement = HMR. The dev server pushes the changed module over the WebSocket and the client swaps it in the running page without a reload
- I didn't see a reload for CSS but I did see one when editing JS

_Why does ES-module split integrate naturally with Vite?_
- Vite's dev server is an ES module server. The browser walks import statements, Vite serves each module on demand, and tracks the graph for HMR.

## Demo 3: Build and preview

>npm run build
>
>npm run preview
>

Manual changes to package.json:
- 'build': 'vite build'
- 'preview': 'vite preview'
  Added dist/ to .gitignore

### Dist/
The folder's contents are:
>dist/index.html
>
>dist/assets/index-c44QfGKv.js (all 13 modules in one file)
>
>dist/assets/index-ZAWMz9M.css (styles.css minified)
>
>dist/assets/logo/logo.svg
>
>dist/assets/people/\*.png
>
>dist/data/\*.json
>

### Questions
_Three transformations Vite applied that I actually observed:_
1. 13 modules + polyfill -> 1 js file, imports are resolved at build time and gone
2. minifications + name mangling (41kB to 22kB, one line, locals renamed to e/t/n, no comments)
3. hashed filenames, dist/index.html written to point at them

_Why are there content hashes in production filenames?_
- Caching. A static host and every browser cache the js with a long max-age (a year I think). If the file were still called main.js, a deploy would leave users running hte old cached main.js against the new index.html, or you'd have to just give up on caching which is not a real option.

_Why never deploy 'vite dev' to real users?_
- It's a dev tool, not a web server.
- Every request is transformed on the fly, nothing is bundled or minified
- Serves the whole project root, so source files, config, and anything else on the disk under root is reachable via URL
- injects HMR client and keeps a WebSocket open, useless for users and a security risk

## Demo 4: Lint and format

>npm install --save-dev eslint @eslint/js globals prettier
>

I added eslint.config.js manually too, you can find it in the directory.
New scripts to package.json:
- lint: eslint js
- lint:fix: eslint js --fix
- format: prettier --write js

### lint:fix
In js/utils.js, I planted an error for lint:fix to catch on purpose:

>if (!ev.personIds)
>
>->
>
>if (!!!ev.personIds)

It caught it and reverted the change.

### Questions
_Linter vs formatter, one concrete finding each_
- Linter = what code does. It looks for likely bugs and bad practice (unused variables, undefined names, unreachable code, etc.). Most findings need a real person to fix them.
- Formatter = what code looks like. It checks line breaks, indentation, quotes, semicolons, etc. Actually rather handy when multiple people work on the same project. Prettier just fixes them for you.
- Both are very good to have in the same project, they do not compete for use cases.

_Why lint and lint:fix as two scripts ?_
- Lint only reports and exits non-zero on errors. It never actually fixes anything by itself. For CI, this is perfect since we do not want the pipeline to fix things without us knowing.
- Lint:fix fixes the errors, so good to have on your own machine, but not smart for CI.

_What does npm run lint do under the hood ? Would a global ESLint work?_
- npm reads 'scripts.lint' from package.json and runs that string ('eslint js') in a shell.

## Demo 5: TypeScript setup

>npm install --save-dev typescript@6
>
>npx tsc -v (this should tell you it's version 6.0.3)
>
>rename navigation.js and utils.js to navigation.ts and utils.ts
>
>npx tsc (should have no output)
>
>npm run dev
>

**Note** install TypeScript 6, not the latest version (7). When I installed it without noting which version, it gave me the latest version of TS and that breaks later on in Demo7 because typescript-eslint only works for versions 4.8.4 to 6.1.0.

In package.json, I changed dev and built to:
- dev: tsc && vite
- build: tsc && vite build

### Conversion
Both navigation and utils do not import anything and only hold helper functions. I just had to go through them and define types for variables and arguments (since that's what TypeScript wants).
I'm not going to mention this from now on, so whenever we are converting to typescript, assume that we are going through the files to define the types. It is a right pain and a lot of manual labour, that _you should use AI for in future_.

### Questions
_What does strict turn on? Two checks, kept on and why?_
- Strict is a bundle, turning it on enables:
    - noImplicitAny: a parameter without a type is an error instead of silently defaulting to _any_.
    - strictNullChecks: null and undefined are their own types and they must be handled

_Compile-time type error vs the runtime bugs from Ex1, could TS have caught them?_
- A type error is found by reading the code, before it runs. Some Ex1 bugs were happening while it was running, so it varies.
    - object Object in the timeline (Ex1.5a) would have been found since findLocationById returns a Location object, and pushing it into a string-array list would have been a type error
    - loading flag never reseting (Ex1.3) would not have been caught since a boolean staying true would still be a valid boolean, ergo TS would not have noticed that we never turn off the loading flag

_What does any do, why avoid it in the first pass?_
- Any switches checking off for that value and everything that touches it. So any property access, call, assignable to and from every type, and it spreads. It silences the error without telling the error (which is asking 'what is this thing') the answer. It is stinky too

## Demo 6: Typing domain data

>Rename state.js and api.js to state.ts and api.ts
>
>new js/types.ts
>
>npx tsc (should output no errors)
>
>npm run dev (nothing should have changed)

### js/types.ts
Check the file for code

### Ambiguous field: personIds
In js it was an entry in personIds, which could be an id (nova-byte) OR a name (Nova Byte).
Now with personIds being an array of the personIds type, the old version does not work anymore. TS forces me to decide what a personId is, and I decided that it is IDs only, and not names.

### Questions
_The ambiguous field, how did JS get away with it and what did TS force?_
- See section above

_A data-shape problem types can't catch? What else would you need?_
- Types are erased at build time and res.json() is typed _any_, so const data: Evidence[] = await.json() is an unchecked promise. If evidence.json still had the name "Nova Byte" instead of a personId, tsc would stay happy and the app would load it, and it would only surface at runtime as a wrong filter result or undefined. You need runtime validation in addition, either a hand-written type guard or a schema library that validates the object and revices the TS type from the same schema.

_interface vs type for an object shape, which did I use and does it matter here_
- I used type. For object shapes, they are basically the same.
- Interface can be declared twice and the declarations merge, types cannot
- interface extends with _extend_, type composes with &
- only type can express unions, literals, tuples. PersonId is a union, so it has to be a type.
- I used type for consistence, since PersonId needs type, why bother with interface when I can type everything lol

## Demo 7: Full migration

Alright, I'm mentioning this again just in case you forgot. Migration is a massive pain, you _should_ use AI for this to help you along since Leon's document is a pain to read in my opinion. I'm not detailing the steps of how you migrate, so if you are interested compare the diffs through git.

I did this in three parts:
1. a) typescript-eslint, getElement helper, main / router / storage / dropdowns
2. b) dashboard, people, timeline
3. c) evidence, workspace, allowJs removed
   In the end, every file under the js/ directory was changed to ts. tsconfig has only strict and noEmit, npx tsc = 0 errors, and npm run lint = 0 problems, and clicking through the site shows no differences to the js version.

### Questions
_one type error I had to think about, what did it tell me that review/testing had not?_
- saveCurrentNote: The id of the note is read back from a data attribute, and getAttribute returns string | null. Reading the code, the attribute is obviously always there, and testing always passes because the renderer always writes it. The compiler doesn't trust "obviously": it pointed out that the function has no answer for the missing case, and the JS answer would have been to save the note under the literal key "null". Review and testing only ever see the happy path the code was written for. The type forced a decision for the other path: do nothing.

_when is any the right call during a migration, where do I draw the line?_
- _Any_ is bullshit, I draw the line at using it at all during migration. Eradication is the right call

_did the migration reveal a genuine, previously unnoticed bug ?_
- Yes, the saveCurrentNote bug (first question).

## Demo 8: GitHub Actions

See the .yml file: under .github/workflows/ci.yml (and remember DevOps ! lol)

### CI explanations
- on: push + pull_request push with no branch filter = every push to every branch (including the exercise branches later). pull_request = checks the code a PR would produce once merged, _before merging_. Downside is that it'll run twice when pushing to a branch with an open PR, but that that's fine
- runs-on: ubuntu-latest, every job gets a brand new, empty VM from GitHub
- actions/checkout the VM starts empty, this clones the repo into it
- actions/setup-node installs Node
- cache: npm see question 3. Set explicitly: setup-node only caches on its own when package.json has a packageManager field, and mine doesn't
- npm ci NOT npm install installs exactly what the package-lock.json says, deletes node_modules first, fails if package.json and lockfile disagree, never touches the lockfile
- npm run lint (same script as local)
- npx prettier (checks js only reports, never writes, fails if any files differ)

### Three runs
In the Actions tab, you can see these happening. Once I pushed, it was green and worked well. I then purposefully made it fail by breaking formatting on purpose
(in navigation.ts, I changed:
window.location.hash = viewname; to
window.location.hash=viewname;)
and it failed as expected. I then fixed that mistake and it went to green again.

### Questions
_workflow vs job vs step, point at one of each_
- Workflow = whole file, triggered by an even (e.g. CI, triggered by push / pull_request)
- Job = unit that runs on its own fresh machine (lint, runs on: ubuntu-latest), several jobs run in parallel by default
- Step = one command or action inside a job, run in order on that job's machine (lint, npm run lint). If a step fails, the remaining steps of that job are skipped and the job fails

_why lint/format in CI if it runs on my machine anyway ?_
- Just because it _can_ run locally, does not mean you'll do it every time. It is the same as expecting all strangers to wash their hands, some people just won't and it'll be your problem to deal with if you shake their hand. This ensures it runs, every time

_What does dependency caching do, and what if I removed it ?_
- setup-node saves npm's download cache at the end of a successful run, und a key built from a hash of the package-lock.json. Next run with the same lockfile: cache restored, npm ci takes the packages from the disk instead of downloading them all over again
- If removed, it doesn't change the correctness of anything, just potentially slows down future runs


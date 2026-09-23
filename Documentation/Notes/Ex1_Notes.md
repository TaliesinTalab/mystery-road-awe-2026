# Study guide - Exercise 1 (AWE)

## Stuff that tripped me up

1. The original script was not a module, so everything operated at the global scope, meaning that when _type="module"_ was added, everything migrated into the module's layer (basically being nested inside). Issue with this is the fact that calls like navigateTo broke, and hence needed a way out / in. That's why _window.navigateTo = navigateTo;_ was necessary.
2. _filteredEvidence = allEvidence_ copies the reference, not the content. Basically a pointer from C, ergo both point at the same thing in the memory. Issue is that .sort() returns the og array instead of a copy -> big fuckup if you don't wanna alter the og. 

## Demo 1

App.js was yuge, so it got cut down into the following format (all in folder js/):

    state.js            9 shared values (from 19 globals)
    storage.js          localStore
    api.js              fetches
    router.js           handleHashChange
    navigation.js       navigateTo (alone because it gave me a headache)
    dropdowns.js        populateAllDropdowns
    utils.js            helpers
    main.js             replacement for app.js, core
    views/              dashboard, evidence, people, timeline, workspace
    
Criteria for it were:
    - can it move ? I can comfortably move it out of app.js if it basically didn't reference any globals or was not in a web of pain and complexity
    - does it fit in ? statCardHTML passed the above test and I originally wanted it in utils, but it didn't quite fit in with those, since it builds a part of the dashboard, hence it stayed there
    For state I asked if more than one future module touched it, and nine did

Why navigateTo got a file to itself:
    Views call navigateTo (hereby navTo), router calls the views
        --> if navTo and handleHashChange share router.js, then views and router import each other, which is a cycle and pain
    This actually cost me like an hour and a half (navTo in general), because I couldn't find why _window.navigateTo_ broke after making the app a module.

### Questions for Leon
Q: classic <script> vs <script type="module">, two behavioural differences ?
A: Basically a scope issue. The classic script's own top level was the global scope at the same time, so navigateTo automatically became window.navigateTo. Once the module came in play, that was not the case anymore.  
   Also, the classic version of <script> is blocking, so when the HTML parser reaches that tag, it stops, downloads the file, runs it fully, and only then keeps parsing. Modules are always defered, meaning that they fetch in parallel and are executed after the document is parsed.

Q: allEvidence was a global var. What has to happen now, and what error if I
   forget ?
A: To read it, state.js has to export it and the other module has to import it. To change it, you call a setter inside state.js, or you mutate the object it points at. You can't assign to an import, since it's read only.

Q: named vs default export, where did I choose one ?
A: I used named everywhere and default nowhere. Named because every module exports multiple things and the names help me understand it better, aka it's documentation basically.

Q: why won't type="module" run from file:// ? Same reason as fetch, or different ?
A: Both. Modules are fetched under CORS rules. A file:// page has an "opaque" origin, so the browser treats loading the module as cross-origin and refuses.
   fetch() fails on file:// for the same reason. The main difference is when it checks, the module does it before any line of code runs, so it shouldn't get as far as the fetch error

## Demo 2 - mutation / reference bug

Reproduction:
    1. hard reload
    2. Workspace -> 'selected supporting evidence' starts E1 to E4
    3. Evidence page -> list is stuck loading, which is needed (explanation below)
    4. sort dropdown - 'Title (a-z)', nothing visible happens
    5. Workspace again -> now is shuffled

Root cause:
    setFilteredEvidence(allEvidence) stored the reference and .sort() sorts the og and returns the same array.
    --> symptom A: sorting reordered the master data that everything else reads, getFilteredEvidence rebuilds filteredEvidence from allEvidence and handleSortChange had sorted it afterwards.
    --> symptom B: the sort dropdown did nothing at all

    Why symptom A was reachable in the first place: the alias only survives while getFilteredEvidence has never run, and it never ran because renderEvidenceList returned early while stuck loading.

Fixed it in two parts:
    api.js               setFilteredEvidence(allEvidence.slice())
    views/evidence.js    sort body became sortEvidence(list), and getFilteredEvidence calls it. handleSortChange shrank to just renderEvidenceList().
So sorting is part of rendering now, like the other five controls

Q: reference vs copy, in my own words ?
A: I explained this like bejillion times already I feel

Q: walk through the actions and state that trigger it. Could I have found it by reading the code top to bottom ?
A: Nope. It looks pretty normal, and technically the sorting function was working as intended. The issue was combining two things that didn't wanna get to the same output
   I found it by just messing with the app during the intial bug-hunt and then it was just the most likely culprit, since I had gone through what touches the list

## Demo 3 - the asynch bug

Reproduction:
    1. hardReload
    2. Go to Evidence, loads forever, no cards, empty console
    3. other views still work, dashboard tile says 18 evidence items and workspace dropdown lists them so the data is accessible and not broken or something

Root cause: var evidenceViewLoading = true;  and nothing set it to false --> success handler shat the bed and forgot to set the spinner to false

My fix:
    views/evidence.js   export function setEvidenceViewLoading(value)
    api.js              setEvidenceViewLoading(false); as the first line of the .then

## Demo 4 - the silent bug

Reproduction:
    1. hard reload
    2. DevTools -> Console -> gear -> turn OFF "Group similar", then reload and click any nav button:
        Uncaught TypeError: Cannot read properties of undefined
        (reading 'getAttribute')
    3. One per click, five total: one per view. Doesn't break navigation

Root cause:
    for (var i = 0; i < navButtons.length; i++) {
      navButtons[i].addEventListener("click", function () {
        var targetView = navButtons[i].getAttribute("data-view");

    var i controls the whole function and not just the loop. Loop only stops when i reaches five, so 5 sits there when I click minutes later and navButtons[5] is undefined.

My fix: 
    var i -> let i. let creates a fresh binding per iteration so each handler keeps its own value.

Q: how did I notice it, and why is 'nothing looks broken' not the same as 'nothing is broken' ?
A: I had devtools open when messing about to catch bugs like this, so I got lucky.
   Second half is a braindead question. If your bed looks fine but someone shat under the covers, would there still be shit under the covers ? Wasting my fuckass time

## Demo 5

5a  Timeline said "Location: '[object Object]'
    eventLocationNames.push(evtLoc || item.locationIds[el])
    findLocationById returns the location OBJECT, and .join(", ") stringifies it. The fallback branch pushes the raw id, so somebody thought about the not found case and forgot the found case.
    renderEvidenceDetail already did it properly: loc.id + " - " + loc.name
    Now matches

5b  Dashboard tiles went stale
    Bookmark something, go to Dashboard, tile still says 0. Reload and it is correct
    handleHashChange rendered the dashboard only when !viewRendered.dashboard
    Fix: drop the guard
    before  0 BOOKMARKED | 1 REVIEWED | 6%
    after   1 BOOKMARKED | 2 REVIEWED | 11%

5c  Modal close listeners stacked up
    Open a timeline quick view 3 times and the console counts 'active close listeners: 1, 2, 3'. 
    openEvidenceModal reuses the element on the second open but added a new anonymous function every time. Two functions with identical text are still different objects, so duplicates appear
    Fix: attach it once, inside the if (!modal) block. deleted the log and counter since it was only there to help me find the bug

5e  "First note preview: Promise"
    var firstNote = loadNoteAsync("E01"); console.log(..., firstNote);
    logged the Promise object instead of what it resolves to
    Fixed with .then 

Q: did fixing one bug change, reveal, or accidentally fix another ?
A: Demo 3 was hiding Demo 2, which was a bit of a pain.

## Demo 6

Reproduction:
    1. Be me, hard reload
    2. add breakpoint on the first line of handleSortChange
    3. watch expressions:
        filteredEvidence === allEvidence      -> true
        allEvidence[0].id                     -> "E01"
    4. step over .sort() and allEvidence[0].id becomes 'E12'

Q: step over vs step into, and an example where the wrong one wastes my time ?
A: Step over runs a call and stops on the next line. Step into goes inside it.
   Example: on renderEvidenceList() inside handleSortChange, step over runs the render and I never see why the list stays empty. Step into leads me on to the evidenceViewLoading check
   Vice versa also sucks: stepping into a.title.localeCompare(b.title) drags me into browser internals which suck ass and are of no value to me

Q: what is the call stack, and how did reading it help ?
A: It is the list of calls that are currently unfinished. Paused in handleSortChange, the frame below it was an inline onchange, and clicking it opened VM861:1 containing only "handleSortChange()".
   That isn't a real file. The browser compiles an inline attribute into a function at runtime, so it shows up as a VM script with no source behind it.

Q: what is a conditional breakpoint and why is it more efficient ?
A: Right-click the gutter -> Add conditional breakpoint -> item.id === "E14" 
   It pauses on the fourteenth pass and nowhere else. Without it I press Resume thirteen times

Q: a moment where console.log alone would not have been enough ?
A: The Demo 2 mutation. While logs could have told me the array changed, they couldn't show me  filteredEvidence === allEvidence  being true at the instant before the change, and the value flipping on the very next step, in the same panel.

## Demo 7 - DevTools 

The localStorage keys
    remotion_bookmarks   array of evidence ids, e.g. ["E12","E03"]
    remotion_notes       object, evidence id -> note text
    remotion_hypothesis  the draft: suspectId, nature, evidenceIds, confidence,

Q: console.log vs warn vs error, beyond the colour ?
A: They are log levels, and you can hide everything except errors with the level filter. Warns and errors capture different stack traces that log doesn't.

Q: Network - Status, Type, Time, and how would the app react to a 404 ?
A: Status is the HTTP status code, 200 means the server sent the file. 
   Type is what the browser thinks it is, fetch or script or document. 
   Time is request to fully received.
   If evidence.json returned 404: fetch() does not reject on a 404. The response body is an HTML error page, res.json() then throws a SyntaxError

Q: corrupt a key and reload, what happens and why ?
A: remotion_notes = "not json" killed the whole app, too lazy to figure it out properly

## Demo 8 - clean coding

var / let / const, the three real differences

    SCOPE
      var is FUNCTION-scoped, so it exists everywhere inside the containing function whatever block it was written in
          function f() { if (true) { var a = 1; } console.log(a); }  // 1
      let and const are block-scoped, only inside the nearest braces
          function f() { if (true) { let b = 1; } console.log(b); }  // error

    REASSIGNMENT
      var yes, let yes, const no.
      const freezes the name, not the value:
          const list = []; list.push("a");   // fine
          list = [];                         // TypeError

    HOISTING
      var is hoisted and initialised to undefined, so reading it before its line gives undefined instead of an error
      let and const are hoisted but not initialised, so reading one early throws "Cannot access 'x' before initialization"
      Function declarations are hoisted and fully initialised

Q: what is an accidental global, and what happens now ?
A: In non-strict code, assigning to a name I never declared creates a global:
       function f() { total = 5; }   // creates window.total
   modules are always strict mode, so since the Demo 1 split that same line throws  ReferenceError: total is not defined

two smell I fixed:
    1. dead state. selectedEvidence written twice and never read
       currentPeopleTab written once and never read
    2. two sources of truth for bookmarks. Bookmarks lived both in the bookmarks array and as a .bookmarked flag written onto each evidence object, kept in sync by hand in four places. The cards read the array, the workspace read the flag

## Demo 9 - nested promises to async/await

Q: why is the nested version harder to reason about if they run identically ?
A: The .then version nests the later work inside the earlier part, so the order feels inside-out and the indentation grows stupid large. await puts step 6 below step 5

Q: what does await actually do, and what is the rest of the program doing ?
A: It suspends that function at that line and hands control back to its caller. Nothing else is stopped thouhg, click handlers still run

Q: prove an async function always returns a Promise ?
A: In the console:
       const api = await import("./js/api.js");
       api.loadAllData() instanceof Promise            -> true
       api.loadAllData().then(v => console.log(v))     -> undefined
   loadCorePeopleAndLocations has no return statement at all, so its promise resolves with undefined, and I still have to await or .then it to know it finished

Q: is async/await faster ?
A: No

## Demo 10 - arrow functions

How they work
    function (a, b) { return a + b; }     old way
    (a, b) => { return a + b; }           arrow, full body
    (a, b) => a + b                       arrow, expression body, auto return
    x => x * 2                            one parameter, brackets optional
    () => ({ a: 1 })                      returning an object literal needs the
                                          wrapping brackets, or the { is read
                                          as a code block

    FOUR things differ and nothing else:
      this       an arrow has none of its own, it uses the one from the code around it, decided where it was written, not where it is called
      arguments  an arrow has none of its own
      new        an arrow cannot be constructed
      super      an arrow has none of its own
    Everything else is identical: closures, parameters, defaults, returning, throwing

What I converted, nine of them
    js/utils.js           the three badge-class helpers
    js/views/evidence.js  the four sort comparators, clearest before/after in the codebase
    js/main.js            two addEventListener callbacks

Q: did no-new or no-arguments limit which ones I could convert ?
A: No, nothing here uses either. Every function is a plain helper or a callback. e.g. etSelectedOptions(selectEl) takes its input as a parameter rather than reading arguments, which is why it would convert freely

Q: concrete before/after, and is there a behavioural difference ?
A:     list.sort(function (a, b) { return a.title.localeCompare(b.title); });
       list.sort((a, b) => a.title.localeCompare(b.title));
   just readability

Q: one rule for the team ?
A: don't use them if you are not confident, they are confusing but good for anything passed to something else like callbacks, promise bodies, and event handlers
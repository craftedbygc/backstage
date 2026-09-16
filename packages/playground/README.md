# The playground

The playground is the quickest way to hack on the internals of Theatre. It uses a build setup (see the live-reload esbuild server in [./devEnv/build.ts](./devEnv/build.ts)) that builds all the related packages in one go, so you _don't_ have to run a bunch of build commands separately to start developing.

## Directory structure

```
src/
  shared/                      <---- playgrounds shared with teammates.
    [playground-name]/         <---- each playground has a name...
      index.tsx                <---- and an entry file.

  personal/                    <---- personal playgrounds (gitignored).
    [playground-name]/         <---- personal playgrounds also have names,
      index.tsx                <---- and an entry file.

  tests/                       <---- demo pages (historically used for e2e; demos kept for manual testing).
    [playground-name]/         <---- the name of the demo,
      index.tsx                <---- and its entry file.
```

## How to use the playground

Simply run `yarn run serve` in this folder to start the dev server.

There are some shared playgrounds in `src/shared` which are committed to the repo. You can make your own playgrounds in `src/personal` which will be `.gitignore`d. Note that every playground must include an entry file called `index.tsx` (as you see in the [Directory structure section](#directory-structure)). After `yarn serve` (or `yarn playground` from the repo root), demos are at `/shared/<name>/` — for example `/shared/unload-sheets/` exercises `project.getSheets()`, `sheet.getObjects()`, `detachObject`, and the unload APIs via DOM buttons. Demos under `src/tests/<name>/` are served at `/tests/<name>/`.

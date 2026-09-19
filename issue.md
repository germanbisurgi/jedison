**Issue Description:**

When switching between multiple instances, inactive instances stayed registered.
When collecting error messages with `jedison.getErrors()`, errors from unregistered instances were still included,
leading to a non-empty error array when it should have been empty.
Since I updated the instance.unregister() method the e2e and unittest is green but when i console.log
editor.instances I only see the root instance using the multiple-instance example.

**Instructions:**
1. Run the following tests to reproduce and validate fixes:
    - **E2E test**: `GREP='@multiple-register' yarn test:grep` (only the `@multiple-register` e2e).
      `yarn e2e:grep` is hardcoded to `@object-radios`, so it will not run this scenario.
    - **Unit test**: `yarn unit` (executes all unit tests).
    - Do not start `yarn serve` yourself — every e2e script already starts its own
      preview server on port 8181 via `start-server-and-test`. The suite still passes
      if one is running, but port 8181 is `strictPort`, so the second server fails to
      bind and dumps a confusing `Error: Port 8181 is already in use` stack trace into
      the test output.

2. Debugging workflow:
    - Investigate and **find the real issue**.
    - Propose code changes to fix it.
    - **Before each change and test iteration, ask me if I want you to proceed.**
    - After running tests, report back with results.
    - If a change does not fix the issue, **clean up the code** before moving to the next iteration.

3. Deliverables:
    - Clear explanation of the root cause.
    - Iterative solution approach until the issue is resolved.
    - Clean, working code after the final fix.  

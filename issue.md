**Issue Description:**

When switching between multiple instances, inactive instances stayed registered.
When collecting error messages with `jedison.getErrors()`, errors from unregistered instances were still included,
leading to a non-empty error array when it should have been empty.
Since I updated the instance.unregister() method the e2e and unittest is green but when i console.log
editor.instances I only see the root instance using the multiple-instance example.

**Instructions:**
1. Run the following tests to reproduce and validate fixes:
    - **E2E test**: `yarn serve` and `yarn e2e:grep` (only `@multiple-register` e2e).
    - **Unit test**: `yarn unit` (executes all unit tests).
    - Make sure the server is started before running e2e tests (in separate terminals).

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

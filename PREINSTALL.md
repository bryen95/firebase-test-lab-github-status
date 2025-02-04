Use this extension to trigger status updates in GitHub, whenever your Firebase Test Lab finish running!

It is recommonded to use with async Firebase Test Lab runs. The idea is that you can fire off a long-running test suite, and instead of waiting for the result from a costly CI machine instance, this extension will trigger a Cloud Function when an `onComplete` event is emitted by Firebase Test Lab. The Cloud Function will then set the status on the relevant commit for which it was triggered. This should happen first when the Firebase Test Lab run is started (with a status of `PENDING`), then once more when the run completes (with a status of `SUCCESS` or `FAILURE`).

# Billing

This extension uses other Firebase or Google Cloud Platform services which may have associated charges:


- Cloud Functions

When you use Firebase Extensions, you're only charged for the underlying resources that you use. A paid-tier billing plan is only required if the extension uses a service that requires a paid-tier plan, for example calling to a Google Cloud Platform API or making outbound network requests to non-Google services. All Firebase services offer a free tier of usage. [Learn more about Firebase billing.](https://firebase.google.com/pricing)

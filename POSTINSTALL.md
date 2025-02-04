# Using the extension

This extension is best used with async Firebase Test Lab runs, where you will fire and forget your request, and the Cloud Function will update the relevant commit in GitHub with the result.
You'll need to pass the commit SHA as extra data to your Firebase Test Lab runs. An example gcloud CLI invocation could look like this:

gcloud beta firebase test android run --async \
      // ... any other flags
      --client-info commitSha="${CIRCLE_SHA1}"

(The example uses the CIRCLE_SHA1 env var from CircleCI - you can replace this with your preferred means of obtaining the commit SHA, for whatever CI you use.)

# Monitoring

As a best practice, you can [monitor the activity](https://firebase.google.com/docs/extensions/manage-installed-extensions#monitor) of your installed extension, including checks on its health, usage, and logs.

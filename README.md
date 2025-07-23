Accepts a `url` query paramter, downloads that image, and tries to resize it to a webp with quality `0`
using the workers Image binding.

Then it parses the resulting webp file and determines whether it is a lossless or lossy file.

```
❯ curl http://localhost:55416\?url\=https://placehold.co/600x400/000000/FFFFFF/jpeg
lossless
```

```
❯ curl https://images-webp-lossless-workers-bindings-repro.jeremymorrell.workers.dev/\?url\=https://placehold.co/600x400/000000/FFFFFF/jpeg
lossless
```

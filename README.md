# Full Stack Demo App

## Running the app

```bash
docker compose watch
```

App is available at http://localhost:5173

## Some thoughts on implementation

I'm a fan of not reinventing the wheel and using well-established and widely-used libraries and tools where possible. I took a stab at starting completely from scratch, but got a bit bogged down with getting Docker working properly and with choosing the right tools for the backend given that my recent experience is mainly in Node. I got a very basic template working that way, but chose to switch to this template for the sake of expediency. If I were to spin up a new Docker project for production use, I'd also reach for something like this official template to start with, given that it seems well-maintained and handles a lot of the messy setup. That being said, given more time, I'd want to dive more into the libraries used by this template and make sure that I fully understood them and what the alternatives are.

## Next steps

-   Think more on productionalization of the app, including both where each part (frontend, backend, db) will be hosted and how to build that into a CI/CD pipeline. I'd probably want to use some more managed services for prod, including offloading auth to something like Auth0 and using a managed db service. Honestly, for this type of SPA project assuming the scope isn't expected to grow too much, I'd probably prefer using something like Vercel or Cloudflare Pages. Although managed infrastructure is more expensive, for small teams I think the savings in developer time can often be worth it, and can allow more time for feature development. I know this template is not using Next.js, but I don't think I would prioritize that unless there was a clear need for server-side rendering.
-   UX improvements: I mostly just grabbed what was already in the template, but there's a lot of room for improvement to make it a better task management app. Things like adding cards for each task, animations when checking off a task, adding an endless scroll, etc. I've used Chakra before and liked it, but I've also been playing around with Tailwind recently, and I think integrating that would be a good step to adding more styling flexibility.
-   Code cleanup: I'd want to clean up some of the hacky code I added to get the functionality working, but I'd also like to establish standards for the code base and potentially refactor some of the template code to match those standards.

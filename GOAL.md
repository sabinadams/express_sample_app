# API Requirements

1. Allow a user to save a quote
2. Allow a user to save an author
3. Allow an Author to be created if sent with a quote
4. Default the author of a quote to 'unknown'
5. Allow a user to delete a quote
   1. Delete the author if no more posts use it
6. Allow a user to delete an author
   1. Update any posts using that author to unknown


Route -> Controller -> Service
             |___________|
                    |
                 Helpers
# Features

  - Threads, replies
  - Threads rise on a new reply
  - Threads softlimits (threads won't raise after N replies)
  - Threads hardlimits (threads won't allow more than M replies)
  - Password-protected content management
  - Owner password to delete thread or reply
  - Owner password to warn or to ban a user by their post ID
  - Markup: line breaks, paragraphs, >quotes, @threads, #replies, http(s) links
  - Short threads listing with latest posts preview
  - Full threads listing
  - No client-side JavaScript or cookies are required for all the above
  - Autosize and text autosave, automatic ID insertion for reply (requires JavaScript and cookies, not neccessary)

Some protection:

  - No silent rises: when a reply is deleted, thread become lowered to a previous raising time, not a deleted reply creation time
  - Rate limits: limit requests for same IP in a set time period
  - Password hashing: passwords are hashed by Argon2id function
  - Warning for users: engine owner can mark a post to warn user
  - Ban for users: engine owner can mark a post to ban user for a specific term

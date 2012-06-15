Twet.js
=======

### A jQuery plugin for basic Twitter search streams

Check out the [live demo](http://frxnz.github.com/twetjs), and basic documentation.

Twet.js started as a fairly basic piece of code for [Sugarloaf.com](http://www.sugarloaf.com). We wanted to use a hashtag ([#SLsnow](https://www.twitter.com/#!/%23SLsnow)) to give our guests a way to submit their on-mountain conditions reports right to our website. But as we grew, and as Twitter grew, new opportunities began to arise.

Twitter has a widget for search feeds. I'll even show you, it's [right here](https://twitter.com/about/resources/widgets/widget_search). But it's very limited, it's not very customizable, and it's hard to brand. You'll run into similar problems with most other plugins. I wrote Twet.js to overcome these problems, and to hopefully help other people overcome these problems.

### Goals
Twet.js is young. I started working on it in May 2012, and I only work on it in my spare time. So it's far from where I want it to be. My first goal was to get a plugin with some basic Twitter functionality. Now I'm building on that. Here's what you can look forward to in future version.

- **Better Templating**. Twet.js is certainly more customizable than the Twitter widget, but it could be better. The goal is to make everything more modular, so you can display exactly how you want it.
- **Reply, retweet, and favorite**. These are things I want you to be able to do right from your search stream. This is something you won't find in most Twitter stream plugins, but you'll find it here.
- **Media**. Twitter recently added media to the entities portion of it's API. This is pretty killer, especially if you're trying to crowdsource photos related to your business using a hashtag.
- **Conversations**. One of the great things about Twitter is the ability to have threaded conversations. Hashtags are a great way to track conversations, but sometimes the chatter strays from the tag.
- **Multiple Feeds**. You can put multiple feeds on a page right now, but the refreshing and new tweet notification gets a little hairy.
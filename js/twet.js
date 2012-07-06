/*!
 *
 * Twet.js
 * A simple jQuery plugin for adding Twitter streams to your website
 * Author: Derek Wheelden
 * Version: 1.3
 * Requires: jQuery 1.6+
 * Copyright (c) 2012, Derek Wheelden (derek[dot]wheelden[at]gmail[dot]com)
 */

;(function ( $, window, document, undefined ) {

    "use strict";

    $.fn.twetJs = function( options ) {
		
        var settings = {
            $element      : this,
            query         : '#twitter',
            limit         : 1,
            refreshTweets : false,
            refreshRate   : 30000,
            titleBadge    : false,
            blacklist     : []
        };
	
        if(typeof options === "object") {
            settings = $.extend(settings, options);
        } else if (typeof options === "string") {
            settings = $.extend(settings, {
                query : options
            });
        }
		
        var methods = {
            buildFeedUrl : function (isRefresh, refreshUrl) {

                var query = settings.query.replace("#","%23").replace("@", "%40");

                if (isRefresh) {
                    return "http://search.twitter.com/search.json" + refreshUrl;
                } else {
                    return "http://search.twitter.com/search.json?q=" + query + "&rpp=" + settings.limit + "&include_entities=t";
                }

            },
            buildNewTweetsBadge : function ( newTweets ) {

                $("<a/>", {
                    id: "newTwets",
                    href: "#",
                    css: { "display" : "none" },
                    text: newTweets + " new tweets"
                }).prependTo(settings.$element).slideDown('slow');

            },
            buildTimeStamp : function ( tweetTime ) {
                var present = new Date(),
                    timezoneOffset = present.getTimezoneOffset() / 60;

                var year     = tweetTime.substr(12, 4),
                    date     = tweetTime.substr(5, 2),
                    hour     = tweetTime.substr(17, 2) - timezoneOffset,
                    minute   = tweetTime.substr(20,2),
                    second   = tweetTime.substr(23,2),
                    monthtxt = tweetTime.substr(8, 3);

                return monthtxt + ' ' + date + ', ' + year + ' @ ' + hour + ':' + minute + ':' + second;
            },
            buildRelativeTime : function( tweetTime ) {
                var period, periodLabel,
                    msPerMinute    = 60 * 1000,
                    msPerHour      = msPerMinute * 60,
                    msPerDay       = msPerHour * 24,
                    msPerMonth     = msPerDay * 30,
                    msPerYear      = msPerDay * 365,
                    present        = new Date(),
                    timezoneOffset = present.getTimezoneOffset() / 60;
								
                var year     = tweetTime.substr(12, 4),
                    day      = tweetTime.substr(0, 3),
                    date     = tweetTime.substr(5, 2),
                    hour     = tweetTime.substr(17, 2) - timezoneOffset,
                    minute   = tweetTime.substr(20,2),
                    second   = tweetTime.substr(23,2),
                    monthtxt = tweetTime.substr(8, 3),
                    months = {
                        Jan : "01",
                        Feb : "02",
                        Mar : "03",
                        Apr : "04",
                        May : "05",
                        Jun : "06",
                        Jul : "07",
                        Aug : "08",
                        Sep : "09",
                        Oct : "10",
                        Nov : "11",
                        Dec : "12"
                    };

                var month = months[monthtxt] - 1;

                var past = new Date(year, month, date, hour, minute, second, 999),
                    elapsed = present - past;

                if (elapsed < msPerMinute) {
                    // return Math.round(elapsed/1000) + ' seconds ago';
                    return Math.round(elapsed/1000) + 's';
                }
                else if (elapsed < msPerHour) {
                    period      = Math.round(elapsed/msPerMinute);
                    periodLabel = (period === 1) ? 'minute' : 'minutes';
                    // return period + ' ' + periodLabel + ' ago';
                    return period + 'm';
                } else {
                    return parseFloat(date).toFixed() + ' ' + monthtxt;
                }

                /*
                else if (elapsed < msPerDay ) {
                    period      = Math.round(elapsed/msPerHour);
                    periodLabel = (period === 1) ? 'hour' : 'hours';
                    // return period + ' ' + periodLabel + ' ago';
                    return period + 'h';
                }

                else if (elapsed < msPerMonth) {
                    period      = Math.round(elapsed/msPerDay);
                    periodLabel = (period === 1) ? 'day' : 'days';
                    // return period + ' ' + periodLabel + ' ago';
                    return period + 'd';
                }

                else if (elapsed < msPerYear) {
                    period      = Math.round(elapsed/msPerMonth);
                    periodLabel = (period === 1) ? 'month' : 'months';
                    // return period + ' ' + periodLabel + ' ago';
                    return period + 'mo';
                }

                else {
                    period      = Math.round(elapsed/msPerYear);
                    periodLabel = (period === 1) ? 'year' : 'years';
                    //return period + ' ' + periodLabel + ' ago';
                    return period + 'y';
                }
                */
            },
            parseTweet : function ( text, entity ) {

                var username,
                    hashtag,
                    url,
                    displayUrl,
                    longUrl,
                    baseUrl = "https://twitter.com/#!/";

                // Parse username mentions
                $(entity.user_mentions).each(function (index) {

                    username = this.screen_name;
                    text     = text.replace("@" + username, "<a href=\"" + baseUrl + username + "\" title=\"@" + username + "\">@" + username + "</a>");

                });

                // Parse hashtags
                $(entity.hashtags).each(function (index) {

                    hashtag = this.text;
                    text    = text.replace("#" + hashtag, "<a href=\"" + baseUrl + "search/%23" + hashtag + "\" title=\"#" + hashtag + "\">#" + hashtag + "</a>");

                });

                // Parse URLs
                $(entity.urls).each(function (index) {

                    url        = this.url;
                    displayUrl = this.display_url;
                    longUrl    = this.expanded_url;
                    text       = text.replace(url, "<a href=\"" + url + "\" title=\"" + longUrl + "\">" + displayUrl + "</a>");

                });

                return text;
            }
        };

        String.prototype.parseURL = function () {
            return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function (url) {
                return '<a href="' + url + '" target="_blank">' + url + '</a>';
            });
        };

        String.prototype.parseUsername = function () {
            return this.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
                var username = u.replace("@","");
                return u.link("http://twitter.com/"+username);
            });
        };

        String.prototype.parseHashtag = function () {
            return this.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
                var tag = t.replace("#","%23");
                return '<a href="http://search.twitter.com/search?q=' + tag + '" target="_blank">' + t + '</a>';
            });
        };

        return this.each(function() {

            (function getTweets( feedUrl ) {

                $.ajax({
                    type: "GET",
                    url: feedUrl || methods.buildFeedUrl(),
                    dataType: "jsonp",
                    success: function ( json ){

                        // Make sure we found somes tweets to show.
                        if(!json.results.length) {
                            $("<div/>", {
                                id: "twetError",
                                css: { "display" : "none" },
                                text: "Woops! We couldn't find any tweets!"
                            }).prependTo(settings.$element).fadeIn('slow');
                            return false;
                        }

                        // Store data in variable, store URL to check for new tweets, intitialize count
                        var results    = json.results,
                            refreshUrl = json.refresh_url,
                            count      = 1;

                        /*
                         *  Here we're creating a container for blocks of tweets to live in.
                         *  This allows us to prepend "new tweet" sections, while using append
                         *  to maintain chronological order.
                         */
                        $("<div/>", {
                            "class" : "twetGroupWrapper"
                        }).prependTo(settings.$element);

                        // Store this container in a var for use in the .each()
                        var $appendWrapper = $(settings.$element).find('.twetGroupWrapper').first();

                        // Let the fun begin. Here come the tweets.
                        $(results).each(function () {

                            // Shove all the JSON data into an object
                            var tweetProps = {
                                timestamp : this.created_at,
                                username  : this.from_user,
                                fullName  : this.from_user_name,
                                avatarUrl : this.profile_image_url,
                                tweetId   : this.id_str,
                                tweetText : this.text,
                                entities  : this.entities,
                                mention   : this.to_user
                            };

                            // Tweep blacklist. If their username exists in settings.blacklist, skip 'em
                            if ($.inArray(tweetProps.username, settings.blacklist) > -1) {
                                return true;
                            }

                            // Build dates. Turn hashtags, URLs, and @mentions into links.
                            var fullDate     = methods.buildTimeStamp(tweetProps.timestamp),
                                relativeDate = methods.buildRelativeTime(tweetProps.timestamp),
                                parsedTweet  = methods.parseTweet(tweetProps.tweetText, tweetProps.entities),
                                timeStamp    = "<a href=\"https://twitter.com/#!/" + tweetProps.username + "/status/" + tweetProps.tweetId + "\" title=\"" + fullDate + "\">" + relativeDate + "</a>";
                                //parsedStamp  = stamp.parseUsername();

                            // Shove all the tweets into that DIV we created earlier
                            $("<div/>", {
                                "class" : "twet clearfix",
                                html    :
                                    "<a href=\"https://www.twitter.com/" + tweetProps.username + "\" title=\"@" + tweetProps.username + "\">" +
                                        "<img src=\"" + tweetProps.avatarUrl + "\" alt=\"" + tweetProps.username + "\" class=\"twetAvatar\" />" +
                                    "</a>" +
                                    "<div class=\"twetTextBox\">" +
                                        "<div class=\"clearfix\">" +
                                            "<div class=\"twetTime\">" + timeStamp + "</div>" +
                                            "<div class=\"twetUser\">" +
                                                "<strong><a href=\"https://www.twitter.com/" + tweetProps.username + "\" title=\"@" + tweetProps.username + "\">" + tweetProps.fullName + "</a></strong> " +
                                                " <small><a href=\"https://www.twitter.com/" + tweetProps.username + "\" title=\"@" + tweetProps.username + "\">@" + tweetProps.username + "</a></small>" +
                                            "</div>" +
                                        "</div>" +
                                        "<div class=\"twetText\">" + parsedTweet + "</div>" +
                                        "<div class=\"twetInteract\">" +
                                            "<a href=\"https://twitter.com/intent/tweet?in_reply_to=" + tweetProps.tweetId + "\"><span class=\"icon reply\"></span> Reply</a>" +
                                            "<a href=\"https://twitter.com/intent/retweet?tweet_id=" + tweetProps.tweetId + "\"><span class=\"icon retweet\"></span> Retweet</a>" +
                                            "<a href=\"https://twitter.com/intent/favorite?tweet_id=" + tweetProps.tweetId + "\"><span class=\"icon favorite\"></span> Favorite</a>" +
                                        "</div>" +
                                    "</div>"
                            }).appendTo($appendWrapper);

                            // If we've reached the limit, let's get out of this loop
                            if (count === settings.limit) {
                                return false;
                            }
        
                            count++; // Duh
                    
                        });

                        // Now we're going to periodically check for new tweets. Unless !settings.refreshTweets
                        if (settings.refreshTweets) {
                            (function getNewTweets() {

                                // Build the ajax URL. We're doing it here because we actually need it again later
                                var newTwetUrl = methods.buildFeedUrl(true, refreshUrl);

                                setTimeout(function () {
                                    $.ajax({
                                        type: "GET",
                                        url: newTwetUrl,
                                        dataType: "jsonp",
                                        success: function (json){

                                            // Store JSON in var, see how many new tweets we found
                                            var results       = json.results,
                                                newTweetCount = results.length;

                                            if ( !results.length ) {

                                                // If we didn't find new tweets, we'll check again
                                                getNewTweets();

                                            } else {

                                                // If we found new tweets, let's notify the user
                                                // Make the badge, then give it something to do
                                                methods.buildNewTweetsBadge(newTweetCount);

                                                if (settings.titleBadge) {
                                                    var $title     = $("title"),
                                                        pageTitle  = $title.text();

                                                    $title.text("(" + newTweetCount + ") " + pageTitle);
                                                }
                                                

                                                $("#newTwets").click(function(e){

                                                    e.preventDefault();

                                                    if ($title) {
                                                        $title.text(pageTitle);
                                                    }

                                                    $(this).slideUp('slow', function() {

                                                        $(this).remove();
                                                        getTweets(newTwetUrl);

                                                    });

                                                });

                                                // We won't need to check again, so let's clear the setTimeout
                                                clearTimeout();

                                            }

                                        }
                                    });
                                }, settings.refreshRate);

                            }());
                        }

                    },
                    error: function(jqXHR, textStatus, errorThrown) {

                        // Do some error handling

                    },
                    complete: function(jqXHR, textStatus) {

                        if (textStatus === "success") {
                            // Do some success handling
                        } else {
                            // Do some error handling
                        }

                    }
                });

            }());

        });

    };

    (function() {
        if (window.__twitterIntentHandler) {
            return;
        }

        var intentRegex = /twitter\.com(\:\d{2,4})?\/intent\/(\w+)/,
            windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
            width = 550,
            height = 420,
            winHeight = screen.height,
            winWidth = screen.width;

        function handleIntent(e) {
            e = e || window.event;
            var target = e.target || e.srcElement,
                m, left, top;

            while (target && target.nodeName.toLowerCase() !== 'a') {
                target = target.parentNode;
            }

            if (target && target.nodeName.toLowerCase() === 'a' && target.href) {
                m = target.href.match(intentRegex);
                if (m) {
                    left = Math.round((winWidth / 2) - (width / 2));
                    top = 0;

                    if (winHeight > height) {
                        top = Math.round((winHeight / 2) - (height / 2));
                    }

                    window.open(target.href, 'intent', windowOptions + ',width=' + width +
                                               ',height=' + height + ',left=' + left + ',top=' + top);
                    e.returnValue = false;
                    e.preventDefault();
                }
            }
        }

        if (document.addEventListener) {
            document.addEventListener('click', handleIntent, false);
        } else if (document.attachEvent) {
            document.attachEvent('onclick', handleIntent);
        }
        window.__twitterIntentHandler = true;
    }());

}( jQuery, window, document ));




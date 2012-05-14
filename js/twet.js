/*!
 *
 * Twet.js
 * A simple jQuery plugin for adding Twitter streams to your website
 * Author: Derek Wheelden
 * With help from: Joshua Marsh
 * Requires: jQuery 1.6+
 *
 * Copyright (c) 2012, Derek Wheelden (derek[dot]wheelden[at]gmail[dot]com)
 */

;(function ( $, window, document, undefined ) {

    $.fn.twetJs = function( options ) {
		
        var settings = {
            $element      : this,
            query         : '%23twitter',
            limit         : 5,
            refreshTweets : true,
            refreshRate   : 30000,
            titleBadge    : true,
            blacklist     : []
        }
    		
        if(typeof options === "object") {
            var settings = $.extend(settings, options);
        } else if (typeof options === "string") {
            var settings = $.extend(settings, {
                query : options
            });
        }
		
        var methods = {
            buildFeedUrl : function (isRefresh, refreshUrl) {

                var query = settings.query.replace("#","%23").replace("@", "%40");

                if (isRefresh) {
                    return 'http://search.twitter.com/search.json' + refreshUrl;
                } else {
                    return 'http://search.twitter.com/search.json?q=' + query;
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
                var present = new Date();
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
                    months = {};

                months['Jan'] = "01";
                months['Feb'] = "02";
                months['Mar'] = "03";
                months['Apr'] = "04";
                months['May'] = "05";
                months['Jun'] = "06";
                months['Jul'] = "07";
                months['Aug'] = "08";
                months['Sep'] = "09";
                months['Oct'] = "10";
                months['Nov'] = "11";
                months['Dec'] = "12";

                var month = months[monthtxt] - 1;

                var past = new Date(year, month, date, hour, minute, second, 999),
                    elapsed = present - past;

                if (elapsed < msPerMinute) {
                    return Math.round(elapsed/1000) + ' seconds ago';
                }

                else if (elapsed < msPerHour) {
                    period      = Math.round(elapsed/msPerMinute);
                    periodLabel = (period === 1) ? 'minute' : 'minutes';
                    return period + ' ' + periodLabel + ' ago';
                }

                else if (elapsed < msPerDay ) {
                    period      = Math.round(elapsed/msPerHour);
                    periodLabel = (period === 1) ? 'hour' : 'hours';
                    return period + ' ' + periodLabel + ' ago';
                }

                else if (elapsed < msPerMonth) {
                    period      = Math.round(elapsed/msPerDay);
                    periodLabel = (period === 1) ? 'day' : 'days';
                    return period + ' ' + periodLabel + ' ago';
                }

                else if (elapsed < msPerYear) {
                    period      = Math.round(elapsed/msPerMonth);
                    periodLabel = (period === 1) ? 'month' : 'months';
                    return period + ' ' + periodLabel + ' ago';
                }

                else {
                    period      = Math.round(elapsed/msPerYear);
                    periodLabel = (period === 1) ? 'year' : 'years';
                    return period + ' ' + periodLabel + ' ago';
                }
            }
        }

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
                            class: "twetGroupWrapper",
                            css: { "display" : "none" }
                        }).prependTo(settings.$element);

                        // Store this container in a var for use in the .each()
                        var $appendWrapper = $(settings.$element).find('.twetGroupWrapper').first();

                        // Let the fun begin. Here come the tweets.
                        $(results).each(function () {

                            // Shove all the JSON data into an object
                            var tweetProps = {
                                timestamp : this.created_at,
                                username  : this.from_user,
                                avatarUrl : this.profile_image_url,
                                tweetId   : this.id_str,
                                tweetText : this.text,
                                mention   : this.to_user
                            };

                            // Tweep blacklist. If their username exists in settings.blacklist, skip 'em
                            if ($.inArray(tweetProps.username, settings.blacklist) > -1) {
                                return true;
                            }

                            // Build dates. Turn hashtags, URLs, and @mentions into links.
                            var fullDate     = methods.buildTimeStamp(tweetProps.timestamp),
                                relativeDate = methods.buildRelativeTime(tweetProps.timestamp),
                                parsedTweet = tweetProps.tweetText.parseURL().parseUsername().parseHashtag(),
                                stamp       = "<a href=\"https://twitter.com/#!/" + tweetProps.username + "/status/" + tweetProps.tweetId + "\" title=\"" + fullDate + "\">" + relativeDate + "</a> from @" + tweetProps.username,
                                parsedStamp = stamp.parseUsername();

                            // Shove all the tweets into that DIV we created earlier
                            $appendWrapper
                                .append("<div class=\"twet clearfix\"><img src=\"" +
                                    tweetProps.avatarUrl + "\" alt=\"" + tweetProps.username + "\" /><div>" +
                                    parsedTweet + "<br /><small>" + parsedStamp + "</small></div></div>")
                                .slideDown();

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

                            })();
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

            })();

        });

    };

})( jQuery, window, document );
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
            $element  : this,
            query     : '%23twitter',
            limit     : 10,
            blacklist : []
        }
    		
        if(typeof options === "object") {
            var settings = $.extend(settings, options);
        } else if (typeof options === "string") {
            var settings = $.extend(settings, {
                query : options
            });
        }
		
        var methods = {
            buildFeedUrl : function () {
                var query = settings.query.replace("#","%23").replace("@", "%40");
                return 'http://search.twitter.com/search.json?q=' + query + '&page=1';
            },
            buildTimeStamp : function ( tweetTime ) {
                var year     = tweetTime.substr(12, 4),
                    date     = tweetTime.substr(5, 2),
                    hour     = tweetTime.substr(17, 2),
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

            $.ajax({ 
                type: "GET",
                url: methods.buildFeedUrl(),
                dataType: "jsonp",
                success: function ( json ){
					
                    if(!json.results.length) {
                        settings.$element.append("<div class=\"twetError\">Woops! We couldn't find any tweets!</div>");
                        return false;
                    }

                    var results = json.results,
                        count = 1,
                        first = results[0].id_str;
					
                    $(results).each(function () {
                        var tweetProps = {
                            timestamp : this.created_at,
                            username  : this.from_user,
                            avatarUrl : this.profile_image_url,
                            tweetId   : this.id_str,
                            tweetText : this.text,
                            mention   : this.to_user
                        };
						
                        /* User blacklist. Use sparingly */	
                        if ($.inArray(tweetProps.username, settings.blacklist) > -1) {
                            return true;
                        }

                        var fullDate     = methods.buildTimeStamp(tweetProps.timestamp),
                            relativeDate = methods.buildRelativeTime(tweetProps.timestamp),
                            parsedTweet = tweetProps.tweetText.parseURL().parseUsername().parseHashtag(),
                            stamp       = "<a href=\"https://twitter.com/#!/" + tweetProps.username + "/status/" + tweetProps.tweetId + "\" title=\"" + fullDate + "\">" + relativeDate + "</a> from @" + tweetProps.username,
                            parsedStamp = stamp.parseUsername();
    
                        settings.$element.append("<div class=\"twet clearfix\"><img src=\"" +
                            tweetProps.avatarUrl + "\" alt=\"" + tweetProps.username + "\" /><div>" +
                            parsedTweet + "<br /><small>" + parsedStamp + "</small></div></div>");
    
                        if (count === settings.limit) {
                            return false;
                        }
    
                        count++;
                
                    });

                    /*
                    function getnewTwits() {
                      setTimeout(function () {
                        $.ajax({ 
                          type: "GET",
                          url: 'http://search.twitter.com/search.json?q=%23slsnow&page=1',
                          dataType: "jsonp",
                          success: function (json){
                            var newResults = json.results;
                            var newFirst = newResults[0].id_str;
                            if ( newFirst === first ) {
                              getnewTwits();
                            }
                            else { 
                              $('#newtweets').show();
                              clearTimeout();
                            }
                          }
                        });
                      }, 30000);
                    }

                    getnewTwits();
                    */
                }
            });

            /*
            $('#newtweets').click(function () {
              $('#newtweets').hide();
              $('#thetweets').empty();
              getTwit();
            });
            */

        });

    };

})( jQuery, window, document );
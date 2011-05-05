/*              Author : Shezard
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details.
 *
 * Keep in mind that it's a work in progress, not optimized nor refactored,
 * feel free to contact me dam[dot]shezard[at]gmail[dot]com
 */

/*
 * TODO : load default lvl ?
 *      add optionnal special case ? o : {}
 *      add movement special case ? m : {}
 *          implement movement inside the editor ?
 *      enable class/property/options/movement edition ? (onclick => a div)
 *
 */

$(document).ready(function () {

    (function($) {

        var level = 0;
        var id = [];
        id[level] = 0;

        var levels = [{
                blocs : []
        }];

        $('#p').append('<option>blocking</option><option>hurtable</option><option>collectable</option><option>openable</option><option>climable</option><option>swimable</option>');

        $('#add').click(function(){
            $('#form').show();
        });

        $('#show').click(function(){
            data();
        });

        $('#ok').click(function(){
            var c = $('#c').attr('value');
            var p = $('#p').attr('value');

            $('#game-area').append('<div id="bloc-'+level+'-'+id[level]+'" class="common '+c+' '+p+'"></div>');
            
            $('#game-area > *:last').draggable({
                grid : [15,15],
                stop: function(event, ui) {
                    var who = ui.helper.attr('id').split('-')[2];
                    levels[level].blocs[who].x = ui.position.left;
                    levels[level].blocs[who].y = ui.position.top;
                }
            });
            $('#game-area > *:last').resizable({
                grid : [15,15],
                stop: function(event, ui) {
                    var who = ui.helper.attr('id').split('-')[2];
                    levels[level].blocs[who].w = parseInt(ui.helper.css('width'),10);
                    levels[level].blocs[who].h = parseInt(ui.helper.css('height'),10);
                }
            });

            $('#form').hide();

            id[level] += 1;

            levels[level].blocs.push({
                i : id[level],
                c : c,
                p : p,
                x : 0,
                y : 0,
                w : 30,
                h : 30
            });
        });

        $('#cancel').click(function(){
            $('#form').hide();
        });

        var data = function() {
            var result = 'blocs : [';
            var i;
            for(i = 0 ; i < levels[level].blocs.length ; i++) {
                var bloc =levels[level].blocs[i]
                result += '{i : '+bloc.i+',\nc : \''+bloc.c+'\',\np : \''+bloc.p+'\',\nx : '+bloc.x+',\ny : '+bloc.y+',\nw : '+bloc.w+',\nh : '+bloc.h+'}';
            }
            result += ']';
            alert(result);
        }

    }($));

});
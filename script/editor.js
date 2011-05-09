/*              Author : Shezard
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details.
 *
 * Keep in mind that it's a work in progress, bug may or may not persist after the realease,
 * feel free to contact me dam[dot]shezard[at]gmail[dot]com or on twitter @shezard
 */

/*
 *  Patch Notes
 *  29/04 9:15 clicking on a div allow you to activate something
 *  29/04 9:31 clicking on a div allow you to show an editor of this div (the editor AINT working yet)
 *  29/04 9:37 clicking on a div allow you to edit this div =) /cheer
 *  29/04 10:22 upgrade forms css ... a bit cuter
 *  29/04 10:31 updrade conf css ... a bit cuter too
 *  29/04 10:32 comment the level form, useless at this point
 *  29/04 11:17 add ENTER shortcut so you can validate creation/edition faster, improved css again
 *  29/04 11:24 added the remove feature
 *  29/04 11:26 remove fully working, add ESCAPE shortcut to cancel the current menu
 *  29/04 14:02 implements new css to support more elements and added new p property (toggable,readable,accelerator,equipable)
 *  29/04 14:18 fixed a typo causing climbable to not work
 *  29/04 15:15 add o/m/bo/bm to the html file can now be use to script optionnal object
 *  29/04 17:36 fixed a bug causing a crash in game (not valid json)
 *  29/04 18:04 improved json readability, upgrade form & blocEditor to support checked/not checked o & m values
 */

/*
 * TODO : load default lvl ?
 *      add optionnal special case ? o : {}
 *      add movement special case ? m : {}
 *              implement movement inside the editor ?
 */

/*
 * property to edit :
 *  |o  : {
 *              |state : string(open|closed|on|off)|
 *              |,required : string(bloc.c)|
 *              |,hp : int|
 *              |,loot : {bloc}|
 *          }|
 *  |,m : {
 *          length : int,
 *          steps : {
 *                  start : int,
 *                  end : int
 *                  | ,vx : int |
 *                  | ,vy : int |
 *              }
 *          }|
 *
 * must set accurate spec for each bloc (obviously M is ok for everyone)
 * but o is a tad weirdos and non standard (also maybe everything (for more consistency should have a default (non-o behavior)))
 */

$(document).ready(function () {

    (function($) {
        
        var generateOptionList = function(array) {
            if(typeof array === 'number') {
                var i,result = '';
                for(i = 0; i < array ; i += 1) {
                    result += '<option>'+i+'</option>';
                }
                return result;
                
            }else {
                return ('<option>'+array.join('</option><option>')+'</option>');
            }
        }
        
        var cClasses = [
        'grass',
        'grass-wall',
        'wall',
        'ceil',
        'coin',
        'ghost step-0',
        'ghost step-1',
        'door',
        'door open',
        'key1',
        'key2',
        'ladder',
        'water',
        'lever on',
        'lever off',
        'sign',
        'hammer',
        'smallBloc',
        'crate'
        ];
        
        var pClasses = [
        'blocking',
        'hurtable',
        'collectable',
        'equipable',
        'openable',
        'climbable',
        'swimable',
        'toggable',
        'readable',
        'accelerator'
        ];
        
        var level = 0;
        var id = [];
        id[level] = 0;

        var levels = [{
            blocs : []
        }];
    
        levels = window.levels;
        
        var bloc;
        
        $('#lvl').append(generateOptionList(levels.length));
        
        $('#c').append(generateOptionList(cClasses));
        $('#bc').append(generateOptionList(cClasses));
        $('#p').append(generateOptionList(pClasses));
        $('#bp').append(generateOptionList(pClasses));
        
        $('#form,#blocEditor').draggable();

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

            if($('#m > input[type="checkbox"]').attr('checked') === true && $('#m > input[type="checkbox"]').attr('checked') === true) {
                levels[level].blocs.push({
                    i : id[level],
                    c : c,
                    p : p,
                    x : 0,
                    y : 0,
                    w : 30,
                    h : 30,
                    m : {},
                    o : {}
                });
            } else if($('#m > input[type="checkbox"]').attr('checked') === true) {
                levels[level].blocs.push({
                    i : id[level],
                    c : c,
                    p : p,
                    x : 0,
                    y : 0,
                    w : 30,
                    h : 30,
                    m : {}
                });
            }else if($('#o > input[type="checkbox"]').attr('checked') === true) {
                levels[level].blocs.push({
                    i : id[level],
                    c : c,
                    p : p,
                    x : 0,
                    y : 0,
                    w : 30,
                    h : 30,
                    o : {}
                });
            } else {
                levels[level].blocs.push({
                    i : id[level],
                    c : c,
                    p : p,
                    x : 0,
                    y : 0,
                    w : 30,
                    h : 30
                });
            }
        });

        $('#cancel').click(function(){
            $('#form').hide();
        });

        var data = function() {
            var result = 'blocs : [';
            var i,j = 1;
            for(i = 0 ; i < levels[level].blocs.length ; i++) {
                var bloc = levels[level].blocs[i];
                if(bloc.hasOwnProperty('i')) {
                    var options = '';
                    if(bloc.hasOwnProperty('m')) {
                        options += ',\nm : {} ';
                    }
                    if(bloc.hasOwnProperty('o')) {
                        options += ',\no : {} ';
                    }

                    result += '{\ni : '+j+',\nc : \''+bloc.c+'\',\np : \''+bloc.p+'\',\nx : '+bloc.x+',\ny : '+bloc.y+',\nw : '+bloc.w+',\nh : '+bloc.h+options+'\n}';
                    j += 1;
                    if(i !== levels[level].blocs.length -1) {
                        result += ',';
                    }
                }
            }
            result += ']';
            alert(result);
        }

        $('.common').live('click',function() {

            var id = $(this).attr('id').split('-')[2];

            edit(id);

        });

        var edit = function(id) {

            bloc = levels[level].blocs[id];

            $('#blocEditor').show();
            $('#bc').attr('value',bloc.c);
            $('#bp').removeAttr('selected');
            $('#bp > option:contains('+bloc.p+')').attr('selected','selected');
            if(bloc.hasOwnProperty('m')) {
                $('#bm > input[type="checkbox"]').attr('checked',true);
            }
            if(bloc.hasOwnProperty('o')) {
                $('#bo > input[type="checkbox"]').attr('checked',true);
            }
        }
        
        $('#bok').click(function() {
            $('#blocEditor').hide();
            bloc.c = $('#bc').attr('value');
            bloc.p = $('#bp').attr('value');
            $('#bloc-'+level+'-'+(bloc.i -1)).removeClass();
            $('#bloc-'+level+'-'+(bloc.i -1)).addClass('common '+bloc.c+' '+bloc.p);
        });

        $('#bcancel').click(function() {
            $('#blocEditor').hide();
        });

        $('#remove-text').click(function() {
            $('#blocEditor').hide();
            $('#bloc-'+level+'-'+(bloc.i -1)).remove();
            levels[level].blocs[(bloc.i -1)] = {};
        });

        $('#m > input[type="checkbox"]').bind('change', function(){
            if($(this).attr('checked') === true) {
                $('#m').append('<br id="bs"/><label id="ls" for="s">steps : </label><input id="s" type="text"/>');
            } else {
                $('#bs,#ls,#s').remove();
            }
        });

        $('#bm > input[type="checkbox"]').bind('change', function(){
            if($(this).attr('checked') === true) {
                $('#bm').append('<div class="ops">Im opts</div>');
                if(!bloc.hasOwnProperty('m')) {
                    levels[level].blocs[(bloc.i -1)].m = {};
                }
            } else {
                $('.ops').remove();
                delete levels[level].blocs[(bloc.i -1)].m;
            }
        });

        $(window).keypress(function(event){
            switch(event.which) {
                case 13 :
                    if($('#form').css('display') !== 'none') {
                        $('#ok').trigger('click');
                    }
                    if($('#blocEditor').css('display') !== 'none') {
                        $('#bok').trigger('click');
                    }
                    break;
                case 0 :
                    if($('#form').css('display') !== 'none') {
                        $('#cancel').trigger('click');
                    }
                    if($('#blocEditor').css('display') !== 'none') {
                        $('#bcancel').trigger('click');
                    }
                    break;
            }
        });
    }($));

});
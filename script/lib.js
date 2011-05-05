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

/* Patch Notes
 * 28/04 10:52 inventory are now displayable
 * 28/04 13:15 toggable working + multiple hp mob working
 * 28/04 13:24 toggable fully working, support css state
 * 28/04 13:32 readable implemented , can alert their text
 * 28/04 13:37 readable fully working, a bit buggy if you spam'em
 * 28/04 14:21 lootable works just asign it to the b.o.loot (b.i must be equal to b.o.loot.i or shit happens)
 * 28/04 14:36 add images to the inventory
 */

/*
 * TODO :: todo list =)
 * upgdrade inventory (especially the matching css)
 * add a need collectable that give life to the player
 * work on the editor
 * make new level
 * make a shop to use coins ? in game or from inventory
 * add another classic ressource, aswell as some challenge
 * (re)implements spikes (or an option for the hurtable ?)
 * add the name of the game in the menu & upgrade the menu aswell => loop animation ?
 */

$(document).ready(function () {

    var main = {
        //a lancer au chargement de la page, appelle le createur de menu
        autoExec : function() {
            this.menu.show(this);
        },
        //le createur de menu
        menu : {
            show : function(context){
                $('body').append('<span id="menu">New game !</span>');
                $('#menu').click(function(){
                    context.game.start(context);
                    context.menu.hide();
                });
            },
            hide : function() {
                $('#menu').remove();
            }
        },
        //le createur de jeu
        game : {
            //charge un niveau et lance la boucle principale
            start : function(context) {
                context.game.load(context);
                context.game.loop(context);
            },
            //parse le level actuel et genere les divs
            load : function(context) {
                context.storage.running = false;
                $('#gamearea').remove();
                $('body').append('<div id="gamearea"></div>');
                var lvl = context.levels[context.storage.currentLevel];
                var i;
                for(i = 0 ; i < lvl.blocs.length ; i += 1) {

                    var state = '';
                    if(lvl.blocs[i].hasOwnProperty('o')) {
                        if(lvl.blocs[i].o.hasOwnProperty('state')) {
                            state = lvl.blocs[i].o.state;
                        }
                    }
                    if(lvl.blocs[i].hasOwnProperty('i')) {
                        $('#gamearea').append('<div id="bloc-'+context.storage.currentLevel+'-'+lvl.blocs[i].i+'" class="common '+lvl.blocs[i].c+' '+lvl.blocs[i].p+' '+state+'" style="top:'+lvl.blocs[i].y+'px;left:'+lvl.blocs[i].x+'px;width:'+lvl.blocs[i].w+'px;height:'+lvl.blocs[i].h+'px;"></div>');
                        if(lvl.blocs[i].hasOwnProperty('m') && lvl.blocs[i].m.hasOwnProperty('step')) {
                            context.movable.loadSteps(lvl.blocs[i],context);
                        }
                    }
                }
                $('#gamearea').append('<div id="player" style="top:'+context.player.y+'px;left:'+context.player.x+'px;width:'+context.player.w+'px;height:'+context.player.h+'px;"></div>');
                context.storage.running = true;
            },
            //boucle principale
            loop : function(context) {
                if(context.storage.running) {
                    var now = new Date().getTime();

                    context.trigger.monitor(context);
                    context.movable.monitor(context);
                    context.player.monitor(context);
                    
                    if(context.microtime) {
                        $('#info2').append(new Date().getTime() - now +'.');
                    }
                }
                setTimeout(function(){
                    context.game.loop(context);
                },17);
                
                
            },
            gameOver : function(context) {
                context.storage.running = false;
                setTimeout(function(){
                    window.location.reload();
                },1000);
            }
        },
        //storage global, reset a la mort du perso
        storage : {
            currentLevel : 0,
            running : false
        },
        player : {
            vx : 0,
            vy : 0,
            x : 200,
            y : 50,
            w : 16,
            h : 26,
            hp : 3,
            immune : false,
            constants : {
                vxMin : -5,
                vxMax : 5,
                vyMin : -10,
                vyMax : 15,
                jumpLimit : true
            },
            open : {
                top : true,
                left : true,
                bot : true,
                right : true
            },
            floor : false,
            collide : false,
            inventory : [],
            monitor : function(context) {

                //reset this.constants to their initial values
                this.resetConstants(context);
                //check whether or not the player is in collision with any corpse and triger the corresponing treatment
                this.collisionRoutine(context);
                //fill this.open with the correct value, and this.floor aswell
                this.canMove(context);
                //move the player or correct the vx & vy values
                this.validateMovement(context);
                //apply gravity and friction to the player vx & vy
                this.updatePlayerSpeed(context);
                //manade the player steps
                this.updatePlayerSteps();
                //manage the player display
                this.updatePlayerDisplay();
                //debug
                if(context.debug) {
                    $('#info').html('hp :'+this.hp+' vx:'+ this.vx + ' vy:'+this.vy + ' f:'+(this.floor || 'no') + ' <br/>c:'+(this.collide || 'no') + ' <br/>i:'+this.inventory);
                }
            },
            resetConstants : function(context) {
                this.constants.vxMin = context.world.air.vxMin;
                this.constants.vxMax = context.world.air.vxMax;
                this.constants.vyMin = context.world.air.vyMin;
                this.constants.vyMax = context.world.air.vyMax;
                this.constants.jumpLimit = context.world.air.jumpLimit;
            },
            canMove : function(context) {

                this.open.top = true;
                this.open.left = true;
                this.open.bot = true;
                this.open.right = true;
                this.floor = false;
                this.collide = false;

                var i;
                for(i = 0 ; i < context.levels[context.storage.currentLevel].blocs.length ; i += 1) {
                    var btt = context.levels[context.storage.currentLevel].blocs[i];
                    var x = btt.x, y = btt.y, x2 = x+btt.w, y2 = y+btt.h;
                    switch(btt.p) {
                        case 'blocking' :
                            
                            if((this.x >= x && this.x <= x2) || (this.x+this.w >= x && this.x+this.w <= x2)) {
                                if(this.y-this.vy <= y2 && this.y-this.vy >= y ) {
                                    this.open.top = false;
                                }
                            }

                            if((this.y >= y && this.y <= y2) || (this.y+this.h >= y && this.y+this.h <= y2)) {
                                if(this.x+this.vx <= x2 && this.x+this.vx >= x ) {
                                    this.open.left = false;
                                }
                            }

                            if((this.x >= x && this.x <= x2) || (this.x+this.w >= x && this.x+this.w <= x2)) {
                                if(this.y+this.h-this.vy <= y2 && this.y+this.h-this.vy >= y ) {
                                    this.floor = btt.i;
                                    this.open.bot = false;
                                }
                            }

                            if((this.y >= y && this.y <= y2) || (this.y+this.h >= y && this.y+this.h <= y2)) {
                                if(this.x+this.w+this.vx <= x2 && this.x+this.w+this.vx >= x ) {
                                    this.open.right = false;
                                }
                            }
                            break;
                        case 'hurtable' :
                            if((this.x >= x && this.x <= x2) || (this.x+this.w >= x && this.x+this.w <= x2)) {
                                if(this.y+this.h-this.vy <= y2 && this.y+this.h-this.vy >= y && this.vy < 0) {
                                    this.killMob(context,btt.i);
                                    break;
                                }
                            }
                        default :
                            if((this.x >= x && this.x <= x2) || (this.x+this.w >= x && this.x+this.w <= x2)) {
                                if(this.y <= y2 && this.y >= y ) {
                                    this.collide = [btt.i,btt.p,btt.c];
                                    break;
                                }
                            }

                            if((this.y >= y && this.y <= y2) || (this.y+this.h >= y && this.y+this.h <= y2)) {
                                if(this.x <= x2 && this.x >= x ) {
                                    this.collide = [btt.i,btt.p,btt.c];
                                    break;
                                }
                            }

                            if((this.x >= x && this.x <= x2) || (this.x+this.w >= x && this.x+this.w <= x2)) {
                                if(this.y+this.h <= y2 && this.y+this.h >= y ) {
                                    this.collide = [btt.i,btt.p,btt.c];
                                    break;
                                }
                            }

                            if((this.y >= y && this.y <= y2) || (this.y+this.h >= y && this.y+this.h <= y2)) {
                                if(this.x+this.w <= x2 && this.x+this.w >= x ) {
                                    this.collide = [btt.i,btt.p,btt.c];
                                    break;
                                }
                            }
                            break;
                    } 
                }
            },
            validateMovement : function(context) {

                var i,j,bloc;
                if((this.open.right && this.vx > 0) || (this.open.left && this.vx < 0)) {
                    this.updatePlayerPosX();
                    this.updatePlayerDiv();
                } else {
                    // Half Working
                    for(i = 0; i < context.levels[context.storage.currentLevel].blocs.length ; i += 1) {
                        if(context.levels[context.storage.currentLevel].blocs[i].i === this.floor && context.levels[context.storage.currentLevel].blocs[i].hasOwnProperty('m')) {
                            bloc = context.levels[context.storage.currentLevel].blocs[i];
                            for(j = 0 ; j < bloc.m.steps.length ; j += 1) {
                                if(bloc.m.steps[j].start < bloc.m.step && bloc.m.steps[j].end > bloc.m.step && bloc.m.steps[j].hasOwnProperty('vx')) {
                                    this.x += bloc.m.steps[j].vx;
                                }
                            }
                        }
                    }
                    this.vx = Math.floor(this.vx / 2);
                    this.updatePlayerDiv();
                }

                if((this.open.top && this.vy > 0) || (this.open.bot && this.vy < 0)) {
                    this.updatePlayerPosY();
                    this.updatePlayerDiv();
                } else {
                    for(i = 0; i < context.levels[context.storage.currentLevel].blocs.length ; i += 1) {
                        if(context.levels[context.storage.currentLevel].blocs[i].i === this.floor && context.levels[context.storage.currentLevel].blocs[i].hasOwnProperty('m')) {
                            bloc = context.levels[context.storage.currentLevel].blocs[i];
                            for(j = 0 ; j < bloc.m.steps.length ; j += 1) {
                                if(bloc.m.steps[j].start < bloc.m.step && bloc.m.steps[j].end > bloc.m.step && bloc.m.steps[j].hasOwnProperty('vy')) {
                                    this.y -= bloc.m.steps[j].vy;
                                }
                            }
                        }
                    }
                    this.vy = this.vy / 2;
                    this.updatePlayerDiv();
                }
            },
            updatePlayerSpeed : function(context) {

                if(this.vy > this.constants.vyMin) {
                    this.vy -= 1;
                }
                
                if(context.keyboard.q && this.vx > this.constants.vxMin) {
                    this.vx -= 1;
                }
                else if(this.vx < 0) {
                    this.vx += 1;
                }
                
                if (context.keyboard.d && this.vx < this.constants.vxMax) {
                    this.vx += 1;
                }
                else if(this.vx > 0) {
                    this.vx -= 1;
                }
                
            },
            updatePlayerPosX : function() {
                this.x += this.vx;
            },
            updatePlayerPosY : function() {
                this.y -= this.vy;
            },
            updatePlayerDiv : function() {
                $('#player').css({
                    top : this.y+'px',
                    left : this.x+'px'
                });
            },
            updatePlayerSteps : function() {
                if(this.hasOwnProperty('step')) {
                    if(this.step < 20) {
                        this.step += 1;
                    } else {
                        this.step = 0;
                    }
                } else {
                    this.step = 0;
                }
            },
            updatePlayerDisplay : function() {
                if(this.state) {
                    $('#player').removeClass().addClass(this.state);
                } else {
                    if(this.vx > 0) {
                        $('#player').removeClass().addClass('stateless-right-step-'+(Math.ceil(this.step/10) || 1));
                    } else if(this.vx < 0) {
                        $('#player').removeClass().addClass('stateless-left-step-'+(Math.ceil(this.step/10)  || 1));
                    } 
                }
            },
            killMob : function(context,i) {
                var j;
                for(j = 0 ; j < context.levels[context.storage.currentLevel].blocs.length ; j += 1) {
                    if(context.levels[context.storage.currentLevel].blocs[j].hasOwnProperty('o') && context.levels[context.storage.currentLevel].blocs[j].i === i) {
                    
                        if(context.levels[context.storage.currentLevel].blocs[j].o.hasOwnProperty('hp')) {
                            context.levels[context.storage.currentLevel].blocs[j].o.hp -= 1;
                            if(context.levels[context.storage.currentLevel].blocs[j].o.hp === 0) {
                                this.removeMob(context,i);
                            } else {
                                this.vy = 10;
                            }
                        }
                    }
                    else if(context.levels[context.storage.currentLevel].blocs[j].i === i) {
                        this.removeMob(context,i);
                    }
                }
            },

            removeMob : function(context,i) {
                if (context.levels[context.storage.currentLevel].blocs[i - 1].hasOwnProperty('o') && context.levels[context.storage.currentLevel].blocs[i - 1].o.hasOwnProperty('loot')) {
                    context.levels[context.storage.currentLevel].blocs[i - 1] = context.levels[context.storage.currentLevel].blocs[i - 1].o.loot;
                    this.vy = 10;
                    $('#bloc-'+context.storage.currentLevel+'-'+i).addClass('dying');
                    $('#bloc-'+context.storage.currentLevel+'-'+i).fadeOut(500,function() {
                        $(this).remove();
                        var b = context.levels[context.storage.currentLevel].blocs[i - 1], state = '';
                        if(b.hasOwnProperty('o')) {
                            if(b.hasOwnProperty('state')) {
                                state = b.o.state;
                            }
                        }
                        $('#gamearea').append('<div id="bloc-'+context.storage.currentLevel+'-'+b.i+'" class="common '+b.c+' '+b.p+' '+state+'" style="top:'+b.y+'px;left:'+b.x+'px;width:'+b.w+'px;height:'+b.h+'px;display:none"></div>');
                        $('#gamearea > div:last').fadeIn(500);
                        if(b.hasOwnProperty('m') && b.m.hasOwnProperty('step')) {
                            context.movable.loadSteps(b,context);
                        }
                    });
                } else {
                    context.levels[context.storage.currentLevel].blocs[i - 1] = {};
                    this.vy = 5;
                    $('#bloc-'+context.storage.currentLevel+'-'+i).addClass('dying');
                    $('#bloc-'+context.storage.currentLevel+'-'+i).fadeOut(500,function() {
                        $(this).remove();
                    });
                }
            },
            // check whether or not a collision is occuring, if so handle it by switching around bloc.p and doing stuff
            collisionRoutine : function(context) {
                if(this.collide) {
                    switch(this.collide[1]) {
                        case 'hurtable' :
                            this.getHurt(context);
                            break;
                        case 'collectable' :
                            this.collect(context);
                            break;
                        case 'openable' :
                            this.getThrough(context);
                            break;
                        case 'climbable' :
                            this.state = 'climb';
                            this.climb();
                            break;
                        case 'swimable' :
                            this.swim(context);
                            break;
                        case 'toggable' :
                            this.toggle(context);
                            break;
                        case 'readable' :
                            this.read(context);
                            break;
                    }
                } else {
                    this.state = false;
                }
            },
            //do stuff for the hurtable
            getHurt : function(context) {
                if(!this.immune) {
                    this.hp -= 1;
                    if(this.hp === 0) {
                        context.game.gameOver(context);
                    }
                    this.immune = true;
                    this.state = 'hurt';

                    var that = this;
                    setTimeout(function(){
                        if(that.immune) {
                            that.immune = false;
                        }
                    },1000);
                }
            },
            //do stuff for the collectable
            collect : function(context) {
                this.inventory.push(this.collide);
                context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)] = {};
                $('#bloc-'+context.storage.currentLevel+'-'+this.collide[0]).remove();

                var i;
                for(i = 0 ; i < context.levels[context.storage.currentLevel].blocs.length ; i++) {
                    if(context.levels[context.storage.currentLevel].blocs[i].hasOwnProperty('o')) {
                        if(context.levels[context.storage.currentLevel].blocs[i].o.hasOwnProperty('state')){
                            if(context.levels[context.storage.currentLevel].blocs[i].o.state === 'closed') {
                                if(this.inventory[this.inventory.length -1][2] === context.levels[context.storage.currentLevel].blocs[i].o.required ) {
                                    context.levels[context.storage.currentLevel].blocs[i].o.state = 'open';
                                    $('#bloc-'+context.storage.currentLevel+'-'+context.levels[context.storage.currentLevel].blocs[i].i).addClass('open');
                                }
                            }
                        }
                    }
                }
            },
            //do stuff for the openable
            getThrough : function(context) {
                
                if (context.keyboard.s && context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.state === 'open'){
                    if(context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.hasOwnProperty('level')){
                        
                        this.x = context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.x;
                        this.y = context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.y;
                        context.storage.currentLevel = context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.level;
                        context.game.load(context);
                        context.keyboard.s = false;
                    }
                    else if(context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.hasOwnProperty('x') && context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.hasOwnProperty('y')) {
                        this.x = context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.x;
                        this.y = context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.y;
                        context.keyboard.s = false;
                    }
                }
            },
            climb : function() {
                this.vy = 3;
            },
            swim : function(context) {
                if(this.vy < context.world.water.vyMin) {
                    this.vy = context.world.water.vyMin;
                }
                this.constants.vyMax = context.world.water.vyMax;
                this.constants.vyMin = context.world.water.vyMin;
                this.constants.jumpLimit = context.world.water.jumpLimit;
            },
            toggle : function(context) {
                if(context.keyboard.s){
                    context.keyboard.s = false;
                    if(context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.state === 'on') {
                        context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.state = 'off';
                        $('#bloc-'+context.storage.currentLevel+'-'+this.collide[0]).removeClass('on').addClass('off');
                        if(typeof context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.on === 'function') {
                            context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.on(context);
                        }
                    } else if (context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.state === 'off') {
                        context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.state = 'on';
                        $('#bloc-'+context.storage.currentLevel+'-'+this.collide[0]).removeClass('off').addClass('on');
                        if(typeof context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.off === 'function') {
                            context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.off(context);
                        }
                    }
                }
            },
            read : function(context) {
                if(context.keyboard.s) {
                    context.keyboard.s = false;
                    if(context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.hasOwnProperty('text') && context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.hasOwnProperty('step')) {
                        $('#dialog').remove();
                        $('#gamearea').append('<div id="dialog">'+context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.text[context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.step]+'</div>');
                        $('#dialog').fadeOut(5000, function(){
                            $('#dialog').remove();
                        });

                        if(context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.step === context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.text.length -1) {
                            context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.step = 0;
                        } else {
                            context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.step += 1;
                        }
                    }
                }
            },
            toggleInventory : function(context) {
                if(context.storage.running) {
                    this.openInventory(context);
                } else {
                    this.closeInventory(context);
                }
            },
            openInventory : function(context) {
                context.storage.running = false;
                var i,helper = [], store = [], item,itemName = '',itemInfo = '', htmlInventory = '';
                for(i = 0 ; i < this.inventory.length ; i+= 1) {
                    if(helper.indexOf(this.inventory[i][2]) === -1) {
                        helper.push(this.inventory[i][2]);
                        store[this.inventory[i][2]] = 1;
                    } else {
                        store[this.inventory[i][2]] += 1;
                    }
                }
                for(item in store) {
                    (store[item] > 1) ? itemName = item+'s' : itemName = item;
                    if(store[item] > 1) {
                        itemInfo = ' : ' + store[item];
                    }
                    htmlInventory += '<div class="item"><div class="itemImage '+item+'"></div>'+itemName+itemInfo+'</div><br/>';
                    itemName = '';
                    itemInfo = '';
                }

                $('#gamearea').append('<div id="inventory">'+htmlInventory+'</div>');
            },
            closeInventory : function(context) {
                $('#inventory').remove();
                context.storage.running = true;
            }
        },
        movable : {
            monitor : function(context) {
                var i;
                for(i = 0 ; i < context.levels[context.storage.currentLevel].blocs.length ; i++) {
                    if(context.levels[context.storage.currentLevel].blocs[i].hasOwnProperty('m')) {
                        var bloc = context.levels[context.storage.currentLevel].blocs[i];
                        this.manageSteps(bloc);
                        this.executeSteps(bloc,context);
                    }
                }
            },
            manageSteps : function(bloc) {
                if(bloc.m.hasOwnProperty('step')) {
                    if(bloc.m.step < bloc.m.length) {
                        bloc.m.step += 1;
                    } else {
                        bloc.m.step = 0;
                    }
                } else {
                    bloc.m.step = 0;
                }
            },
            executeSteps : function(bloc,context) {
                var i;
                for(i = 0 ; i < bloc.m.steps.length ; i++) {
                    if(bloc.m.steps[i].start <= bloc.m.step && bloc.m.steps[i].end > bloc.m.step) {
                        if(bloc.m.steps[i].start === bloc.m.step) {
                            if(i === 0) {
                                $('#bloc-'+context.storage.currentLevel+'-'+bloc.i).removeClass('step-'+(bloc.m.steps.length - 1 ));
                            } else {
                                $('#bloc-'+context.storage.currentLevel+'-'+bloc.i).removeClass('step-'+(i-1));
                            }
                            $('#bloc-'+context.storage.currentLevel+'-'+bloc.i).addClass('step-'+i);
                        }
                        this.move(bloc,i,context);
                    }
                }
            },
            loadSteps : function(bloc,context) {
                for(i = 0 ; i < bloc.m.steps.length ; i++) {
                    if(bloc.m.steps[i].start <= bloc.m.step && bloc.m.steps[i].end > bloc.m.step) {
                        $('#bloc-'+context.storage.currentLevel+'-'+bloc.i).addClass('step-'+i);
                    }
                }
            },
            move : function(bloc,step,context) {
                if(bloc.m.steps[step].hasOwnProperty('vx')) {
                    bloc.x += bloc.m.steps[step].vx;
                    $('#bloc-'+context.storage.currentLevel+'-'+bloc.i).css({
                        left : bloc.x+'px'
                    });
                }
                if(bloc.m.steps[step].hasOwnProperty('vy')) {
                    bloc.y -= bloc.m.steps[step].vy;
                    $('#bloc-'+context.storage.currentLevel+'-'+bloc.i).css({
                        top : bloc.y+'px'
                    });
                }
            }
        },
        trigger : {
            monitor : function(context) {
                var i;
                if(context.levels[context.storage.currentLevel].hasOwnProperty('triggers')) {
                    for(i = 0 ; i < context.levels[context.storage.currentLevel].triggers.length ; i += 1) {
                        if(typeof context.levels[context.storage.currentLevel].triggers[i] === 'function') {
                            if(context.levels[context.storage.currentLevel].triggers[i](context)) {
                            // exec ...
                            } else {
                                context.levels[context.storage.currentLevel].triggers[i] = {};
                            }
                        }
                    }
                }
            }
        },
        world : {
            air : {
                vxMin : -5,
                vxMax : 5,
                vyMin : -10,
                vyMax : 15,
                jumpLimit : true
            },
            water : {
                vxMin : -5,
                vxMax : 5,
                vyMin : -1,
                vyMax : 8,
                jumpLimit : false
            }
        },
        keyboard :  {
            q : false,
            s : false,
            d : false
        },
        // levels : [{level},{level},...]
        // level : |name,|blocs : [{bloc},{bloc},...]
        // bloc : i(blocId),c(blocCssClass),p(blocProperty),x,y,w,h|,o|,m|
        // o : custom
        // m : length,steps : [{step},{step},...]
        // step : start,end,vx
        levels : [{
            name : 'first level',
            blocs : [{
                i : 1,
                c : 'grass',
                p : 'blocking',
                x : 0,
                y : 510,
                w : 960,
                h : 30
            },{
                i : 2,
                c : 'wall',
                p : 'blocking',
                x : 0,
                y : 0,
                w : 30,
                h : 510
            },{
                i : 3,
                c : 'wall',
                p : 'blocking',
                x : 930,
                y : 0,
                w : 30,
                h : 510
            },{
                i : 4,
                c : 'coin',
                p : 'collectable',
                x : 130,
                y : 480,
                w : 16,
                h : 16
            },{
                i : 5,
                c : 'coin',
                p : 'collectable',
                x : 170,
                y : 480,
                w : 16,
                h : 16
            },{
                i : 6,
                c : 'ghost',
                p : 'hurtable',
                x : 540,
                y : 480,
                w : 30,
                h : 30,
                m : {
                    length : 160,
                    steps : [{
                        vx : 2,
                        start : 0,
                        end : 80
                    },{
                        vx : -2,
                        start : 80,
                        end : 160
                    }]
                }
            },{
                i : 7,
                c : 'door',
                p : 'openable',
                x : 400,
                y : 450,
                w : 30,
                h : 60,
                o : {
                    state : 'closed',
                    required : 'key1',
                    x : 362,
                    y : 470,
                    level : 1
                }
            }, {
                i : 8,
                c : 'key1',
                p : 'collectable',
                x : 500,
                y : 470,
                w : 16,
                h : 16
            },{
                i : 9,
                c : 'ceil',
                p : 'blocking',
                x : 30,
                y : 0,
                w : 900,
                h : 30
            },{
                i : 10,
                c : 'lever on',
                p : 'toggable',
                y : 470,
                x : 800,
                w : 30,
                h : 30,
                o : {
                    state : 'on',
                    on : function(context){
                        alert('on ')
                    },
                    off : function(){
                        alert('off')
                    }
                }
            }],
            triggers : [
            function(context){
                //do stuff
                return false;
            }]
        },{
            name : 'second level',
            blocs : [{
                i : 1,
                c : 'grass',
                p : 'blocking',
                x : 0,
                y : 510,
                w : 960,
                h : 30
            },{
                i : 2,
                c : 'door open',
                p : 'openable',
                x : 360,
                y : 450,
                w : 30,
                h : 60,
                o : {
                    state : 'open',
                    x : 402,
                    y : 470,
                    level : 0
                }
            },{
                i : 3,
                c : 'ladder',
                p : 'climbable',
                x : 115,
                y : 330,
                w : 15,
                h : 180
            },{
                i : 4,
                c : 'grass',
                p : 'blocking',
                x : 130,
                y : 330,
                w : 90,
                h : 30,
                m : {
                    length : 240,
                    steps : [{
                        vx : 2,
                        start : 0,
                        end : 120
                    },{
                        vx : -2,
                        start : 120,
                        end : 240
                    }]
                }
            },{
                i : 5,
                c : 'water',
                p : 'swimable',
                x : 500,
                y : 330,
                w : 430,
                h : 180
            },{
                i : 6,
                c : 'grass-wall',
                p : 'blocking',
                x : 470,
                y : 330,
                w : 30,
                h : 180
            },{
                i : 7,
                c : 'key2',
                p : 'collectable',
                x : 700,
                y : 490,
                w : 16,
                h : 16
            },{
                i : 8,
                c : 'ladder',
                p : 'climbable',
                x : 455,
                y : 330,
                w : 15,
                h : 180
            },{
                i : 9,
                c : 'wall',
                p : 'blocking',
                x : 0,
                y : 0,
                w : 30,
                h : 510
            },{
                i : 10,
                c : 'wall',
                p : 'blocking',
                x : 930,
                y : 0,
                w : 30,
                h : 510
            },{
                i : 11,
                c : 'ceil',
                p : 'blocking',
                x : 30,
                y : 0,
                w : 900,
                h : 30
            },{
                i : 12,
                c : 'door',
                p : 'openable',
                x : 160,
                y : 270,
                w : 30,
                h : 60,
                o : {
                    state : 'closed',
                    required : 'key2',
                    x : 100,
                    y : 100,
                    level : 2
                },
                m : {
                    length : 240,
                    steps : [{
                        vx : 2,
                        start : 0,
                        end : 120
                    },{
                        vx : -2,
                        start : 120,
                        end : 240
                    }]
                }
            },{
                i : 13,
                c : 'ghost_static',
                p : 'hurtable',
                x : 410,
                y : 480,
                w : 30,
                h : 30,
                o : {
                    hp : 2,
                    loot : {
                        i : 13,
                        c : 'ghost',
                        p : 'hurtable',
                        x : 410,
                        y : 480,
                        w : 30,
                        h : 30,
                        m : {
                            length : 160,
                            steps : [{
                                vx : 2,
                                start : 0,
                                end : 80
                            },{
                                vx : -2,
                                start : 80,
                                end : 160
                            }]
                        }
                    }
                }
            }]
        }],
        debug : false,
        microtime : false
    };

    main.autoExec();

    $(window).keypress(function(event){
        switch(event.which) {
            case 122 :
                if(main.player.floor) {
                    main.player.vy = main.player.constants.vyMax;
                }
                else if(!main.player.constants.jumpLimit) {
                    main.player.vy = main.player.constants.vyMax;
                }
                break;

            case 101 :
                main.player.toggleInventory(main);
                break;

        //            case 0 :
        //                main.player.closeInventory(main);
        //                break;
        }
    });

    $(window).keydown(function(event){
        switch(event.which) {
            case 81 :
                main.keyboard.q = true;
                break;
            case 83 :
                main.keyboard.s = true;
                break;
            case 68 :
                main.keyboard.d = true;
                break;
        }
    });

    $(window).keyup(function(event){
        switch(event.which) {
            case 81 :
                main.keyboard.q = false;
                break;
            case 83 :
                main.keyboard.s = false;
                break;
            case 68 :
                main.keyboard.d = false;
                break;
        }
    });
});
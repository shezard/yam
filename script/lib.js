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

/* Patch Notes
 * 28/04 10:52 inventory are now displayable
 * 28/04 13:15 toggable working + multiple hp mob working
 * 28/04 13:24 toggable fully working, support css state
 * 28/04 13:32 readable implemented , can alert their text
 * 28/04 13:37 readable fully working, a bit buggy if you spam'em
 * 28/04 14:21 lootable works just asign it to the b.o.loot (b.i must be equal to b.o.loot.i or shit happens)
 * 28/04 14:36 add images to the inventory
 * 28/04 15:11 add the background handler (gamearea now got a 'level'+currentLevel class)
 * 28/04 16:30 add the invincible optionnal property to the mob ! spikes are now working !
 * 28/04 19:30 add a new level (the editor is almost awesome :p)
 * 28/04 20:26 add accelerator (o.vx &| o.vy), add equipable, can distinguish between equipable & other normal collectable
 * 28/04 21:08 inventory updrage can distinguish between not-equipable, equipable & equiped stuff
 * 28/04 21:53 you can now swap between equipable items ! juste click'em
 * 28/04 22:05 you can now use item via a switch(main.player.equiped) !
 * >> EOF :: cya tomorrow
 * 28/04 9:01 collision detection for the blocbreaker ok , weird bug tho will attempt to fix it asap
 * 29/04 9:03 bug fixed
 * 29/04 9:06 blockbreaker removes blocs !!!
 * 29/04 11:56 breakable blocs now support multiple hp with opacity switch juste add o.mph to the bloc !!
 * 29/04 13:51 the player now start on the floor and no more in the air
 * 29/04 13:58 upgrade the hp display and the third level
 * 29/04 14:12 added a new level
 * 29/04 14:54 fixed various bug with the new level
 * 29/04 16:32 add a new mob inside lvl 4
 * 29/04 21:00 fix a bug with water & ladder setting the current state to climb forever
 * 29/04 21:21 fix a bug causing loot to be drop at the wrong place (in case the mob were moving)
 * 29/04 21:23 changed sword to hammer in the js/css
 * 29/04 21:32 player state now supports direction, weird bug appears need to be fix asap
 * 29/04 21:39 bug fixed, you can now ask the player's last recorded direction via this.direction (should reply right or left)
 * 29/04 21:50 reskin of sign & lever, looted readable aint working
 * 29/04 21:54 nvm firebug was hiding the dialog box zzz
 * 29/04 22:27 hp bar for mob, bug free and all =)
 * >> EOF :: cya tomorrow
 * 30/04 10:54 upgrade the level 1 to add a real use to the lever (toggalable are rly easy to use :p)
 * 30/04 10:58 fix a new bug with the lootable
 * 30/04 11:11 change the skin of the sword => hammer
 * 30/04 11:23 add a skin for the hurt state, and fix a bug with the left+state / right+state skins
 * 30/04 13:54 first implementation of the horizontal scrolling
 * 30/04 15:58 upgrade level 1 again
 * >> EOF :: cya tomorrow
 * 01/04 11:59 inventory don't show anymore when he's empty
 * 01/04 13:41 fix a bug with the css of the hp
 * 01/04 21:05 game over upgrade
 * >> EOF :: cya tomorrow
 * 02/05 7:31 add support for mutiple step + a state at the same time
 * 02/05 7:39 the hurt state now really last 1sec
 * 02/05 7:56 improved a bit the scrolling
 * 02/05 09:47 add a new skin for the water mob, add an ugly skin for the breakables
 * 02/05 10:18 upgrade hammer animation
 * 02/05 11:23 updrage the hp css to support scrolling
 * 02/05 18:30 remove the scrolling
 * >> EOF :: cya tomorrow
 * 03/05 7:44 various improvement for the first level
 * 03/05 7:52 added missing case to canMove( collectable smaller than the player)
 * 03/05 8:06 upgrade water graphics
 * 03/05 9:23 add level 5
 * 03/05 10:27 add the boss for the level 5
 */

/*
 * TODO
 * pass the code through jslint (again & again)
 * add a collectable that give life to the player => add 'healable' on collision grant bloc.o.hp HP to the player ! then dissapear (ala collectable)
 * need trees too ... maybe a grouping of blocking can make a good tree ?
 * and temple ... tons of ... and tunnels ... and minecart ... minecart are awesome
 * i think a css hack can do the trick so you jump on a 30*30 rolling cart ::))
 * make a shop to use coins ? in game or from the inventory
 * add another basic ressources, aswell as some challenge
 * the ressources should be gold ? iron ? wood ? stone ?
 * upgrade the menu => loop animation ?
 * remove the current triggers and implements usefull ones
 * work on the scenario
 * add a vilain ? the evil from the js gentleman ?
 * add projectile (must be canMove() checked ... will be cpu exausting ...) ?
 * add loot for the breakable (ala hurtable)
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
                $('body').append('<div id="menu"><h1>Y<span class="small">et</span> A<span class="small">nother</span> M<span class="small">ario</span></h1><span id="start">Insert Me </span><br/><br/><span class="info">Controls : z &uarr;,q &larr;,d &rarr;,s Action,space Use items</span></div>');
                $('#start').click(function(){
                    //                    context.storage.currentLevel = 4;
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
                var lvl = context.levels[context.storage.currentLevel] , i, state;
                
                context.storage.running = false;
                $('#gamearea').remove();
                $('body').append('<div id="gamearea" class=level"'+context.storage.currentLevel+'"><div id="hp">'+context.player.showHeart(context.player.hp)+'</div></div>');
                for(i = 0 ; i < lvl.blocs.length ; i += 1) {
                    state = '';
                    if(lvl.blocs[i].hasOwnProperty('o')) {
                        if(lvl.blocs[i].o.hasOwnProperty('state')) {
                            state = lvl.blocs[i].o.state;
                        }
                    }
                    if(lvl.blocs[i].hasOwnProperty('i')) {
                        $('#gamearea').append('<div id="bloc-'+context.storage.currentLevel+'-'+lvl.blocs[i].i+'" class="common '+lvl.blocs[i].c+' '+lvl.blocs[i].p+' '+state+'" style="top:'+lvl.blocs[i].y+'px;left:'+lvl.blocs[i].x+'px;width:'+lvl.blocs[i].w+'px;height:'+lvl.blocs[i].h+'px;"></div>');
                        if(lvl.blocs[i].hasOwnProperty('o') && lvl.blocs[i].o.hasOwnProperty('hp')) {
                            $('#gamearea > .common:last').append('<div id="hp-'+context.storage.currentLevel+'-'+lvl.blocs[i].i+'" class="hp"></div>');
                        }
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
                $('#gamearea').fadeOut(2000,function(){
                    window.scrollTo(0,0);
                    $('body').append('<div id="menu"><h1>G<span class="small">ame</span> O<span class="small">ver</span></h1><span id="start">Restart ?</span></div>');
                    $('#start').bind('click',function(){
                        window.location.reload();
                    });
                });
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
            x : 40,
            y : 480,
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
                    $('#info').html('vx:'+ this.vx + ' vy:'+this.vy + ' f:'+(this.floor || 'no') + ' <br/>c:'+(this.collide || 'no'));
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

                var i,btt,x,y,x2,y2;

                this.open.top = true;
                this.open.left = true;
                this.open.bot = true;
                this.open.right = true;
                this.floor = false;
                this.collide = false;

                for(i = 0 ; i < context.levels[context.storage.currentLevel].blocs.length ; i += 1) {
                    btt = context.levels[context.storage.currentLevel].blocs[i];
                    x = btt.x;
                    y = btt.y;
                    x2 = x+btt.w;
                    y2 = y+btt.h;
                    switch(btt.p) {
                        case 'breakable' :
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
                            if(btt.hasOwnProperty('o') && btt.o.hasOwnProperty('invincible')) {
                                if(btt.o.invincible === false ){
                                    if((this.x >= x && this.x <= x2) || (this.x+this.w >= x && this.x+this.w <= x2)) {
                                        if(this.y+this.h-this.vy <= y2 && this.y+this.h-this.vy >= y && this.vy < 0) {
                                            this.killMob(context,btt.i);
                                            break;

                                        }
                                    }
                                } 
                            }
                            else {
                                if((this.x >= x && this.x <= x2) || (this.x+this.w >= x && this.x+this.w <= x2)) {
                                    if(this.y+this.h-this.vy <= y2 && this.y+this.h-this.vy >= y && this.vy < 0) {
                                        this.killMob(context,btt.i);
                                        break;
                                    }
                                }
                            }
                        default :
                            if((this.x >= x && this.x <= x2) || (this.x+this.w >= x && this.x+this.w <= x2) || (x >= this.x && x <= this.x+this.w) || (x2 >= this.x && x2 <= this.x+this.w)) {
                                if(this.y <= y2 && this.y >= y ) {
                                    this.collide = [btt.i,btt.p,btt.c];
                                    break;
                                }
                            }

                            if((this.y >= y && this.y <= y2) || (this.y+this.h >= y && this.y+this.h <= y2) || (y >= this.y && y <= this.y+this.h) || (y2 >= this.y && y2 <= this.y+this.h)) {
                                if(this.x <= x2 && this.x >= x ) {
                                    this.collide = [btt.i,btt.p,btt.c];
                                    break;
                                }
                            }

                            if((this.x >= x && this.x <= x2) || (this.x+this.w >= x && this.x+this.w <= x2)  || (x >= this.x && x <= this.x+this.w) || (x2 >= this.x && x2 <= this.x+this.w)) {
                                if(this.y+this.h <= y2 && this.y+this.h >= y ) {
                                    this.collide = [btt.i,btt.p,btt.c];
                                    break;
                                }
                            }

                            if((this.y >= y && this.y <= y2) || (this.y+this.h >= y && this.y+this.h <= y2) || (y >= this.y && y <= this.y+this.h) || (y2 >= this.y && y2 <= this.y+this.h)) {
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
                } else if (this.vy < this.constants.vyMin) {
                    this.vy += 1;
                }
                
                if(context.keyboard.q && this.vx > this.constants.vxMin) {
                    this.vx -= 1;
                }
                else if(this.vx < 0) {
                    this.vx += 1;
                    this.dir = 'left';
                }
                
                if (context.keyboard.d && this.vx < this.constants.vxMax) {
                    this.vx += 1;
                }
                else if(this.vx > 0) {
                    this.vx -= 1;
                    this.dir = 'right';
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
                    if(this.vx > 0) {
                        $('#player').removeClass().addClass('state-'+this.state+'-right-step-'+(Math.ceil(this.step/10) || 1));
                        this.direction = 'right';
                    } else if (this.vx < 0) {
                        $('#player').removeClass().addClass('state-'+this.state+'-left-step-'+(Math.ceil(this.step/10) || 1));
                        this.direction = 'left';
                    } else {
                        $('#player').removeClass().addClass('state-'+this.state+'-'+this.direction+'-step-'+(Math.ceil(this.step/10) || 1));
                    }
                } else {
                    if(this.vx > 0) {
                        $('#player').removeClass().addClass('stateless-right-step-'+(Math.ceil(this.step/10) || 1));
                        this.direction = 'right';
                    } else if (this.vx < 0) {
                        $('#player').removeClass().addClass('stateless-left-step-'+(Math.ceil(this.step/10) || 1));
                        this.direction = 'left';
                    }
                }
            //                window.scrollTo((this.x-480), (this.y-540));
            //                if((this.x-480) > 40) {
            //                    $('#hp').css('left',(this.x-480)+'px');
            //                } else {
            //                    $('#hp').css('left','40px');
            //                }

            },
            showHeart : function(hp) {
                var i,hearts = '';
                for(i = 0 ; i < hp ; i += 1) {
                    hearts += '&hearts;';
                }
                return hearts;
            },
            killMob : function(context,i) {
                var j,move;
                for(j = 0 ; j < context.levels[context.storage.currentLevel].blocs.length ; j += 1) {
                    if(context.levels[context.storage.currentLevel].blocs[j].hasOwnProperty('o') && context.levels[context.storage.currentLevel].blocs[j].i === i) {
                        if(context.levels[context.storage.currentLevel].blocs[j].o.hasOwnProperty('hp')) {
                            if(!context.levels[context.storage.currentLevel].blocs[j].o.hasOwnProperty('mhp')) {
                                context.levels[context.storage.currentLevel].blocs[j].o.mhp = context.levels[context.storage.currentLevel].blocs[j].o.hp;
                            } 
                            context.levels[context.storage.currentLevel].blocs[j].o.hp -= 1;
                            move = 100 - (((context.levels[context.storage.currentLevel].blocs[j].o.mhp-context.levels[context.storage.currentLevel].blocs[j].o.hp)/context.levels[context.storage.currentLevel].blocs[j].o.mhp)*100 || 100);
                            $('#hp-'+context.storage.currentLevel+'-'+context.levels[context.storage.currentLevel].blocs[j].i).css('background-size',move+'% 100%');
                            if(context.levels[context.storage.currentLevel].blocs[j].o.hp === 0) {
                                this.removeMob(context,i);
                            } else {
                                this.vy = 10;
                            }
                        } else {
                            this.removeMob(context,i);
                        }
                    }
                    else if(context.levels[context.storage.currentLevel].blocs[j].i === i) {
                        this.removeMob(context,i);
                    }
                }
            },

            removeMob : function(context,i) {
                if (context.levels[context.storage.currentLevel].blocs[i - 1].hasOwnProperty('o') && context.levels[context.storage.currentLevel].blocs[i - 1].o.hasOwnProperty('loot')) {
                    var x = context.levels[context.storage.currentLevel].blocs[i - 1].x,y = context.levels[context.storage.currentLevel].blocs[i - 1].y,b, state = '';
                    context.levels[context.storage.currentLevel].blocs[i - 1] = context.levels[context.storage.currentLevel].blocs[i - 1].o.loot;
                    b = context.levels[context.storage.currentLevel].blocs[i - 1];
                    b.x = x;
                    b.y = y;
                    this.vy = 10;
                    $('#bloc-'+context.storage.currentLevel+'-'+i).addClass('dying');
                    $('#bloc-'+context.storage.currentLevel+'-'+i).fadeOut(500,function() {
                        $(this).remove();
                        
                        if(b.hasOwnProperty('o')) {
                            if(b.hasOwnProperty('state')) {
                                state = b.o.state;
                            }
                        }
                        $('#gamearea').append('<div id="bloc-'+context.storage.currentLevel+'-'+b.i+'" class="common '+b.c+' '+b.p+' '+state+'" style="top:'+y+'px;left:'+x+'px;width:'+b.w+'px;height:'+b.h+'px;display:none"></div>');
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
                        case 'equipable' :
                            this.equip(context);
                            break;
                        case 'openable' :
                            this.getThrough(context);
                            break;
                        case 'climbable' :
                            this.state = 'climb';
                            this.climb();
                            break;
                        case 'swimable' :
                            this.state = false;
                            this.swim(context);
                            break;
                        case 'toggable' :
                            this.toggle(context);
                            break;
                        case 'readable' :
                            this.read(context);
                            break;
                        case 'accelerator' :
                            this.accelerate(context);
                            break;
                    }
                } else {
                    if(this.state !== 'hurt') {
                        this.state = false;
                    }
                }
            },
            //do stuff for the hurtable
            getHurt : function(context) {
                if(!this.immune) {
                    this.hp -= 1;
                    $('#hp').remove();
                    $('#gamearea').prepend('<div id="hp">'+this.showHeart(this.hp)+'</div>');
                    if(this.hp === 0) {
                        context.game.gameOver(context);
                    }
                    this.immune = true;
                    this.state = 'hurt';

                    var that = this;
                    setTimeout(function(){
                        if(that.immune) {
                            that.immune = false;
                            that.state = false;
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
                for(i = 0 ; i < context.levels[context.storage.currentLevel].blocs.length ; i += 1) {
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
            //do stuff for the equipable
            equip : function(context) {
                this.collide[3] = 'equipable';
                this.equiped = this.collide[2];
                this.collect(context);
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
            accelerate : function(context) {
                if(context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].hasOwnProperty('o')){
                    if(context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.hasOwnProperty('vy'))
                    {
                        this.vy = context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.vy;
                    }
                    if(context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.hasOwnProperty('vx'))
                    {
                        this.vx = context.levels[context.storage.currentLevel].blocs[(this.collide[0] -1)].o.vx;
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
                var i,helper = [], store = [], item,itemName = '',itemInfo = '', htmlInventory = '',empty = true;
                for(i = 0 ; i < this.inventory.length ; i+= 1) {
                    if(helper.indexOf(this.inventory[i][2]) === -1) {
                        helper.push(this.inventory[i][2]);
                        if(!this.inventory[i][3]) {
                            store[this.inventory[i][2]] = 1;
                        } else {
                            store[this.inventory[i][2]] = -1;
                        }
                    } else {
                        store[this.inventory[i][2]] += 1;
                    }
                }
                for(item in store) {
                    if(store.hasOwnProperty(item)) {
                        if (store[item] > 1) {
                            itemName = item+'s';
                            itemInfo = ' : ' + store[item];
                        } else {
                            itemName = item;
                        }
                        if(store[item] === -1 && this.equiped !== item) {
                            htmlInventory += '<div class="itemEquipable '+item+'Equip"><div class="itemImage '+item+'"></div>'+itemName+itemInfo+'</div><br/>';
                        } else if(store[item] === -1 && this.equiped === item) {
                            htmlInventory += '<div class="itemEquiped '+item+'Equip"><div class="itemImage '+item+'"></div>'+itemName+itemInfo+'</div><br/>';
                        } else {
                            htmlInventory += '<div class="item"><div class="itemImage '+item+'"></div>'+itemName+itemInfo+'</div><br/>';
                        }
                        itemName = '';
                        itemInfo = '';
                        empty = false;
                    }
                }
                if(!empty) {
                    $('#gamearea').append('<div id="inventory">'+htmlInventory+'</div>');
                } else {
                    this.closeInventory(context);
                }
            },
            closeInventory : function(context) {
                $('#inventory').remove();
                context.storage.running = true;
            },
            useItem : function(context) {
                if(this.equiped && context.storage.running) {
                    switch(this.equiped) {
                        case 'hammer' :
                            this.useHammer(context);
                            break;
                        case 'coin2' :
                            this.useCoin(context);
                            break;
                    }
                }
            },
            useHammer : function(context) {
                var i,o = 0,targetX,targetY,bloc;
                if (this.dir === 'right') {
                    o += this.w/2 +this.w;
                    if($('#anim').length === 0) {
                        $('#player').append('<div id="anim" style="position:absolute;left:14px;width :15px;height:15px;-moz-transform: scaleX(-1);" class="hammer"></div>');
                        
                        $('#anim').delay(250).animate({
                            left:'+=15'
                        },250).queue(function(){
                            $(this).remove();
                        });
                    }
                } else {
                    o -= this.w/2;
                    if($('#anim').length === 0) {
                        $('#player').append('<div id="anim" style="position:absolute;left:-13px;width :15px;height:15px;" class="hammer"></div>');
                        
                        $('#anim').delay(250).animate({
                            left:'-=15'
                        },250).queue(function(){
                            $(this).remove();
                        });
                    } 
                }
                targetX = this.x + o;
                targetY = this.y + (this.h/2);
                for(i = 0 ; i < context.levels[context.storage.currentLevel].blocs.length ; i += 1) {
                    
                    bloc = context.levels[context.storage.currentLevel].blocs[i];
                    if(bloc.p === 'breakable' && !bloc.hasOwnProperty('o')) {
                        if(bloc.x < targetX && (bloc.x+bloc.w) > targetX && bloc.y < targetY && (bloc.y+bloc.h) > targetY) {
                            $('#bloc-'+context.storage.currentLevel+'-'+bloc.i).remove();
                            context.levels[context.storage.currentLevel].blocs[i] = {};
                        }
                    } else if (bloc.p === 'breakable' && bloc.hasOwnProperty('o')) {
                        if(bloc.x < targetX && (bloc.x+bloc.w) > targetX && bloc.y < targetY && (bloc.y+bloc.h) > targetY) {

                            if(!bloc.o.hasOwnProperty('hp')) {
                                bloc.o.hp = bloc.o.mhp -1;
                                $('#bloc-'+context.storage.currentLevel+'-'+bloc.i).css('opacity',(bloc.o.hp/bloc.o.mhp));
                            } else if (bloc.o.hp > 0){
                                bloc.o.hp -= 1;
                                $('#bloc-'+context.storage.currentLevel+'-'+bloc.i).css('opacity',(bloc.o.hp/bloc.o.mhp));
                            }
                            if(bloc.o.hp === 0) {
                                $('#bloc-'+context.storage.currentLevel+'-'+bloc.i).remove();
                                context.levels[context.storage.currentLevel].blocs[i] = {};
                            }
                        }
                    }
                }
            },
            useCoin : function(context) {
            }
        },
        //contains method usable if a bloc contains the m optionnal property
        movable : {
            monitor : function(context) {
                var i,bloc;
                for(i = 0 ; i < context.levels[context.storage.currentLevel].blocs.length ; i += 1) {
                    if(context.levels[context.storage.currentLevel].blocs[i].hasOwnProperty('m')) {
                        bloc = context.levels[context.storage.currentLevel].blocs[i];
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
                for(i = 0 ; i < bloc.m.steps.length ; i +=1) {
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
                var i;
                for(i = 0 ; i < bloc.m.steps.length ; i +=1) {
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
        //contains method usable if a level contains a trigger property
        trigger : {
            monitor : function(context) {
                var i;
                if(context.levels[context.storage.currentLevel].hasOwnProperty('triggers')) {
                    for(i = 0 ; i < context.levels[context.storage.currentLevel].triggers.length ; i += 1) {
                        if(typeof context.levels[context.storage.currentLevel].triggers[i] === 'function') {
                            if(context.levels[context.storage.currentLevel].triggers[i](context)) {
                                context.levels[context.storage.currentLevel].triggers[i] = {};
                            } 
                        }
                    }
                }
            }
        },
        //world constants, usefull if you change the players one and want to revert them, dont edit these props !!!
        //they are supposed to be read only
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
        //store the key pressed if false; the key is up, else the key is down
        keyboard :  {
            q : false,
            s : false,
            d : false
        },
        // levels : [{level},{level},...]
        // level : |name,|blocs : [{bloc},{bloc},...]
        // bloc : i(blocId),c(blocCssClass),p(blocProperty[blocking|hurtable|collectable|openable|climable|swimable|toggable|readable]),x,y,w,h|,o|,m|
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
                y : 00,
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
                y : 479,
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
                },
                o : {
                    hp : 2
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
                x : 610,
                y : 95,
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
                y : 480,
                x : 840,
                w : 30,
                h : 30,
                o : {
                    state : 'on',
                    on : function(context){
                        context.storage.running = false;
                        $('#bloc-0-12,#bloc-0-10,#player').animate({
                            'top':'-=390'
                        },1000,function(){
                            context.levels[0].blocs[11].y = 120;
                            context.levels[0].blocs[9].y = 90;
                            context.player.y = 89;
                            context.storage.running = true;
                        });
                    },
                    off : function(context){
                        context.storage.running = false;
                        $('#bloc-0-12,#bloc-0-10,#player').animate({
                            'top':'+=390'
                        },1000,function(){
                            context.levels[0].blocs[11].y = 510;
                            context.levels[0].blocs[9].y = 480;
                            context.player.y = 479;
                            context.storage.running = true;
                        });
                    }
                }
            },{
                i : 11,
                c : 'grass',
                p : 'blocking',
                x : 570,
                y : 120,
                w : 360,
                h : 30
            },{
                i : 12,
                c : 'smallBloc',
                p : 'blocking',
                x : 810,
                y : 510,
                w : 90,
                h : 30
            },{
                i : 13,
                c : 'wall',
                p : 'blocking',
                x : 570,
                y : 30,
                w : 30,
                h : 90
            },{
                i : 14,
                c : 'sign',
                p : 'readable',
                x : 370,
                y : 480,
                w : 30,
                h : 30,
                o : {
                    step : 0,
                    text : ['Closed !!']
                }
            }],
            triggers : [
            function(context){
                //make a test, if true the function will be cleared
                //if false the test will exec again & again until the requirement is meet
                if(context.player.hp === 1) {
                    //alert('warning almost no hp !!');
                    return true;
                } else {
                    return false;
                }
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
                    x : 40,
                    y : 480,
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
                c : 'ghost_water',
                p : 'hurtable',
                x : 550,
                y : 400,
                w : 30,
                h : 30,
                m : {
                    length : 200,
                    steps : [{
                        start : 0,
                        end : 50,
                        vx : 3,
                        vy : -1
                    },{
                        start : 50,
                        end : 100,
                        vx : 3,
                        vy : 1
                    },{
                        start : 100,
                        end : 150,
                        vx : -3,
                        vy : -1
                    },{
                        start : 150,
                        end : 200,
                        vx : -3,
                        vy : 1
                    }]
                }
            }]
        },{
            name : 'level 3',
            blocs : [{
                i : 1,
                c : 'wall',
                p : 'blocking',
                x : 0,
                y : 0,
                w : 30,
                h : 510
            },{
                i : 2,
                c : 'grass',
                p : 'blocking',
                x : 0,
                y : 510,
                w : 360,
                h : 30
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
                c : 'ceil',
                p : 'blocking',
                x : 30,
                y : 0,
                w : 900,
                h : 30
            },{
                i : 5,
                c : 'grass-wall',
                p : 'blocking',
                x : 360,
                y : 420,
                w : 90,
                h : 120
            },{
                i : 6,
                c : 'grass-wall',
                p : 'blocking',
                x : 450,
                y : 330,
                w : 90,
                h : 210
            },{
                i : 7,
                c : 'grass',
                p : 'blocking',
                x : 540,
                y : 510,
                w : 420,
                h : 30
            },{
                i : 8,
                c : 'grass',
                p : 'blocking',
                x : 540,
                y : 330,
                w : 315,
                h : 30
            },{
                i : 9,
                c : 'ladder',
                p : 'climbable',
                x : 885,
                y : 330,
                w : 15,
                h : 180
            },{
                i : 10,
                c : 'door',
                p : 'openable',
                x : 570,
                y : 450,
                w : 30,
                h : 60,
                o : {
                    state : 'open',
                    x : 54,
                    y : 100
                }
            },{
                i : 11,
                c : 'grass',
                p : 'blocking',
                x : 30,
                y : 150,
                w : 900,
                h : 30
            },{
                i : 12,
                c : 'door',
                p : 'openable',
                x : 45,
                y : 90,
                w : 30,
                h : 60,
                o : {
                    state : 'open',
                    x : 577,
                    y : 480
                }
            },{
                i : 13,
                c : 'coin',
                p : 'collectable',
                x : 120,
                y : 120,
                w : 15,
                h : 15
            },{
                i : 14,
                c : 'coin',
                p : 'collectable',
                x : 140,
                y : 120,
                w : 15,
                h : 15
            },{
                i : 15,
                c : 'coin',
                p : 'collectable',
                x : 160,
                y : 120,
                w : 15,
                h : 15
            },{
                i : 16,
                c : 'coin',
                p : 'collectable',
                x : 180,
                y : 120,
                w : 15,
                h : 15
            },{
                i : 17,
                c : 'hammer',
                p : 'equipable',
                x : 850,
                y : 120,
                w : 15,
                h : 15
            },{
                i : 18,
                c : 'door open',
                p : 'openable',
                x : 890,
                y : 90,
                w : 30,
                h : 60,
                o : {
                    state : 'open',
                    x : 52,
                    y : 120,
                    level : 3
                }
            },{
                i : 19,
                c : 'crate',
                p : 'breakable',
                x : 800,
                y : 120,
                w : 30,
                h : 30,
                o : {
                    mhp : 10
                }
            }]
        },{
            name : 'level four',
            blocs : [{
                i : 1,
                c : 'wall',
                p : 'blocking',
                x : 0,
                y : 0,
                w : 30,
                h : 510
            },{
                i : 2,
                c : 'wall',
                p : 'blocking',
                x : 930,
                y : 0,
                w : 30,
                h : 510
            },{
                i : 3,
                c : 'ceil',
                p : 'blocking',
                x : 30,
                y : 0,
                w : 900,
                h : 30
            },{
                i : 4,
                c : 'ceil',
                p : 'blocking',
                x : 30,
                y : 150,
                w : 120,
                h : 30
            },{
                i : 5,
                c : 'grass',
                p : 'blocking',
                x : 0,
                y : 510,
                w : 960,
                h : 30
            },{
                i : 6,
                c : 'water',
                p : 'swimable',
                x : 30,
                y : 255,
                w : 900,
                h : 255
            },{
                i : 7,
                c : 'door open',
                p : 'openable',
                x : 60,
                y : 90,
                w : 30,
                h : 60
            },{
                i : 8,
                c : 'water',
                p : 'accelerator',
                x : 30,
                y : 135,
                w : 150,
                h : 15,
                o : {
                    vx : 3
                }
            },{
                i : 9,
                c : 'water',
                p : 'accelerator',
                x : 150,
                y : 135,
                w : 30,
                h : 120,
                o : {
                    vy : -3
                }
            },{
                i : 10,
                c : 'wall',
                p : 'blocking',
                x : 420,
                y : 30,
                w : 30,
                h : 420
            },{
                i : 11,
                c : 'ceil',
                p : 'blocking',
                x : 450,
                y : 345,
                w : 450,
                h : 30
            },{
                i : 12,
                c : 'ladder',
                p : 'climbable',
                x : 510,
                y : 150,
                w : 15,
                h : 195
            },{
                i : 13,
                c : 'grass',
                p : 'blocking',
                x : 540,
                y : 150,
                w : 390,
                h : 30
            },{
                i : 14,
                c : 'crate',
                p : 'breakable',
                x : 420,
                y : 450,
                w : 30,
                h : 60,
                o : {
                    mhp : 5
                }
            },{
                i : 15,
                c : 'ghost_water',
                p : 'hurtable',
                x : 50,
                y : 400,
                w : 30,
                h : 30,
                m : {
                    length : 200,
                    steps : [{
                        start : 0,
                        end : 50,
                        vx : 3,
                        vy : -1
                    },{
                        start : 50,
                        end : 100,
                        vx : 3,
                        vy : 1
                    },{
                        start : 100,
                        end : 150,
                        vx : -3,
                        vy : -1
                    },{
                        start : 150,
                        end : 200,
                        vx : -3,
                        vy : 1
                    }]
                }
            },{
                i : 16,
                c : 'ghost_water',
                p : 'hurtable',
                x : 520,
                y : 400,
                w : 30,
                h : 30,
                m : {
                    length : 200,
                    steps : [{
                        start : 0,
                        end : 50,
                        vx : 3,
                        vy : -1
                    },{
                        start : 50,
                        end : 100,
                        vx : 3,
                        vy : 1
                    },{
                        start : 100,
                        end : 150,
                        vx : -3,
                        vy : -1
                    },{
                        start : 150,
                        end : 200,
                        vx : -3,
                        vy : 1
                    }]
                }
            },{
                i : 17,
                c : 'ghost',
                p : 'hurtable',
                x : 605,
                y : 115,
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
                },
                o : {
                    hp : 3
                }
            },{
                i : 18,
                c : 'door open',
                p : 'openable',
                x : 875,
                y : 90,
                w : 30,
                h : 60,
                o : {
                    state : 'open',
                    x : 54,
                    y : 200,
                    level : 4
                }
            }]
        },{
            blocs : [{
                i : 1,
                c : 'wall',
                p : 'blocking',
                x : 930,
                y : 0,
                w : 30,
                h : 510
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
                c : 'grass',
                p : 'blocking',
                x : 0,
                y : 510,
                w : 960,
                h : 30
            },{
                i : 4,
                c : 'ceil',
                p : 'blocking',
                x : 30,
                y : 0,
                w : 900,
                h : 30
            },{
                i : 5,
                c : 'ceil',
                p : 'blocking',
                x : 30,
                y : 330,
                w : 60,
                h : 30
            },{
                i : 6,
                c : 'ceil',
                p : 'blocking',
                x : 870,
                y : 330,
                w : 60,
                h : 30
            },{
                i : 7,
                c : 'ladder',
                p : 'climbable',
                x : 105,
                y : 330,
                w : 15,
                h : 180
            },{
                i : 8,
                c : 'ladder',
                p : 'climbable',
                x : 840,
                y : 330,
                w : 15,
                h : 180
            },{
                i : 9,
                c : 'door',
                p : 'openable',
                x : 45,
                y : 270,
                w : 30,
                h : 60,
                o : {
                    state : 'closed'
                }
            },{
                i : 10,
                c : 'boss',
                p : 'hurtable',
                x : 220,
                y : 420,
                w : 90,
                h : 90,
                m : {
                    length : 280,
                    steps : [{
                        vx : 4,
                        start : 0,
                        end : 110
                    },{
                        vx : 0,
                        start : 110,
                        end : 140
                    },{
                        vx : -4,
                        start : 140,
                        end : 250
                    },{
                        vx : 0,
                        start : 250,
                        end : 280
                    }]
                },
                o : {
                    hp : 10
                }
            }],
            triggers : [
                function(context){
                    if(!context.levels[context.storage.currentLevel].blocs[9].hasOwnProperty('i')) {
                        //chargé prochain lvl ?
                        return true;
                    } else {
                        return false;
                    }
                }
            ]
        }],
        debug : false,
        microtime : false
    };

    main.autoExec();

    $(document).keypress(function(event){
        switch(event.which) {
            case 122 : //z
                if(main.player.floor) {
                    main.player.vy = main.player.constants.vyMax;
                }
                else if(!main.player.constants.jumpLimit) {
                    main.player.vy = main.player.constants.vyMax;
                }
                break;

            case 101 : //e
                main.player.toggleInventory(main);
                break;
            case 32 : //space
                main.player.useItem(main);
                return false;
        }
    });

    $(document).keydown(function(event){
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

    $(document).keyup(function(event){
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

    $('.itemEquipable').live('click', function() {
        var item = $(this).attr('class').split(' ')[1].split('E')[0];
        main.player.equiped = item;
        main.player.toggleInventory(main);
        main.player.toggleInventory(main);
    //TODO remove the double toggle hack
    //$('.itemEquiped').removeClass().addClass('itemEquipable '+$(this).attr('class').split(' ')[1]);
    //$(this).removeClass().addClass('itemEquiped '+$(this).html());

    });
    
});
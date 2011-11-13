/*
 * basic storage, once the game is loaded the whole json is clone in lib.js
 */

window.basePlayer = {
    reset : function(context) {
        context.player.vx = 0;
        context.player.vy = 0;
        context.player.x = 40;
        context.player.y = 480;
        context.player.w = 16;
        context.player.h = 26;
        context.player.mhp = 3;
        context.player.hp = 3;
        context.player.xp = 0;
        context.player.immune = false;
        context.player.floor = false;
        context.player.collide = false;
        context.player.inventory = [];
		context.player.inventory.contains = function (thing) {
			var i = 0,inv = context.player.inventory, length = inv.length;
			for(i; i < length ; i += 1) {
				if(inv[i][2] === thing) {
					return true
				}
			}
			return false;
		},
		context.player.inventory.containsMany = function (thing,number) {
			var count = 0,i = 0,inv = context.player.inventory, length = inv.length;
			for(i; i < length ; i += 1) {
				if(inv[i][2] === thing ) {
					count += 1;
				}
			}
			if (count === number) {
				return true;
			}
			return false;
		}
    }
}

window.baseLevel = {
    init : function(context){
        context.levels = [{
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
            },function(context){
                //make a test, if true the function will be cleared
                //if false the test will exec again & again until the requirement is meet
                if(context.levels[0].blocs[6].o.state === 'open') {
                    context.levels[0].blocs[13].o.text[0] = 'Open !!';
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
                c : 'door closed',
                p : 'openable',
                x : 890,
                y : 90,
                w : 30,
                h : 60,
				o : {
                    state : 'closed',
                    required : 'hammer',
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
            },{
				i:11,
				c:'wall',
				p:'blocking',
				x:0,
				y:510,
				w:30,
				h:540
			},{
				i:12,
				c:'wall',
				p:'blocking',
				x:930,
				y:510,
				w:30,
				h:540
			},{
				i:13,
				c:'grass',
				p:'blocking',
				x:0,
				y:1050,
				w:960,
				h:30
			}],
            triggers : [
            function(context){
                if(!context.levels[context.storage.currentLevel].blocs[9].hasOwnProperty('i')) {
                    //chargé prochain lvl ?
					context.levels[context.storage.currentLevel].blocs[2] = {};
					$('#bloc-4-3').fadeOut('fast');
					window.scrollTo(0,570)
                    return true;
                } else {
                    return false;
                }
            }
            ]
        }]
    }
};

window.env = {
	scroll : function (step) {
		var that = this;
		step = step || 0;
		if(step < 570) {
			step += 10;
			window.scrollTo(0,step)
			setTimeout(function(){that.scroll(step)},13);
		}
	},
	lightOn : function() {
		$('.lightOff').remove();
	},
	lightOff : function() {
		$('#gamearea').append('<div class="lightOff"></div>');
	}
}